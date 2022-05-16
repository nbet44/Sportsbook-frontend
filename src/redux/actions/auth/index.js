// ** UseJWT import to get config
import useJwt from '@src/auth/jwt/useJwt'
import { mainConfig } from '@configs/mainConfig'
import io from 'socket.io-client'

const config = useJwt.jwtConfig

// ** Handle User Logout
export const handleLogout = () => {
  return dispatch => {
    dispatch({ type: 'LOGOUT', [config.storageTokenKeyName]: null, [config.storageRefreshTokenKeyName]: null })
    // ** Remove user, accessToken & refreshToken from localStorage
    localStorage.removeItem('userData')
    localStorage.removeItem('isFirst')
    localStorage.removeItem(config.storageTokenKeyName)
    localStorage.removeItem(config.storageRefreshTokenKeyName)
    localStorage.clear()
    window.location.href = "/login"
  }
}

export const handleSession = (data) => {
  return dispatch => {
    localStorage.setItem('userData', JSON.stringify(data))
    dispatch({
      type: 'SESSION',
      data
    })
  }
}

export const socketInit = () => {
  return async (dispatch, getState) => {
    const user = getState().auth.userData
    mainConfig.socket = io.connect(mainConfig.server.socket_url,
      {
        transports: ['websocket'],
        reconnectionAttempts: 1,
        reconnectionDelay: 10000,
        timeout: 10000,
        query: { roomName: user._id ? user._id : null }
      })

    mainConfig.socket.on("destory", () => {
      dispatch(handleLogout())
    })

  }
}

// ** Handle User Login
export const handleLogin = data => {
  return dispatch => {
    dispatch({
      type: 'LOGIN',
      data,
      config,
      [config.storageTokenKeyName]: data[config.storageTokenKeyName],
      [config.storageRefreshTokenKeyName]: data[config.storageRefreshTokenKeyName]
    })
    dispatch(socketInit())

    // ** Add to user, accessToken & refreshToken to localStorage
    localStorage.setItem('userData', JSON.stringify(data))
    localStorage.setItem(config.storageTokenKeyName, JSON.stringify(data.accessToken))
    localStorage.setItem(config.storageRefreshTokenKeyName, JSON.stringify(data.refreshToken))
    localStorage.setItem('isFirst', JSON.stringify(true))
  }
}