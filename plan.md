# Platform Providers Architecture — X Ads API + Google Ads + Meta

## Overview

The campaign system is wired to the X Ads API so that launching, pausing, and resuming campaigns pushes changes to the actual ad platform. Google Ads is enabled for OAuth connection but campaign management requires a developer token from Google. Meta uses OAuth 2.0 with long-lived tokens.

---

## Authentication Architecture

### X (Twitter) — OAuth 1.0a

X uses **OAuth 1.0a** for all API calls — both organic (tweets) and the Ads API. A single set of OAuth 1.0a tokens works for everything.

**Two levels of credentials:**

| Credential | Scope | Where it lives |
|---|---|---|
| Consumer Key (API Key) | App-level, set by admin | `ad_platforms.oauth_client_id` |
| Consumer Secret (API Key Secret) | App-level, set by admin | `ad_platforms.oauth_client_secret` |
| Access Token | Per-user, obtained via OAuth | `platform_connections.access_token` |
| Access Token Secret | Per-user, obtained via OAuth | `platform_connections.access_token_secret` |

**OAuth 1.0a tokens do not expire.** No refresh flow needed.

**IMPORTANT — Credential confusion:**
The admin panel (`reachadmin`) stores credentials in `oauth_client_id` and `oauth_client_secret`. For X/Twitter, these must be the **API Key (Consumer Key)** and **API Key Secret (Consumer Secret)**, NOT the OAuth 2.0 Client ID/Secret. The admin form now shows the correct labels for X to prevent this confusion.

### Meta — OAuth 2.0

Meta continues to use OAuth 2.0 with long-lived tokens. No changes to the Meta flow.

### Google Ads — OAuth 2.0 (Connection Only)

Google Ads uses **OAuth 2.0** for account connection. Users can connect their Google Ads accounts via the standard Google OAuth flow.

**Two things needed for full functionality:**

| Credential | Purpose | Status |
|---|---|---|
| OAuth Client ID + Secret | User account connection | Configured via admin panel |
| Google Ads Developer Token | API calls (create/manage campaigns) | Requires Google approval |

**Without the developer token**, users can connect their Google accounts but the app cannot yet create or manage campaigns on their behalf.

**OAuth URLs:**
- Auth URL: `https://accounts.google.com/o/oauth2/v2/auth`
- Token URL: `https://oauth2.googleapis.com/token`
- Scope: `https://www.googleapis.com/auth/adwords`

**To get a developer token:**
1. Go to Google Ads → Tools & Settings → API Center
2. Apply for a developer token
3. Google reviews and approves it

---

## Admin Setup

### X (Twitter)

