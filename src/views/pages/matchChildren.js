import React, { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useParams } from 'react-router-dom'
import { toast } from 'react-toastify'
import { Card, CardHeader, CardBody } from 'reactstrap'
import Axios from '../../utility/hooks/Axios'
import Spinner from "@components/spinner/Fallback-spinner"
import { flagsByRegionName, mainConfig } from '../../configs/mainConfig'
import $, { isEmptyObject } from "jquery"
import { addBetSlipData, changeOdds } from '../../redux/actions/sports'
import ReactInterval from 'react-interval'
import { useTranslator } from '@hooks/useTranslator'
import { getOddType } from '@utils'
import SoccerPageCmp from './soccerPage'
import MatchPageCmp from './matchPage'
import IceHockeyPageCmp from './iceHockeyPage'

const MatchChildren = () => {
    const { id } = useParams()
    const [matchData, setMatchData] = useState(null)
    const [eventData, setEventData] = useState(null)
    const [isLoading, setIsLoading] = useState(true)
    const [isRefreshing, setRefreshing] = useState(false)
    const [flagImg, setFlagImg] = useState("all_leagues")
    const [clientPlatform, setClientPlatform] = useState("desktop")
    const [timerNumber, setTimerNumber] = useState(30)
    const slipType = useSelector(state => { return state.sports.betSlipType })
    const betSlipData = useSelector(state => { return state.sports.betSlipData })
    const [oddType, setOddType] = useState("odds")
    const dispatch = useDispatch()
    const [tempData, setTempData] = useState(null)
    const [getTextByLanguage] = useTranslator()

    const handleBetSlip = (data, event, index) => {
        if (data.results && data.results[index] && event) {
            if (data.results[index]["odds"] < 100 && data.results[index][oddType]) {
                const result = {
                    HomeTeam: event.HomeTeam,
                    AwayTeam: event.AwayTeam,
                    LeagueName: event.LeagueName,
                    SportName: event.SportName,
                    odds: data.results[index][oddType],
                    HomeTeamScore: event.Scoreboard ? event.Scoreboard.score.split(":")[0] : "-",
                    AwayTeamScore: event.Scoreboard ? event.Scoreboard.score.split(":")[1] : "-",
                    name: data.results[index].name.value,
                    live: !event.IsPreMatch,
                    id: data.results[index].id,
                    eventId: event.Id,
                    leagueId: event.LeagueId,
                    marketId: data.id,
                    IsPreMatch: event.IsPreMatch,
                    isOddChanged: false
                }
                const checkValue = dispatch(addBetSlipData(result, slipType))
                if (checkValue) {
                    $(`#${data.results[index].id}`).addClass("active")
                } else {
                    $(`#${data.results[index].id}`).removeClass("active")
                }
            }
        }
    }

    const handleFavor = async (data, favorId) => {
        console.log("handleFavor")
        const request = data
        const response = await Axios({
            endpoint: "/sports/save-favorite",
            method: "POST",
            params: request
        })
        console.log(response)
        if (response.status === 200) {
            toast.success("success")
            if (response.data === "remove") {
                $(`#favor_${favorId}`).children().removeClass("active")
            } else {
                $(`#favor_${favorId}`).children().addClass("active")
            }
        } else {
            toast.error(response.data)
        }
    }

    const handleChangeSlipData = async (data) => {
        for (const i in data) {
            for (const j in betSlipData) {
                if (betSlipData[j].leagueId === data[i].LeagueId && betSlipData[j].eventId === data[i].Id) {
                    for (const k in data[i].Markets) {
                        if (data[i].Markets[k].id === betSlipData[j].marketId) {
                            for (const e in data[i].Markets[k].results) {
                                if (data[i].Markets[k].results[e].id === betSlipData[j].id) {
                                    if (data[i].Markets[k].results[e][oddType] !== betSlipData[j][oddType]) {
                                        const newData = betSlipData[j]
                                        dispatch(changeOdds(betSlipData, newData))
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }
    }

    const handleOddChange = (data) => {
        for (const i in data.eventData) {
            if (eventData[data.eventData[i].Id]) {
                for (const j in eventData[data.eventData[i].Id].Markets) {
                    for (const k in data.eventData[i].Markets) {
                        if ((eventData[data.eventData[i].Id].Markets[j].id === data.eventData[i].Markets[k].id) && (eventData[data.eventData[i].Id].Markets[j].name.value === "Match Result" || eventData[data.eventData[i].Id].Markets[j].name.value === "Total Goals - Over/Under" || eventData[data.eventData[i].Id].Markets[j].name.value === "Handicap")) {
                            for (const l in eventData[data.eventData[i].Id].Markets[j].results) {
                                for (const m in data.eventData[i].Markets[k].results) {
                                    if ((eventData[data.eventData[i].Id].Markets[j].results[l].id === data.eventData[i].Markets[k].results[m].id) && (eventData[data.eventData[i].Id].Markets[j].results[l][oddType] !== data.eventData[i].Markets[k].results[m][oddType])) {
                                        // if ((eventData[data.eventData[i].Id].Markets[j].results[l].id === data.eventData[i].Markets[k].results[m].id)) {
                                        if (eventData[data.eventData[i].Id].Markets[j].results[l][oddType] > data.eventData[i].Markets[k].results[m][oddType]) {
                                            data.eventData[i].Markets[k].results[m].updated = "match-odds-down"
                                        } else {
                                            data.eventData[i].Markets[k].results[m].updated = "match-odds-up"
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }
        setMatchData(data[Object.keys(data)[0]])
        setEventData(data)
    }

    const handleSelectedSlipStyle = async () => {
        for (const i in betSlipData) {
            $(`#${betSlipData[i].id}`).addClass("active")
        }
    }

    const handleRefresh = async () => {
        setRefreshing(true)
        const request = {
            LeagueId: id
        }
        const response = await Axios({
            endpoint: "/sports/get-match",
            method: "POST",
            params: request
        })
        if (response.status === 200 && !isEmptyObject(response.data)) {
            if (!isEmptyObject(response.data)) {
                const data = response.data
                handleOddChange(response.data)
                handleChangeSlipData(data)
                let regionName = data[Object.keys(data)[0]].RegionName.replaceAll("(", "")
                regionName = data[Object.keys(data)[0]].RegionName.replaceAll(")", "")
                regionName = data[Object.keys(data)[0]].RegionName.replaceAll(" ", "")
                if (flagsByRegionName[regionName]) {
                    setFlagImg(flagsByRegionName[regionName])
                } else {
                    setFlagImg(regionName)
                }
            }
            setRefreshing(false)
            handleSelectedSlipStyle()
        } else {
            setRefreshing(true)
            toast.error(response.data)
        }
        setTimerNumber(30)
    }

    const handleTimer = async () => {
        if (timerNumber === 0) {
            setTimerNumber(30)
            handleRefresh()
        } else {
            setTimerNumber(timerNumber - 1)
        }
    }

    useEffect(async () => {
        // mainConfig.socket.on("", response => {
        //     if (response.status === 200) {
        //         var data = response.data
        //     }
        // })
        if (window.innerWidth < 1184) {
            setClientPlatform("mobile")
        } else {
            setClientPlatform("desktop")
        }
        const request = {
            LeagueId: id,
            first: true
        }
        const response = await Axios({
            endpoint: "/sports/get-match",
            method: "POST",
            params: request
        })
        if (response.status === 200) {
            if (!isEmptyObject(response.data)) {
                const data = response.data
                setTempData(data)
                setMatchData(data[Object.keys(data)[0]])
                setEventData(data)
                setOddType(getOddType())
                let regionName = data[Object.keys(data)[0]].RegionName.replaceAll("(", "")
                regionName = data[Object.keys(data)[0]].RegionName.replaceAll(")", "")
                regionName = data[Object.keys(data)[0]].RegionName.replaceAll(" ", "")
                if (flagsByRegionName[regionName]) {
                    setFlagImg(flagsByRegionName[regionName])
                } else {
                    setFlagImg(regionName)
                }
            }
            setIsLoading(false)
        } else {
            setIsLoading(true)
            toast.error(response.data)
        }
    }, [])

    return (
        <React.Fragment>
            <ReactInterval timeout={1000} enabled={true} callback={e => { handleTimer() }} />
            {isLoading ? (
                <Spinner></Spinner>
            ) : (
                <React.Fragment>
                    <Card className={`b-team__list px-0 col h-100 ${clientPlatform === "desktop" ? "mr-5" : "mr-1"}`}>
                        <CardHeader >
                            <div className="left d-flex align-items-center">
                                <h2 id={`sport-title-${matchData["SportId"]}`} className="soccer m-auto pl-3 p-1">{matchData && matchData.SportName ? getTextByLanguage(matchData.SportName) : ""}</h2>
                                <span onClick={e => { handleRefresh() }} className={`timer-number d-flex align-items-center ${isRefreshing ? "refresh-loading" : ""}`}>{timerNumber}</span>
                            </div>
                            <div className="right">
                                <a className="fav-link mr-2" href="/favorite" data-nsfw-filter-status="swf">{getTextByLanguage("Favourite Events")}</a>
                                <a style={{ color: "white", fontSize: "15px" }} href="/home" data-nsfw-filter-status="swf">{getTextByLanguage("Back to League")}</a>
                            </div>
                        </CardHeader>
                        <div className="title">
                            <div className="left">
                                <h3>
                                    <img src={`https://getbet77.com/files/flags1/${flagImg}.png`} alt="" />
                                    <span data-nsfw-filter-status="swf">{getTextByLanguage(matchData.RegionName)} {getTextByLanguage(matchData.LeagueName)}</span>
                                </h3>
                            </div>
                        </div>
                        <CardBody className="b-team pt-0 pb-0">
                            <div className="table-wrapper">
                                <table className="table table-bordered">
                                    <tbody>
                                        <tr className="table-header">
                                            <td rowSpan="2">
                                                <span></span>
                                                <span>{getTextByLanguage("Time")}</span>
                                            </td>
                                            <td className="event" rowSpan="2">{getTextByLanguage("Event")}</td>
                                            <td colSpan="3">{getTextByLanguage("Full time")}</td>
                                            <td colSpan="3">{getTextByLanguage("First Half")}</td>
                                            <td className="last" rowSpan="2"></td>
                                        </tr>
                                        <tr className="table-header">
                                            <td>1X2</td>
                                            <td>HDP</td>
                                            <td>OU</td>
                                            <td>1X2</td>
                                            <td>HDP</td>
                                            <td>OU</td>
                                        </tr>
                                        {matchData.SportId === 4 ? <SoccerPageCmp data={tempData} /> : matchData.SportId === 12 || matchData.SportId === 16 ? <IceHockeyPageCmp data={tempData} /> : <MatchPageCmp data={tempData} />}
                                    </tbody>
                                </table>
                            </div>
                        </CardBody>
                    </Card>
                </React.Fragment>
            )}
        </React.Fragment>
    )
}

export default MatchChildren