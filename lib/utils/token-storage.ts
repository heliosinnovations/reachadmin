import Cookies from 'js-cookie'

const ACCESS_TOKEN_KEY = 'reach_admin_access_token'
const REFRESH_TOKEN_KEY = 'reach_admin_refresh_token'

export const tokenStorage = {
  setTokens(tokens: { accessToken: string; refreshToken: string }) {
    Cookies.set(ACCESS_TOKEN_KEY, tokens.accessToken, { expires: 1 / 24 }) // 1 hour
    Cookies.set(REFRESH_TOKEN_KEY, tokens.refreshToken, { expires: 7 }) // 7 days
  },

  getAccessToken(): string | undefined {
    return Cookies.get(ACCESS_TOKEN_KEY)
  },

  getRefreshToken(): string | undefined {
    return Cookies.get(REFRESH_TOKEN_KEY)
  },

  hasTokens(): boolean {
    return !!(this.getAccessToken() && this.getRefreshToken())
  },

  clearTokens() {
    Cookies.remove(ACCESS_TOKEN_KEY)
    Cookies.remove(REFRESH_TOKEN_KEY)
  },
}