1. Create an X app at [developer.x.com](https://developer.x.com)
2. Enable **OAuth 1.0a** with **Read and Write** permissions
3. Set callback URL: `https://reachfe.vercel.app/dashboard/platforms/callback` (must be **https**)
4. Copy **API Key** (Consumer Key) and **API Key Secret** (Consumer Secret) — found under "Keys and tokens" → "Consumer Keys"
5. In the admin panel, edit the X platform and enter these as "API Key (Consumer Key)" and "API Key Secret (Consumer Secret)"

**Common mistake:** Do not use the OAuth 2.0 Client ID/Secret — use the Consumer Keys (OAuth 1.0a).

### Google Ads

1. Go to [Google Cloud Console](https://console.cloud.google.com/apis/credentials)
2. Create OAuth 2.0 credentials (Web application type)
3. Add redirect URI: `https://reachfe.vercel.app/dashboard/platforms/callback`
4. In the admin panel, edit Google Ads and enter the Client ID and Client Secret
5. (Future) Get a Google Ads developer token for campaign management

### Meta

1. Create an app in [Meta Developer Portal](https://developers.facebook.com)
2. Set up Facebook Login with redirect URI: `https://reachfe.vercel.app/dashboard/platforms/callback`
3. In the admin panel, enter the App ID and App Secret

No per-user setup required for any platform. Users connect via OAuth from the dashboard.

---

## X Developer Portal Configuration

### Required settings:

- **OAuth 1.0a:** Enabled, with "Read and Write" permissions
- **Callback URI / Redirect URL:** `https://reachfe.vercel.app/dashboard/platforms/callback`
  - Also add `http://localhost:3001/dashboard/platforms/callback` for local dev
  - **Must use `https://` for production** — `http://` causes Vercel to redirect and strip query params
- **Website URL:** `https://reachfe.vercel.app`

The callback URL setting is found under: App → Settings → User authentication settings → Edit → App info section.

---

## User Connection Flow (X)

```
User clicks "Connect X"
        │
        ▼
Backend: POST twitter.com/oauth/request_token
  (signed with Consumer Key/Secret only)
  (oauth_callback = https://reachfe.vercel.app/dashboard/platforms/callback)
        │
        ▼
Backend returns authorize URL with temporary oauth_token
Backend stores oauth_token_secret in memory (10-min expiry)
        │
        ▼
User redirected to twitter.com/oauth/authorize
  User approves the app
        │
        ▼
X redirects to /dashboard/platforms/callback
  with oauth_token + oauth_verifier as query params
        │
        ▼
Frontend detects OAuth 1.0a params (not code),
  calls backend: GET /platforms/twitter/callback?oauth_token=...&oauth_verifier=...
        │
        ▼
Backend retrieves stored oauth_token_secret
Backend: POST twitter.com/oauth/access_token
  (exchanges verifier for permanent tokens)
        │
        ▼
Backend stores access_token + access_token_secret
        │
        ▼
Backend: GET ads-api.x.com/12/accounts
  (auto-discovers user's X Ads account)
        │
        ▼
Stores ads_account_id on the connection
        │
        ▼
Connection complete — ready for organic + ads
```

## User Connection Flow (Google Ads)

```
User clicks "Connect Google Ads"
        │
        ▼
Backend generates OAuth 2.0 URL with PKCE:
  - code_challenge (S256)
  - state (contains platformSlug, userId, codeVerifier)
  - scope: https://www.googleapis.com/auth/adwords
        │
        ▼
User redirected to accounts.google.com
  User approves the app
        │
        ▼
Google redirects to /dashboard/platforms/callback
  with code + state as query params
        │
        ▼
Frontend detects OAuth 2.0 params (code),
  parses state to get platformSlug,
  calls backend: GET /platforms/google_ads/callback?code=...&state=...
        │
        ▼
Backend exchanges code for access_token + refresh_token
  (using code_verifier from state for PKCE)
        │
        ▼
Backend gets Google account info
Backend stores connection with tokens
        │
        ▼
Connection complete
```

---

## X Ads Entity Hierarchy

```
Account → Funding Instrument → Campaign → Line Item → Promoted Tweet
```

Maps to our model:

| Our model | X Ads entity |
|---|---|
| Campaign | Campaign |
| AdSet | Line Item |
| Ad | Promoted Tweet |

### X Ads API v12

- **Base URL**: `https://ads-api.x.com/12/`
- **Budgets**: Micro-units (1 USD = 1,000,000)
- **Funding instrument**: Required — fetched automatically from the account
- **Targeting**: Separate POST to `/targeting_criteria` per line item

---

## Campaign Launch Flow

```
POST /api/v1/campaigns/:id/launch
        │
        ▼
For each ad set:
  1. Get platform + connection + provider
  2. Validate connection has OAuth 1.0a tokens + ads account
  3. Create campaign on X Ads (once per platform)
     → store platformCampaignId in campaign.metrics.platformCampaignIds
  4. Create line item on X Ads
     → store platformAdSetId on ad set
  5. For each ad:
     a. Create tweet via organic API (OAuth 1.0a)
     b. Promote tweet via Ads API
     → store platformAdId on ad
        │
        ▼
If all platforms fail → throw error
If partial success → warn and continue
```

### Pause/Resume

```
POST /api/v1/campaigns/:id/pause
  → PUT /campaigns/:id  { entity_status: PAUSED }  (once per platform)
  → PUT /line_items/:id  { entity_status: PAUSED }  (per ad set)

POST /api/v1/campaigns/:id/resume
  → PUT /campaigns/:id  { entity_status: ACTIVE }  (once per platform)
  → PUT /line_items/:id  { entity_status: ACTIVE }  (per ad set)
```

---

## Objective Mapping

| Our objective | X Ads objective | Google Ads (future) |
|---|---|---|
| sales | WEBSITE_CLICKS | SALES |
| leads | WEBSITE_CLICKS | LEADS |
| traffic | WEBSITE_CLICKS | WEBSITE_TRAFFIC |
| engagement | ENGAGEMENTS | PRODUCT_AND_BRAND_CONSIDERATION |
| app_promotion | APP_INSTALLS | APP_PROMOTION |
| awareness | REACH | BRAND_AWARENESS_AND_REACH |

---

## Multi-Platform Campaign IDs

A campaign can span multiple platforms. Per-platform campaign IDs are stored in the campaign's `metrics` JSONB:

```json
{
  "platformCampaignIds": {
    "twitter": "abc123"
  }
}
```

Per-platform ad set IDs are stored on `ad_sets.platform_ad_set_id`.
Per-platform ad IDs are stored on `ads.platform_ad_id`.

---

## Database Schema (Migration 005)

```sql
ALTER TABLE platform_connections
  ADD COLUMN access_token_secret TEXT,   -- OAuth 1.0a token secret
  ADD COLUMN ads_account_id TEXT;        -- Auto-discovered ads account

-- Google Ads (now enabled for OAuth connection)
INSERT INTO ad_platforms (name, slug, platform_type, is_enabled, ...)
VALUES ('Google Ads', 'google_ads', 'search', true, ...);

-- X platform config with Ads API info
UPDATE ad_platforms SET config = config || '{"adsApiBaseUrl": "https://ads-api.x.com/12/", "adsApiVersion": "12"}'
WHERE slug = 'twitter';
```

---

## File Structure

### New files

| File | Purpose |
|---|---|
| `migrations/005_campaign_providers.sql` | Schema changes + seeds |
| `src/utils/oauth1.util.ts` | RFC 5849 OAuth 1.0a HMAC-SHA1 signing |
| `src/core/interfaces/providers/campaign-provider.interface.ts` | ICampaignProvider interface |
| `src/providers/platforms/x-ads.campaign-provider.ts` | X Ads API v12 integration |
| `src/providers/platforms/google-ads.campaign-provider.ts` | Campaign stub (needs developer token) |
| `src/providers/platforms/google-ads.platform-provider.ts` | OAuth 2.0 connection provider |
| `src/providers/platforms/campaign-provider.factory.ts` | Factory: slug → provider |

### Modified files

| File | Changes |
|---|---|
| `src/core/types/platform.types.ts` | Added `accessTokenSecret`, `adsAccountId` to PlatformConnection |
| `src/core/interfaces/providers/platform-provider.interface.ts` | Added optional `tokenSecret` to API methods |
| `src/repositories/platform-connection.repository.ts` | Map new columns |
| `src/providers/platforms/x.platform-provider.ts` | Full OAuth 1.0a rewrite (request_token, all API calls signed) |
| `src/providers/platforms/meta.platform-provider.ts` | Added unused `tokenSecret` params for interface compliance |
| `src/providers/platforms/platform-provider.factory.ts` | Added `google_ads` → `GoogleAdsPlatformProvider` |
| `src/services/campaign.service.ts` | launch/pause/resume push to platform APIs |
| `src/services/platform-connection.service.ts` | OAuth 1.0a flow for X, auto-discover ads account |
| `src/services/post.service.ts` | Pass `tokenSecret` to publishPost/getPostMetrics |
| `src/api/controllers/platform-connection.controller.ts` | Handle `oauth_token`/`oauth_verifier` query params |
| `reach_fe/lib/types/platform.types.ts` | Added `adsAccountId`, `hasAdsCredentials` |
| `reach_fe/components/dashboard/campaigns/step-platform-select.tsx` | Warning when platform lacks ads credentials |
| `reachadmin/components/admin/platform-form.tsx` | Platform-specific labels (X: API Key, Google: Client ID) |

---

## Frontend Behavior

### Platform list
- Connected platforms show `hasAdsCredentials: true/false` based on whether the OAuth flow successfully discovered an ads account.

### Campaign wizard (step-platform-select)
- If a selected platform has `hasAdsCredentials: false`, an amber warning badge appears on the platform tile.
- A banner warns: "Some selected platforms don't have ads API credentials configured. Campaigns won't be pushed to those platforms until credentials are set."

### No manual credential entry
- There is no modal or form for manually entering OAuth tokens.
- Everything is handled automatically during the OAuth connection flow.

### Admin form (reachadmin)
- Shows platform-specific labels and hints:
  - **X/Twitter:** "API Key (Consumer Key)" / "API Key Secret (Consumer Secret)" with amber warning about OAuth 1.0a
  - **Google Ads:** "Client ID" / "Client Secret" with blue info about Google Cloud Console
  - **Other platforms:** Generic "Client ID" / "Client Secret" labels

---

## Request Signing

All X API requests (organic + ads) are signed with OAuth 1.0a HMAC-SHA1:

```
Authorization: OAuth
  oauth_consumer_key="...",
  oauth_nonce="...",
  oauth_signature="...",
  oauth_signature_method="HMAC-SHA1",
  oauth_timestamp="...",
  oauth_token="...",
  oauth_version="1.0"
```

The signature base string is constructed per RFC 5849:
```
HMAC-SHA1(
  key = percentEncode(consumerSecret) & percentEncode(tokenSecret),
  data = METHOD & percentEncode(URL) & percentEncode(sortedParams)
)
```

Implementation: `src/utils/oauth1.util.ts`

---

## Deployment

### Three apps to deploy:

| App | Hosting | Deploy Method |
|---|---|---|
| `reach_be` (backend) | Digital Ocean App Platform | `doctl apps create-deployment <app-id>` |
| `reach_fe` (user frontend) | Vercel | `cd reach_fe && vercel --prod` |
| `reachadmin` (admin panel) | Vercel | `cd reachadmin && vercel --prod` |

**Auto-deploy is disabled.** Deployments must be triggered manually.

### Backend (Digital Ocean)

```bash
# From reach_be directory
git add . && git commit -m "fix: description" && git push origin main

# Then trigger deployment
doctl apps create-deployment ab772d9c-660c-497c-ac8b-0cc7802867c3

# Check deployment status
doctl apps get-deployment ab772d9c-660c-497c-ac8b-0cc7802867c3 <deployment-id>
```

### Frontend (Vercel)

```bash
cd /Users/helios/src/reach_fe && vercel --prod
cd /Users/helios/src/reachadmin && vercel --prod
```

### Rollback

If a deployment causes issues:
1. Go to Digital Ocean dashboard → Apps → reach_be → Activity
2. Find the previous successful deployment
3. Click "Rollback to this deployment"

### Known Limitation: In-Memory OAuth Token Store

The OAuth 1.0a request token secrets are stored in-memory. This means:
- **Server restart during OAuth flow** = user must retry connection
- **Multiple app instances** = OAuth flow may fail if requests hit different instances

Future improvement: Move token secret storage to Redis or database with TTL.

---

## Current Platform Status

| Platform | OAuth Connection | Campaign Management | Notes |
|---|---|---|---|
| X (Twitter) | Working (OAuth 1.0a) | Working (X Ads API v12) | Fully functional |
| Google Ads | Working (OAuth 2.0) | Stub (needs developer token) | Users can connect, campaigns blocked until developer token obtained |
| Meta | Ready (OAuth 2.0) | Not yet implemented | Connection works, campaign provider needed |

---

## Troubleshooting

### X Connection — "Failed to start connection"
- **Cause:** Wrong credentials in database. OAuth 2.0 Client ID/Secret was used instead of OAuth 1.0a API Key/Secret.
- **Fix:** Update `ad_platforms` table with the correct API Key and API Key Secret from X Developer Portal → "Keys and tokens" → "Consumer Keys".

### X Connection — "No authorization code received"
- **Cause:** Callback URL in X Developer Portal used `http://` instead of `https://`. Vercel redirects http→https, stripping query parameters.
- **Fix:** Change callback URL to `https://reachfe.vercel.app/dashboard/platforms/callback`.

### X Connection — "OAuth session expired"
- **Cause:** Backend restarted between getAuthUrl and callback, losing the in-memory token secret.
- **Fix:** User retries connection. Future fix: use Redis/database for token secret storage.

### Google Ads — "An unexpected error occurred"
- **Cause:** OAuth scopes in the database only included `adwords` scope. The `getAccountInfo` call uses Google's userinfo endpoint, which requires `openid`, `email`, `profile` scopes. Also, the scope separator was comma (`,`) but Google requires space-separated scopes.
- **Fix:** Added `openid`, `email`, `profile` scopes to the database alongside `adwords`. Fixed scope separator to use space for Google. Added `access_type=offline` and `prompt=consent` params so Google returns a refresh token.

### Frontend changes not taking effect
- **Cause:** Deployments are manual. Pushing to GitHub does not auto-deploy.
- **Fix:** Run `vercel --prod` from the appropriate directory, or `doctl apps create-deployment` for backend.

---

## Database Credentials (Supabase)

- **Project URL:** `https://wylxjyaeoqmbxpewlsyb.supabase.co`
- **Backend API:** `https://reach-backend-4xm4r.ondigitalocean.app`
- **Frontend:** `https://reachfe.vercel.app`
- **Admin Panel:** `https://reachadmin.vercel.app`

---

## Repository Locations

```
/Users/helios/src/reach_be     — Backend (Express + TypeScript)
/Users/helios/src/reach_fe     — User frontend (Next.js)
/Users/helios/src/reachadmin   — Admin panel (Next.js)
```
