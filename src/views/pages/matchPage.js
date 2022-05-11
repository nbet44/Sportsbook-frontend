import React, { useCallback, useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useParams } from 'react-router-dom'
import { toast } from 'react-toastify'
import {
    TabContent, TabPane, Nav, NavItem, NavLink,
    Card, CardHeader, CardBody, CardTitle, CardText, CardLink
} from 'reactstrap'
import AppCollapse from '@components/app-collapse'
import Axios from '../../utility/hooks/Axios'
import HeaderCmp from '../Header'
import Spinner from "@components/spinner/Fallback-spinner"
import { flagsByRegionName, mainConfig, mainMarketResultBySportId } from '../../configs/mainConfig'
import socketIOClient from "socket.io-client"
import moment from 'moment'
import { Lock, Star } from 'react-feather'
import BetSlipCmp from './betslip'
import $, { isEmptyObject } from "jquery"
import { addBetSlipData, changeOdds } from '../../redux/actions/sports'
import ReactInterval from 'react-interval'
import { useTranslator } from '@hooks/useTranslator'
import { getOddType } from '@utils'

const MatchPageCmp = (props) => {
    const { id } = useParams()
    const [matchData, setMatchData] = useState(null)
    const [eventData, setEventData] = useState(null)
    const [isLoading, setIsLoading] = useState(true)
    const [flagImg, setFlagImg] = useState("all_leagues")
    const [timerNumber, setTimerNumber] = useState(30)
    const slipType = useSelector(state => { return state.sports.betSlipType })
    const betSlipData = useSelector(state => { return state.sports.betSlipData })
    const [oddType, setOddType] = useState("odds")
    const dispatch = useDispatch()
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
                const checkValue = dispatch(addBetSlipData(betSlipData, result, slipType))
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
        console.log("handleRefresh")
        setIsLoading(true)
        const request = {
            LeagueId: id
        }
        const response = await Axios({
            endpoint: "/sports/get-match",
            method: "POST",
            params: request
        })
        console.log(response)
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
            setIsLoading(false)
            handleSelectedSlipStyle()
        } else {
            setIsLoading(true)
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
        if (!isEmptyObject(props.data)) {
            const data = props.data
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
            setIsLoading(false)
            return true
        }
        setIsLoading(true)
    }, [props])

    if (isLoading) {
        return (
            <Spinner />
        )
    }

    return (
        <React.Fragment>
            {
                Object.keys(eventData).map((key, index) => {
                    const mainMarketResultKey = mainMarketResultBySportId[matchData["SportId"]]
                    const event = eventData[key]
                    let markets = []
                    const mainMarketResult = ["", "", ""]
                    const firstHalfMainMarketResult = ["", "", ""]
                    let favorId = ""
                    if (event) {
                        favorId = event.Id.replace(":", "")
                        markets = event.Markets
                        for (let i = 0; i < 45; i++) {
                            if (markets[i]) {
                                for (const j in markets[i].results) {
                                    if (markets[i].results[j] && markets[i].results[j]["odds"] > 100 && oddType === "odds") {
                                        // markets[i].results[j].lock = true
                                        markets[i].results[j].oddValue = <React.Fragment><Lock /></React.Fragment>
                                    } else if (markets[i].results[j]) {
                                        markets[i].results[j].oddValue = markets[i].results[j][oddType]
                                        // markets[i].results[j].lock = false
                                    } else if (markets[i].results[j].visibility) {
                                        markets[i].results[j].oddValue = <React.Fragment><Lock /></React.Fragment>
                                    }
                                }
                                if (!markets[i].Period) {
                                    for (const j in mainMarketResultKey[0]) {
                                        if ((markets[i][mainMarketResultKey[0][j][0]] === mainMarketResultKey[0][j][1] && !mainMarketResult[j])) {
                                            mainMarketResult[j] = markets[i]
                                        }
                                    }
                                    for (const j in mainMarketResultKey[1]) {
                                        if ((markets[i][mainMarketResultKey[1][j][0]] === mainMarketResultKey[1][j][1] && !firstHalfMainMarketResult[j])) {
                                            firstHalfMainMarketResult[j] = markets[i]
                                        }
                                    }
                                } else if (markets[i].Period !== "FirstHalf" && markets[i].Period !== "SecondHalf") {
                                    for (const j in mainMarketResultKey[0]) {
                                        if ((markets[i][mainMarketResultKey[0][j][0]] === mainMarketResultKey[0][j][1] && !mainMarketResult[j])) {
                                            mainMarketResult[j] = markets[i]
                                        }
                                    }
                                } else {
                                    for (const j in mainMarketResultKey[1]) {
                                        if ((markets[i][mainMarketResultKey[1][j][0]] === mainMarketResultKey[1][j][1] && !firstHalfMainMarketResult[j])) {
                                            firstHalfMainMarketResult[j] = markets[i]
                                        }
                                    }
                                }
                            }
                        }
                    }
                    // console.log(mainMarketResult)
                    return (
                        <React.Fragment key={index}>
                            <tr>
                                <td rowSpan="3" className="">
                                    <div className="d-flex mb-1 justify-content-center" id={`favor_${favorId}`} onClick={e => { handleFavor(event, favorId) }}><Star className={`favor-icon ${event.favor ? "active" : ""} `} /></div>
                                    <div className="d-flex justify-content-center">{moment(event.Date).format('MM/DD hh:mm')}</div>
                                </td>
                                <td className="match-event">{getTextByLanguage(event.HomeTeam)}</td>
                                <td className={`match-odds match-event ${mainMarketResult[0].results && mainMarketResult[0].results[0] ? mainMarketResult[0].results[0].updated : ""}`} id={`${mainMarketResult[0].results && mainMarketResult[0].results[0] ? mainMarketResult[0].results[0].id : ""}`} onClick={e => { handleBetSlip(mainMarketResult[0], event, 0) }} >{mainMarketResult[0].results && mainMarketResult[0].results[0] ? mainMarketResult[0].results[0].oddValue : ""}</td>
                                <td className={`match-odds match-event ${mainMarketResult[1].results && mainMarketResult[1].results[0] ? mainMarketResult[1].results[0].updated : ""}`} id={`${mainMarketResult[1].results && mainMarketResult[1].results[0] ? mainMarketResult[1].results[0].id : ""}`} onClick={e => { handleBetSlip(mainMarketResult[1], event, 0) }} >
                                    <span className="odd-td-left">{(mainMarketResult[1] && mainMarketResult[1].attr ? `+ ${parseFloat(mainMarketResult[1].attr) * 1}` : "").toString()}</span>
                                    <span className="odd-td-right">{mainMarketResult[1].results && mainMarketResult[1].results[0] ? mainMarketResult[1].results[0].oddValue : ""}</span>
                                </td>
                                <td className={`match-odds match-event ${mainMarketResult[2].results && mainMarketResult[2].results[0] ? mainMarketResult[2].results[0].updated : ""}`} id={`${mainMarketResult[2].results && mainMarketResult[2].results[0] ? mainMarketResult[2].results[0].id : ""}`} onClick={e => { handleBetSlip(mainMarketResult[2], event, 0) }} >
                                    <span className="odd-td-left">{(mainMarketResult[2] && mainMarketResult[2].attr ? `O ${mainMarketResult[2].attr}` : "").toString()}</span>
                                    <span className="odd-td-right">{mainMarketResult[2].results && mainMarketResult[2].results[0] ? mainMarketResult[2].results[0].oddValue : ""}</span>
                                </td>
                                <td className={`match-odds match-event ${firstHalfMainMarketResult[0].results && firstHalfMainMarketResult[0].results[0] ? firstHalfMainMarketResult[0].results[0].updated : ""}`} id={`${firstHalfMainMarketResult[0].results && firstHalfMainMarketResult[0].results[0] ? firstHalfMainMarketResult[0].results[0].id : ""}`} onClick={e => { handleBetSlip(firstHalfMainMarketResult[0], event, 0) }} >{firstHalfMainMarketResult[0].results && firstHalfMainMarketResult[0].results[0] ? firstHalfMainMarketResult[0].results[0].oddValue : ""}</td>
                                <td className={`match-odds match-event ${firstHalfMainMarketResult[1].results && firstHalfMainMarketResult[1].results[0] ? firstHalfMainMarketResult[1].results[0].updated : ""}`} id={`${firstHalfMainMarketResult[1].results && firstHalfMainMarketResult[1].results[0] ? firstHalfMainMarketResult[1].results[0].id : ""}`} onClick={e => { handleBetSlip(firstHalfMainMarketResult[1], event, 0) }} >
                                    <span className="odd-td-left">{(firstHalfMainMarketResult[1] && firstHalfMainMarketResult[1].attr ? `+ ${parseFloat(firstHalfMainMarketResult[1].attr) * 1}` : "").toString()}</span>
                                    <span className="odd-td-right">{firstHalfMainMarketResult[1].results && firstHalfMainMarketResult[1].results[0] ? firstHalfMainMarketResult[1].results[0].oddValue : ""}</span>
                                </td>
                                <td className={`match-odds match-event ${firstHalfMainMarketResult[2].results && firstHalfMainMarketResult[2].results[0] ? firstHalfMainMarketResult[2].results[0].updated : ""}`} id={`${firstHalfMainMarketResult[2].results && firstHalfMainMarketResult[2].results[0] ? firstHalfMainMarketResult[2].results[0].id : ""}`} onClick={e => { handleBetSlip(firstHalfMainMarketResult[2], event, 0) }} >
                                    <span className="odd-td-left">{(firstHalfMainMarketResult[2] && firstHalfMainMarketResult[2].attr ? `O ${firstHalfMainMarketResult[2].attr}` : "").toString()}</span>
                                    <span className="odd-td-right">{firstHalfMainMarketResult[2].results && firstHalfMainMarketResult[2].results[0] ? firstHalfMainMarketResult[2].results[0].oddValue : ""}</span>
                                </td>
                                <td className="match-odds more-odds" rowSpan="3"><a href={`/event/${event.Id}`}>+{markets.length > 45 ? 45 : markets.length}</a></td>
                            </tr>
                            <tr>
                                <td className="match-event">{getTextByLanguage(event.AwayTeam)}</td>
                                <td className={`match-odds match-event ${mainMarketResult[0].results && mainMarketResult[0].results[1] ? mainMarketResult[0].results[1].updated : ""}`} id={`${mainMarketResult[0].results && mainMarketResult[0].results[1] ? mainMarketResult[0].results[1].id : ""}`} onClick={e => { handleBetSlip(mainMarketResult[0], event, 1) }} >{mainMarketResult[0].results && mainMarketResult[0].results[1] ? mainMarketResult[0].results[1].oddValue : ""}</td>
                                <td className={`match-odds match-event ${mainMarketResult[1].results && mainMarketResult[1].results[1] ? mainMarketResult[1].results[1].updated : ""}`} id={`${mainMarketResult[1].results && mainMarketResult[1].results[1] ? mainMarketResult[1].results[1].id : ""}`} onClick={e => { handleBetSlip(mainMarketResult[1], event, 1) }} >
                                    <span className="odd-td-left">{(mainMarketResult[1] && mainMarketResult[1].attr ? parseFloat(mainMarketResult[1].attr) * -1 : "").toString()}</span>
                                    <span className="odd-td-right">{mainMarketResult[1].results && mainMarketResult[1].results[1] ? mainMarketResult[1].results[1].oddValue : ""}</span>
                                </td>
                                <td className={`match-odds match-event ${mainMarketResult[2].results && mainMarketResult[2].results[1] ? mainMarketResult[2].results[1].updated : ""}`} id={`${mainMarketResult[2].results && mainMarketResult[2].results[1] ? mainMarketResult[2].results[1].id : ""}`} onClick={e => { handleBetSlip(mainMarketResult[2], event, 1) }} >
                                    <span className="odd-td-left">{(mainMarketResult[2] && mainMarketResult[2].attr ? `U ${mainMarketResult[2].attr}` : "").toString()}</span>
                                    <span className="odd-td-right">{mainMarketResult[2].results && mainMarketResult[2].results[1] ? mainMarketResult[2].results[1].oddValue : ""}</span>
                                </td>
                                <td className={`match-odds match-event ${firstHalfMainMarketResult[0].results && firstHalfMainMarketResult[0].results[1] ? firstHalfMainMarketResult[0].results[1].updated : ""}`} id={`${firstHalfMainMarketResult[0].results && firstHalfMainMarketResult[0].results[1] ? firstHalfMainMarketResult[0].results[1].id : ""}`} onClick={e => { handleBetSlip(firstHalfMainMarketResult[0], event, 1) }} >{firstHalfMainMarketResult[0].results && firstHalfMainMarketResult[0].results[1] ? firstHalfMainMarketResult[0].results[1].oddValue : ""}</td>
                                <td className={`match-odds match-event ${firstHalfMainMarketResult[1].results && firstHalfMainMarketResult[1].results[1] ? firstHalfMainMarketResult[1].results[1].updated : ""}`} id={`${firstHalfMainMarketResult[1].results && firstHalfMainMarketResult[1].results[1] ? firstHalfMainMarketResult[1].results[1].id : ""}`} onClick={e => { handleBetSlip(firstHalfMainMarketResult[1], event, 1) }} >
                                    <span className="odd-td-left">{(firstHalfMainMarketResult[1] && firstHalfMainMarketResult[1].attr ? parseFloat(firstHalfMainMarketResult[1].attr) * -1 : "").toString()}</span>
                                    <span className="odd-td-right">{firstHalfMainMarketResult[1].results && firstHalfMainMarketResult[1].results[1] ? firstHalfMainMarketResult[1].results[1].oddValue : ""}</span>
                                </td>
                                <td className={`match-odds match-event ${firstHalfMainMarketResult[2].results && firstHalfMainMarketResult[2].results[1] ? firstHalfMainMarketResult[2].results[1].updated : ""}`} id={`${firstHalfMainMarketResult[2].results && firstHalfMainMarketResult[2].results[1] ? firstHalfMainMarketResult[2].results[1].id : ""}`} onClick={e => { handleBetSlip(firstHalfMainMarketResult[2], event, 1) }} >
                                    <span className="odd-td-left">{(firstHalfMainMarketResult[2] && firstHalfMainMarketResult[2].attr ? `U ${firstHalfMainMarketResult[2].attr}` : "").toString()}</span>
                                    <span className="odd-td-right">{firstHalfMainMarketResult[2].results && firstHalfMainMarketResult[2].results[1] ? firstHalfMainMarketResult[2].results[1].oddValue : ""}</span>
                                </td>
                            </tr>
                            <tr>
                                <td className="match-draft">{getTextByLanguage("Draw")}</td>
                                <td className={`match-odds match-draft ${mainMarketResult[0].results && mainMarketResult[0].results[2] ? mainMarketResult[0].results[2].updated : ""}`} id={`${mainMarketResult[0].results && mainMarketResult[0].results[2] ? mainMarketResult[0].results[2].id : ""}`} onClick={e => { handleBetSlip(mainMarketResult[0], event, 2) }} >{mainMarketResult[0].results && mainMarketResult[0].results[2] ? mainMarketResult[0].results[2].oddValue : ""}</td>
                                <td className={`match-odds match-draft ${mainMarketResult[1].results && mainMarketResult[1].results[2] ? mainMarketResult[1].results[2].updated : ""}`} id={`${mainMarketResult[1].results && mainMarketResult[1].results[2] ? mainMarketResult[1].results[2].id : ""}`} onClick={e => { handleBetSlip(mainMarketResult[1], event, 2) }} >
                                    <span className="odd-td-left">{(mainMarketResult[1] && mainMarketResult[1].attr ? parseFloat(mainMarketResult[1].attr) * -1 : "").toString()}</span>
                                    <span className="odd-td-right">{mainMarketResult[1].results && mainMarketResult[1].results[2] ? mainMarketResult[1].results[2].oddValue : ""}</span>
                                </td>
                                <td className={`match-odds match-draft ${mainMarketResult[2].results && mainMarketResult[2].results[2] ? mainMarketResult[2].results[2].updated : ""}`} id={`${mainMarketResult[2].results && mainMarketResult[2].results[2] ? mainMarketResult[2].results[2].id : ""}`} onClick={e => { handleBetSlip(mainMarketResult[2], event, 2) }} >
                                    {/* <span className="odd-td-left">{(mainMarketResult[2] && mainMarketResult[2].attr ? `U ${mainMarketResult[2].attr}` : "").toString()}</span> */}
                                    <span className="odd-td-right">{mainMarketResult[2].results && mainMarketResult[2].results[2] ? mainMarketResult[2].results[2].oddValue : ""}</span>
                                </td>
                                <td className={`match-odds match-draft ${firstHalfMainMarketResult[0].results && firstHalfMainMarketResult[0].results[2] ? firstHalfMainMarketResult[0].results[2].updated : ""}`} id={`${firstHalfMainMarketResult[0].results && firstHalfMainMarketResult[0].results[2] ? firstHalfMainMarketResult[0].results[2].id : ""}`} onClick={e => { handleBetSlip(firstHalfMainMarketResult[0], event, 2) }} >{firstHalfMainMarketResult[0].results && firstHalfMainMarketResult[0].results[2] ? firstHalfMainMarketResult[0].results[2].oddValue : ""}</td>
                                <td className={`match-odds match-draft ${firstHalfMainMarketResult[1].results && firstHalfMainMarketResult[1].results[2] ? firstHalfMainMarketResult[1].results[2].updated : ""}`} id={`${firstHalfMainMarketResult[1].results && firstHalfMainMarketResult[1].results[2] ? firstHalfMainMarketResult[1].results[2].id : ""}`} onClick={e => { handleBetSlip(firstHalfMainMarketResult[1], event, 2) }} >
                                    <span className="odd-td-left">{(firstHalfMainMarketResult[1] && firstHalfMainMarketResult[1].attr ? parseFloat(firstHalfMainMarketResult[1].attr) * -1 : "").toString()}</span>
                                    <span className="odd-td-right">{firstHalfMainMarketResult[1].results && firstHalfMainMarketResult[1].results[2] ? firstHalfMainMarketResult[1].results[2].oddValue : ""}</span>
                                </td>
                                <td className={`match-odds match-draft ${firstHalfMainMarketResult[2].results && firstHalfMainMarketResult[2].results[2] ? firstHalfMainMarketResult[2].results[2].updated : ""}`} id={`${firstHalfMainMarketResult[2].results && firstHalfMainMarketResult[2].results[2] ? firstHalfMainMarketResult[2].results[2].id : ""}`} onClick={e => { handleBetSlip(firstHalfMainMarketResult[2], event, 2) }} >
                                    {/* <span className="odd-td-left">{(firstHalfMainMarketResult[2] && firstHalfMainMarketResult[2].attr ? `U ${firstHalfMainMarketResult[2].attr}` : "").toString()}</span> */}
                                    <span className="odd-td-right">{firstHalfMainMarketResult[2].results && firstHalfMainMarketResult[2].results[2] ? firstHalfMainMarketResult[2].results[2].oddValue : ""}</span>
                                </td>
                            </tr>
                        </React.Fragment>
                    )
                })
            }
        </React.Fragment>
    )
}

export default MatchPageCmp
