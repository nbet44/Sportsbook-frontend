import { toast } from "react-toastify"

export const approvedBetSlipData = (data, result) => {
    for (const i in result) {
        if (data[result[i].id]) {
            data[result[i].id].betId = result[i].betId
        }
    }
    return dispatch => {
        dispatch({
            data: { ...data },
            type: "APPROVED_ODDS"
        })
        return true
    }
}

export const acceptBetSlipData = (data) => {
    for (const i in data) {
        if (data[i].isOddChanged) {
            data[i].isOddChanged = false
        }
    }
    return dispatch => {
        dispatch({
            data,
            type: "ACCEPT_ODDS"
        })
        return true
    }
}

export const changeOdds = (oldData, newData) => {
    for (const i in oldData) {
        if (oldData[i].id === newData.id) {
            oldData[i].odds = newData.odds
            oldData[i].isOddChanged = true
        }
    }
    console.log("changed odds")
    console.log(oldData)
    console.log("changed odds")
    return dispatch => {
        dispatch({
            type: "CHANGE_ODDS",
            data: { ...oldData }
        })
    }
}

export const getSportsData = data => {
    return dispatch => {
        dispatch({
            type: 'GET_SPORTS_DATA',
            data
        })
    }
}

export const removeAllBetSlipData = (oldData) => {
    oldData = {}
    const newData = {}
    return dispatch => {
        dispatch({
            type: "REMOVE_ALL_BET_SLIP_DATA",
            data: newData
        })
        return true
    }
}

export const removeBetSlipData = (oldData, id) => {
    if (!oldData[id]) {
        return dispatch => {
            return false
        }
    }
    delete oldData[id]
    const newData = oldData
    return dispatch => {
        dispatch({
            type: "REMOVE_BET_SLIP_DATA",
            data: { ...newData }
        })
        return true
    }
}

export const changeBetSlipType = (data) => {
    return dispatch => {
        dispatch({
            type: "CHANGE_BET_SLIP_TYPE",
            data
        })
    }
}

export const addBetSlipData = (oldData, newData, type) => {
    console.log(oldData)
    if (type === "mix") {
        if (Object.keys(oldData).length > 1) {
            for (const i in oldData) {
                if (oldData[i].eventId === newData.eventId && oldData[i].id !== newData.id) {
                    toast.error("You can't make mix with same events")
                    return dispatch => { return false }
                }
            }
        } else {
            toast.error("You can't make mix with one events")
            return dispatch => { return false }
        }
    }
    if (oldData[newData["id"]]) {
        delete oldData[newData["id"]]
        return dispatch => {
            dispatch({
                type: "ADD_BET_SLIP_DATA",
                data: { ...oldData }
            })
            // if (Object.keys(oldData).length === 1 && type === "mix") {
            //     toast.error("You can't make mix with same events")
            //     changeBetSlipType("single")
            // }
            return false
        }
    } else {
        oldData[newData["id"]] = newData
        return dispatch => {
            dispatch({
                type: "ADD_BET_SLIP_DATA",
                data: { ...oldData }
            })
            return true
        }
    }
}

export const getSportsDataBySportId = (data, sortType) => {
    data.sort(function (a, b) {
        if (sortType === "clickCount") {
            const x = a.ClickCount
            const y = b.ClickCount
            if (x > y) { return -1 }
            if (x < y) { return 1 }
            return 0
        } else if (sortType === "playCount") {
            const x = a.PlayCount
            const y = b.PlayCount
            if (x > y) { return -1 }
            if (x < y) { return 1 }
            return 0
        } else {
            const x = a.RegionName.toLowerCase()
            const y = b.RegionName.toLowerCase()
            if (x < y) { return -1 }
            if (x > y) { return 1 }
        }
    })
    const result = {}
    for (const i in data) {
        if (result[data[i]["SportId"]]) {
            result[data[i]["SportId"]].push(data[i])
        } else {
            result[data[i]["SportId"]] = [data[i]]
        }
    }
    return dispatch => {
        dispatch({
            type: 'GET_SPORTS_DATA',
            data: result
        })
    }
}