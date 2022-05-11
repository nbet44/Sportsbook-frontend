import axios from "axios"
import { isEmptyObject } from "jquery"
import { toast } from "react-toastify"


// ** Declare API Func
const API_URL = () => {
    if (process.env.NODE_ENV === "development") {
        return "http://127.0.0.1:8000/admin"
    } else {
        return "https://nBet44.com/admin"
    }
}

const AxiosRequest = async ({ endpoint, method, params }, callback) => {
    const token = JSON.parse(localStorage.getItem("accessToken"))
    const property = {
        body,
        method,
        url: API_URL() + endpoint,
        data: params,
        headers: {
            token
        }
    }
    try {
        const response = await axios(property)
        if (response.data.status === 202 || isEmptyObject(response.data)) {
            toast.error(response.data)
            localStorage.clear()
            window.location.href = "/login"
            return response.data
        } else {
            return response.data
        }
    } catch (e) {
        return e.toString()
    }
}

const AxiosFileRequest = async ({ endpoint, method, params }, callback) => {
    const token = JSON.parse(localStorage.getItem("accessToken"))
    const property = {
        body,
        method,
        url: API_URL() + endpoint,
        data: params,
        headers: {
            token
        }
    }
    try {
        const response = await axios(property)
        if (response.data.status === 202 || isEmptyObject(response.data)) {
            toast.error(response.data)
            localStorage.clear()
            window.location.href = "/login"
            return response.data
        } else {
            return response.data
        }
    } catch (e) {
        return e.toString()
    }
}

// ** Declare Custome Axios

const Axios = async ({ endpoint, method, params }, callback) => {
    const token = JSON.parse(localStorage.getItem("accessToken"))
    const property = {
        method,
        url: API_URL() + endpoint,
        data: params,
        headers: {
            token
        }
    }
    try {
        const response = await axios(property)
        if (response.data.status === 202 || isEmptyObject(response.data)) {
            toast.error(response.data)
            localStorage.clear()
            window.location.href = "/login"
            return response.data
        } else {
            return response.data
        }
    } catch (e) {
        return e.toString()
    }
}
export default Axios