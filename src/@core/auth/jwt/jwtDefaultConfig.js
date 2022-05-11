import { mainConfig } from '../../../configs/mainConfig'

// ** Auth Endpoints
export default {
  loginEndpoint: `${mainConfig.server.request_url}/auth/login`,
  registerEndpoint: `${mainConfig.server.request_url}/auth/register`,
  refreshEndpoint: `${mainConfig.server.request_url}/auth/refresh-token`,
  logoutEndpoint: `${mainConfig.server.request_url}/auth/logout`,

  // ** This will be prefixed in authorization header with token
  // ? e.g. Authorization: Bearer <token>
  tokenType: 'Bearer',

  // ** Value of this property will be used as key to store JWT token in storage
  storageTokenKeyName: 'accessToken',
  storageRefreshTokenKeyName: 'refreshToken'
}
