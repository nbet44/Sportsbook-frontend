// ** Redux Imports
import { combineReducers } from 'redux'

// ** Reducers Imports
import auth from './auth'
import sports from './sports'
import navbar from './navbar'
import layout from './layout'

const rootReducer = combineReducers({
  sports,
  auth,
  navbar,
  layout
})

export default rootReducer
