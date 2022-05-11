// **  Initial State
const initialState = {
  sportsData: [],
  betSlipType: "single",
  betSlipData: {},
  betId: null
}

const sportsReducer = (state = initialState, action) => {
  switch (action.type) {
    case 'APPROVED_ODDS':
      return {
        ...state,
        betSlipData: action.data
      }
    case 'ACCEPT_ODDS':
      return {
        ...state,
        betSlipData: action.data
      }
    case 'CHANGE_ODDS':
      return {
        ...state,
        betSlipData: action.data
      }
    case 'SET_BET_ID':
      return {
        ...state,
        betId: action.data
      }
    case 'REMOVE_ALL_BET_SLIP_DATA':
      return {
        ...state,
        betSlipData: action.data,
        betSlipType: "single",
        betId: null
      }
    case 'REMOVE_BET_SLIP_DATA':
      return {
        ...state,
        betSlipData: action.data,
        betId: null
      }
    case 'ADD_BET_SLIP_DATA':
      return {
        ...state,
        betSlipData: { ...state.betSlipData, ...action.data },
        betId: null
      }
    case 'GET_SPORTS_DATA':
      return {
        ...state,
        sportsData: action.data
      }
    case 'CHANGE_BET_SLIP_TYPE':
      return {
        ...state,
        betSlipType: action.data,
        betId: null
      }
    default:
      return state
  }
}

export default sportsReducer
