import React, { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { toast } from 'react-toastify'
import {
    Card, CardHeader, CardBody, CardTitle, CardText, CardLink
} from 'reactstrap'
import Axios from '../../utility/hooks/Axios'
import { getUserData } from '../../utility/Utils'
import Spinner from "@components/spinner/Fallback-spinner"
import { getSportsData, getSportsDataBySportId } from '../../redux/actions/sports'
import { sportsNameById, flagsByRegionName } from '../../configs/mainConfig'
import md5 from "md5"

const CasinoCmp = () => {
    const dispatch = useDispatch()
    const [userData, setUserData] = useState(getUserData)
    const [token, setToken] = useState("")
    const [isLoading, setIsLoading] = useState(true)
    const [hashValue, setHashValue] = useState("")
    const lang = localStorage.getItem("lang") ? localStorage.getItem("lang") : "en"

    const gameId = "10282"
    const backUrl = "http://topbetracer.com/"
    const mode = 1
    const language = "en"
    const group = "master"
    const [clientPlatform, setClientPlatform] = useState("desktop")
    const privateKey = "BAEX4Y3DVT97SHRQWUFC"

    const handleChangeIframeHeight = () => {
        const eventMethod = window.addEventListener ? "addEventListener" : "attachEvent"
        const eventer = window[eventMethod]
        const messageEvent = eventMethod === "attachEvent" ? "onmessage" : "message"
        eventer(messageEvent, function (e) {
            switch (e.data.action) {
                case "game.loaded":
                    // Game successfully loaded.
                    break
                case "game.balance.changed":
                    // Game Balance changed.
                    break
                case "game.cycle.started":
                    // Ticket placing...
                    break
                case "game.cycle.end":
                    // Ticket placed
                    break
                case "game.goto.home":
                    //Game has to be redirected to the home lobby page.(exit)
                    break
                case "game.goto.history":
                    // History modal opens
                    break
                case "game.resize.height":
                    // iframe height should be: e.data.value
                    document.getElementById("goldenRace").style.height = e.data.value
                    break
                case "game.get.clientrect":
                    // iframe selector.
                    e.source.postMessage({ action: "game.clientrect", value: document.getElementById("goldenRace").getBoundingClientRect() }, '*')
                    break
                case "game.get.clientheight":
                    // iframe selector.
                    e.source.postMessage({ action: "game.clientheight", value: document.getElementById("goldenRace").offsetHeight }, '*')
                    break
                case "game.get.innerheight":
                    // general window selector.
                    e.source.postMessage({ action: "game.innerheight", value: window.innerHeight }, '*')
                    break
            }
        })
    }

    useEffect(async () => {
        const userData = getUserData()
        const request = {
            userId: userData._id
        }
        const response = await Axios({
            endpoint: "/agent/get-token",
            method: "POST",
            params: request
        })
        if (response.status === 200) {
            setToken(response.data)
            if (window.innerWidth < 1184) {
                setClientPlatform("mobile")
                setHashValue(md5(`${response.data}${gameId}${backUrl}${mode}${language}${group}mobile${privateKey}`))
            } else {
                setClientPlatform("desktop")
                setHashValue(md5(`${response.data}${gameId}${backUrl}${mode}${language}${group}desktop${privateKey}`))
            }
            setIsLoading(false)
        } else {
            toast.error(response.data)
            setIsLoading(true)
        }
        handleChangeIframeHeight()
    }, [])

    if (isLoading) {
        return (
            <Spinner></Spinner>
        )
    }

    return (
        <div className="content-header">
            {clientPlatform === "desktop" ? (
                <React.Fragment>
                    <iframe id="goldenRace" className="w-100" style={{ border: "0px" }} src={`https://winbet555stg-lobby.staging-hub.xpressgaming.net/Launcher?token=${token}&game=${gameId}&backurl=${backUrl}&mode=${mode}&h=${hashValue}&language=${language}&group=${group}&clientPlatform=${clientPlatform}`}></iframe>

                </React.Fragment>
            ) : (
                <React.Fragment>
                    <iframe id="goldenRace" className="w-100" style={{ height: "90vh" }} src={`https://winbet555stg-lobby.staging-hub.xpressgaming.net/Launcher?token=${token}&game=${gameId}&backurl=${backUrl}&mode=${mode}&h=${hashValue}&language=${language}&group=${group}&clientPlatform=${clientPlatform}`}></iframe>
                </React.Fragment>
            )}
        </div>
    )
}

export default CasinoCmp
