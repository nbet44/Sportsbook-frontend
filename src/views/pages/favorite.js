import React, { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import {
    TabContent, TabPane, Nav, NavItem, NavLink,
    Card, CardHeader, CardBody
} from 'reactstrap'
import Axios from '../../utility/hooks/Axios'
import HeaderCmp from '../Header'
import { toast } from 'react-toastify'
import Spinner from "@components/spinner/Fallback-spinner"
import { Star } from 'react-feather'
import moment from 'moment'
import { flagsByRegionName, mainMarketResultBySportId, sportsNameById } from '../../configs/mainConfig'
import BetSlipCmp from './betslip'
import $, { isEmptyObject } from "jquery"
import ReactInterval from 'react-interval'
import { useTranslator } from '@hooks/useTranslator'
import { getOddType } from '@utils'
import { useDispatch, useSelector } from 'react-redux'
import { addBetSlipData, changeOdds } from '../../redux/actions/sports'

const FavoriteCmp = () => {
    const [active, setActive] = useState('1')
    const [id, setId] = useState(0)
    const [isLoading, setIsLoading] = useState(true)
    const [eventData, setEventData] = useState([])
    const [timerNumber, setTimerNumber] = useState(30)
    const [getTextByLanguage] = useTranslator()
    const [oddType, setOddType] = useState("odds")
    const [clientPlatform, setClientPlatform] = useState("desktop")
    const slipType = useSelector(state => { return state.sports.betSlipType })
    const betSlipData = useSelector(state => { return state.sports.betSlipData })
    const [isRefreshing, setRefreshing] = useState(false)
    const dispatch = useDispatch()

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

    const handleBetSlip = (data, event, index) => {
        if (data.results && event) {
            const result = {
                HomeTeam: event.HomeTeam,
                AwayTeam: event.AwayTeam,
                LeagueName: event.LeagueName,
                SportName: event.SportName,
                odds: data.results[index].odds,
                HomeTeamScore: event.Scoreboard && event.Scoreboard.score ? event.Scoreboard.score.split(":")[0] : "-",
                AwayTeamScore: event.Scoreboard && event.Scoreboard.score ? event.Scoreboard.score.split(":")[1] : "-",
                name: data.results[index].name.value,
                live: !event.IsPreMatch,
                id: data.results[index].id,
                eventId: event.Id,
                leagueId: event.LeagueId,
                marketId: data.id
            }
            const checkValue = dispatch(addBetSlipData(betSlipData, result, slipType))
            if (checkValue) {
                $(`#${data.results[index].id}`).addClass("active")
            } else {
                $(`#${data.results[index].id}`).removeClass("active")
            }
        }
    }

    const handleSelectedSlipStyle = async () => {
        for (const i in betSlipData) {
            console.log($(`#${betSlipData[i].id}`))
            $(`#${betSlipData[i].id}`).addClass("active")
        }
    }

    const getFavoriteDataByMatchType = async (id) => {
        const request = {
            type: id
        }
        const response = await Axios({
            endpoint: "/sports/get-favorite",
            method: "POST",
            params: request
        })
        console.log(response)
        if (response.status === 200) {
            if (response.data) {
                setEventData(response.data)
            }
            // handleOddChange(response.data)
            // handleChangeSlipData(response.data.eventData)
            handleSelectedSlipStyle()
            return true
        } else {
            toast.error(response.data)
            return false
        }
    }

    const toggle = (tab, typeValue) => {
        if (active !== tab) {
            setActive(tab)
        }
        getFavoriteDataByMatchType(typeValue)
        setId(typeValue)
    }

    const handleRefresh = async () => {
        setRefreshing(true)
        const isCheck = getFavoriteDataByMatchType(id)
        if (isCheck) {
            setRefreshing(false)
        } else {
            setRefreshing(true)
        }
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
        if (window.innerWidth < 1184) {
            setClientPlatform("mobile")
        } else {
            setClientPlatform("desktop")
        }
        const request = {
            type: 0
        }
        const response = await Axios({
            endpoint: "/sports/get-favorite",
            method: "POST",
            params: request
        })
        console.log(response)
        if (response.status === 200) {
            if (response.data) {
                setEventData(response.data)
            }
            setIsLoading(false)
        } else {
            setIsLoading(true)
            toast.error(response.data)
        }
        setOddType(getOddType())
    }, [])

    if (isLoading) {
        return (
            <Spinner></Spinner>
        )
    }

    return (
        <div>
            <ReactInterval timeout={1000} enabled={true} callback={e => { handleTimer() }} />
            <HeaderCmp />
            <div className="content-body mx-0">
                <Nav tabs className="category-links m-0">
                    <NavItem className="bet-tabs">
                        <NavLink
                            active={active === '1'}
                            onClick={() => {
                                toggle('1', 0)
                            }}
                        >
                            All
                        </NavLink>
                    </NavItem>
                    <NavItem className="bet-tabs">
                        <NavLink
                            active={active === '2'}
                            onClick={() => {
                                toggle('2', 1)
                            }}
                        >
                            Live
                        </NavLink>
                    </NavItem>
                    <NavItem className="bet-tabs">
                        <NavLink
                            active={active === '3'}
                            onClick={() => {
                                toggle('3', 2)
                            }}
                        >
                            Prematch
                        </NavLink>
                    </NavItem>
                </Nav>
                <TabContent className={`category-content ${clientPlatform === "desktop" ? "mr-5" : "mr-1"}`} activeTab={active} style={{ width: "70%" }}>
                    <TabPane tabId='1'>
                        <Card className="b-team__list">
                            {Object.keys(eventData).map((key, index) => {
                                const eventArray = eventData[key]
                                console.log(eventArray)
                                if (eventArray.length > 0) {
                                    let flagImg = "all_leagues"
                                    let regionName = eventArray[0].RegionName.replaceAll("(", "")
                                    regionName = eventArray[0].RegionName.replaceAll(")", "")
                                    regionName = eventArray[0].RegionName.replaceAll(" ", "")
                                    if (flagsByRegionName[regionName]) {
                                        flagImg = flagsByRegionName[regionName]
                                    } else {
                                        flagImg = regionName
                                    }
                                    return (
                                        <React.Fragment key={index}>
                                            <CardHeader >
                                                <div className="left d-flex align-items-center">
                                                    <h2 id="soccer-game" className="soccer mr-1">{sportsNameById[eventArray[0]["SportId"]]}</h2>
                                                    <span onClick={e => { handleRefresh() }} className={`timer-number d-flex align-items-center ${isRefreshing ? "refresh-loading" : ""}`}>{timerNumber}</span>
                                                </div>
                                                <div className="right">
                                                    {/* <a className="fav-link" href="" data-nsfw-filter-status="swf">Favourite Events</a> */}
                                                </div>
                                            </CardHeader>
                                            <CardBody className="b-team pt-0 pb-0">
                                                <div className="table-wrapper">
                                                    {
                                                        eventArray.map((item, order) => {
                                                            const mainMarketResultKey = mainMarketResultBySportId["4"]
                                                            let markets = []
                                                            const mainMarketResult = ["", "", ""]
                                                            const firstHalfMainMarketResult = ["", "", ""]
                                                            let favorId = ""
                                                            const homeTeamScore = item.Scoreboard && item.Scoreboard.score ? item.Scoreboard.score.split(":")[0] : ""
                                                            const awayTeamScore = item.Scoreboard && item.Scoreboard.score ? item.Scoreboard.score.split(":")[1] : ""
                                                            // const currentTime = item.Scoreboard && item.Scoreboard.timer ? parseInt((new Date(item.Scoreboard.timer.base) - new Date(item.Date)) / (60 * 1000)) : ""
                                                            const currentTime = item.Scoreboard && item.Scoreboard.timer ? parseInt(item.Scoreboard.timer.seconds / 60) : ""
                                                            favorId = item.Id.replace(":", "")
                                                            if (item.Markets.length > 0) {
                                                                markets = item.Markets
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
                                                            return (
                                                                <React.Fragment key={order}>
                                                                    <div className="title py-1">
                                                                        <div className="left">
                                                                            <h3>
                                                                                <img src={`https://getbet77.com/files/flags1/${flagImg}.png`} alt="" />
                                                                                <span data-nsfw-filter-status="swf">{item["LeagueName"]}</span>
                                                                            </h3>
                                                                        </div>
                                                                    </div>
                                                                    <table className="table-style table table-bordered">
                                                                        <tbody>
                                                                            <tr className="table-header">
                                                                                <td rowSpan="2">
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
                                                                            <tr>
                                                                                <td rowSpan="3" className="">
                                                                                    <div className="d-flex mb-1 justify-content-center" id={`favor_${favorId}`} onClick={e => { handleFavor(item, favorId) }}><Star className={`favor-icon active`} /></div>
                                                                                    <div className="d-flex justify-content-center">{moment(item.Date).format('MM/DD HH:mm')}</div>
                                                                                    {/* <div className="d-flex justify-content-center">{currentTime}"</div> */}
                                                                                </td>
                                                                                <td className="match-event">{getTextByLanguage(item.HomeTeam)}</td>
                                                                                <td className={`match-odds match-event ${mainMarketResult[0] && mainMarketResult[0].results[0] ? mainMarketResult[0].results[0].updated : ""}`} id={`${mainMarketResult[0].results && mainMarketResult[0].results[0] ? mainMarketResult[0].results[0].id : ""}`} onClick={e => { handleBetSlip(mainMarketResult[0], item, 0) }} >{mainMarketResult[0].results && mainMarketResult[0].results[0] ? mainMarketResult[0].results[0].oddValue : ""}</td>
                                                                                <td className={`match-odds match-event ${mainMarketResult[1] && mainMarketResult[1].results[0] ? mainMarketResult[1].results[0].updated : ""}`} id={`${mainMarketResult[1].results && mainMarketResult[1].results[0] ? mainMarketResult[1].results[0].id : ""}`} onClick={e => { handleBetSlip(mainMarketResult[1], item, 0) }} >
                                                                                    <span className="odd-td-left">{(mainMarketResult[1] && mainMarketResult[1].attr ? `+ ${parseFloat(mainMarketResult[1].attr) * 1}` : "").toString()}</span>
                                                                                    <span className="odd-td-right">{mainMarketResult[1].results && mainMarketResult[1].results[0] ? mainMarketResult[1].results[0].oddValue : ""}</span>
                                                                                </td>
                                                                                <td className={`match-odds match-event ${mainMarketResult[2] && mainMarketResult[2].results[0] ? mainMarketResult[2].results[0].updated : ""}`} id={`${mainMarketResult[2].results && mainMarketResult[2].results[0] ? mainMarketResult[2].results[0].id : ""}`} onClick={e => { handleBetSlip(mainMarketResult[2], item, 0) }} >
                                                                                    <span className="odd-td-left">{(mainMarketResult[2] && mainMarketResult[2].attr ? `O ${mainMarketResult[2].attr}` : "").toString()}</span>
                                                                                    <span className="odd-td-right">{mainMarketResult[2].results && mainMarketResult[2].results[0] ? mainMarketResult[2].results[0].oddValue : ""}</span>
                                                                                </td>
                                                                                <td className={`match-odds match-event ${firstHalfMainMarketResult[0] && firstHalfMainMarketResult[0].results[0] ? firstHalfMainMarketResult[0].results[0].updated : ""}`} id={`${firstHalfMainMarketResult[0].results && firstHalfMainMarketResult[0].results[0] ? firstHalfMainMarketResult[0].results[0].id : ""}`} onClick={e => { handleBetSlip(firstHalfMainMarketResult[0], item, 0) }} >{firstHalfMainMarketResult[0].results && firstHalfMainMarketResult[0].results[0] ? firstHalfMainMarketResult[0].results[0].oddValue : ""}</td>
                                                                                <td className={`match-odds match-event ${firstHalfMainMarketResult[1] && firstHalfMainMarketResult[1].results[0] ? firstHalfMainMarketResult[1].results[0].updated : ""}`} id={`${firstHalfMainMarketResult[1].results && firstHalfMainMarketResult[1].results[0] ? firstHalfMainMarketResult[1].results[0].id : ""}`} onClick={e => { handleBetSlip(firstHalfMainMarketResult[1], item, 0) }} >
                                                                                    <span className="odd-td-left">{(firstHalfMainMarketResult[1] && firstHalfMainMarketResult[1].attr ? `+ ${parseFloat(firstHalfMainMarketResult[1].attr) * 1}` : "").toString()}</span>
                                                                                    <span className="odd-td-right">{firstHalfMainMarketResult[1].results && firstHalfMainMarketResult[1].results[0] ? firstHalfMainMarketResult[1].results[0].oddValue : ""}</span>
                                                                                </td>
                                                                                <td className={`match-odds match-event ${firstHalfMainMarketResult[2] && firstHalfMainMarketResult[2].results[0] ? firstHalfMainMarketResult[2].results[0].updated : ""}`} id={`${firstHalfMainMarketResult[2].results && firstHalfMainMarketResult[2].results[0] ? firstHalfMainMarketResult[2].results[0].id : ""}`} onClick={e => { handleBetSlip(firstHalfMainMarketResult[2], item, 0) }} >
                                                                                    <span className="odd-td-left">{(firstHalfMainMarketResult[2] && firstHalfMainMarketResult[2].attr ? `O ${firstHalfMainMarketResult[2].attr}` : "").toString()}</span>
                                                                                    <span className="odd-td-right">{firstHalfMainMarketResult[2].results && firstHalfMainMarketResult[2].results[0] ? firstHalfMainMarketResult[2].results[0].oddValue : ""}</span>
                                                                                </td>
                                                                                <td className="match-odds more-odds" rowSpan="3"><a href={`/event/${item.Id}`}>+{markets.length > 45 ? 45 : markets.length}</a></td>
                                                                            </tr>
                                                                            <tr>
                                                                                <td className="match-event">{getTextByLanguage(item.AwayTeam)}</td>
                                                                                <td className={`match-odds match-event ${mainMarketResult[0] && mainMarketResult[0].results[2] ? mainMarketResult[0].results[2].updated : ""}`} id={`${mainMarketResult[0].results && mainMarketResult[0].results[2] ? mainMarketResult[0].results[2].id : ""}`} onClick={e => { handleBetSlip(mainMarketResult[0], item, 2) }} >{mainMarketResult[0].results && mainMarketResult[0].results[2] ? mainMarketResult[0].results[2].oddValue : ""}</td>
                                                                                <td className={`match-odds match-event ${mainMarketResult[1] && mainMarketResult[1].results[2] ? mainMarketResult[1].results[2].updated : ""}`} id={`${mainMarketResult[1].results && mainMarketResult[1].results[2] ? mainMarketResult[1].results[2].id : ""}`} onClick={e => { handleBetSlip(mainMarketResult[1], item, 2) }} >
                                                                                    <span className="odd-td-left">{(mainMarketResult[1] && mainMarketResult[1].attr ? mainMarketResult[1].attr * -1 : "").toString()}</span>
                                                                                    <span className="odd-td-right">{mainMarketResult[1].results && mainMarketResult[1].results[2] ? mainMarketResult[1].results[2].oddValue : ""}</span>
                                                                                </td>
                                                                                <td className={`match-odds match-event ${mainMarketResult[2] && mainMarketResult[2].results[1] ? mainMarketResult[2].results[1].updated : ""}`} id={`${mainMarketResult[2].results && mainMarketResult[2].results[1] ? mainMarketResult[2].results[1].id : ""}`} onClick={e => { handleBetSlip(mainMarketResult[2], item, 1) }} >
                                                                                    <span className="odd-td-left">{(mainMarketResult[2] && mainMarketResult[2].attr ? `U ${mainMarketResult[2].attr}` : "").toString()}</span>
                                                                                    <span className="odd-td-right">{mainMarketResult[2].results && mainMarketResult[2].results[1] ? mainMarketResult[2].results[1].oddValue : ""}</span>
                                                                                </td>
                                                                                <td className={`match-odds match-event ${firstHalfMainMarketResult[0] && firstHalfMainMarketResult[0].results[1] ? firstHalfMainMarketResult[0].results[1].updated : ""}`} id={`${firstHalfMainMarketResult[0].results && firstHalfMainMarketResult[0].results[2] ? firstHalfMainMarketResult[0].results[2].id : ""}`} onClick={e => { handleBetSlip(firstHalfMainMarketResult[0], item, 2) }} >{firstHalfMainMarketResult[0].results && firstHalfMainMarketResult[0].results[2] ? firstHalfMainMarketResult[0].results[2].oddValue : ""}</td>
                                                                                <td className={`match-odds match-event ${firstHalfMainMarketResult[1] && firstHalfMainMarketResult[1].results[2] ? firstHalfMainMarketResult[1].results[2].updated : ""}`} id={`${firstHalfMainMarketResult[1].results && firstHalfMainMarketResult[1].results[2] ? firstHalfMainMarketResult[1].results[2].id : ""}`} onClick={e => { handleBetSlip(firstHalfMainMarketResult[1], item, 2) }} >
                                                                                    <span className="odd-td-left">{(firstHalfMainMarketResult[1] && firstHalfMainMarketResult[1].attr ? firstHalfMainMarketResult[1].attr * -1 : "").toString()}</span>
                                                                                    <span className="odd-td-right">{firstHalfMainMarketResult[1].results && firstHalfMainMarketResult[1].results[2] ? firstHalfMainMarketResult[1].results[2].oddValue : ""}</span>
                                                                                </td>
                                                                                <td className={`match-odds match-event ${firstHalfMainMarketResult[2] && firstHalfMainMarketResult[2].results[1] ? firstHalfMainMarketResult[2].results[1].updated : ""}`} id={`${firstHalfMainMarketResult[2].results && firstHalfMainMarketResult[2].results[1] ? firstHalfMainMarketResult[2].results[1].id : ""}`} onClick={e => { handleBetSlip(firstHalfMainMarketResult[2], item, 1) }} >
                                                                                    <span className="odd-td-left">{(firstHalfMainMarketResult[2] && firstHalfMainMarketResult[2].attr ? `U ${firstHalfMainMarketResult[2].attr}` : "").toString()}</span>
                                                                                    <span className="odd-td-right">{firstHalfMainMarketResult[2].results && firstHalfMainMarketResult[2].results[1] ? firstHalfMainMarketResult[2].results[1].oddValue : ""}</span>
                                                                                </td>
                                                                            </tr>
                                                                            <tr>
                                                                                <td className="match-draft">{getTextByLanguage("Draw")}</td>
                                                                                <td className={`match-odds match-draft ${mainMarketResult[0] && mainMarketResult[0].results[1] ? mainMarketResult[0].results[1].updated : ""}`} id={`${mainMarketResult[0].results && mainMarketResult[0].results[1] ? mainMarketResult[0].results[1].id : ""}`} onClick={e => { handleBetSlip(mainMarketResult[0], item, 1) }} >{mainMarketResult[0].results && mainMarketResult[0].results[1] ? mainMarketResult[0].results[1].oddValue : ""}</td>
                                                                                <td className={`match-odds match-draft ${mainMarketResult[1] && mainMarketResult[1].results[1] ? mainMarketResult[1].results[1].updated : ""}`} id={`${mainMarketResult[1].results && mainMarketResult[1].results[1] ? mainMarketResult[1].results[1].id : ""}`} onClick={e => { handleBetSlip(mainMarketResult[1], item, 1) }} >
                                                                                    {/* <span className="odd-td-left">{(mainMarketResult[1] && mainMarketResult[1].attr ? mainMarketResult[1].attr * -1 : "").toString()}</span> */}
                                                                                    {/* <span classNameodds="odd-td-right">{mainMarketResult[1].results && mainMarketResult[1].results[1] ? mainMarketResult[1].results[1].oddValue : ""}</span> */}
                                                                                </td>
                                                                                <td className={`match-odds match-draft ${mainMarketResult[2] && mainMarketResult[2].results[2] ? mainMarketResult[2].results[2].updated : ""}`} id={`${mainMarketResult[2].results && mainMarketResult[2].results[2] ? mainMarketResult[2].results[2].id : ""}`} onClick={e => { handleBetSlip(mainMarketResult[2], item, 2) }} >
                                                                                    {/* <span className="odd-td-left">{(mainMarketResult[2] && mainMarketResult[2].attr ? `U ${mainMarketResult[2].attr}` : "").toString()}</span> */}
                                                                                    <span className="odd-td-right">{mainMarketResult[2].results && mainMarketResult[2].results[2] ? mainMarketResult[2].results[2].oddValue : ""}</span>
                                                                                </td>
                                                                                <td className={`match-odds match-draft ${firstHalfMainMarketResult[0] && firstHalfMainMarketResult[0].results[2] ? firstHalfMainMarketResult[0].results[2].updated : ""}`} id={`${firstHalfMainMarketResult[0].results && firstHalfMainMarketResult[0].results[1] ? firstHalfMainMarketResult[0].results[1].id : ""}`} onClick={e => { handleBetSlip(firstHalfMainMarketResult[0], item, 1) }} >{firstHalfMainMarketResult[0].results && firstHalfMainMarketResult[0].results[1] ? firstHalfMainMarketResult[0].results[1].oddValue : ""}</td>
                                                                                <td className={`match-odds match-draft ${firstHalfMainMarketResult[1] && firstHalfMainMarketResult[1].results[1] ? firstHalfMainMarketResult[1].results[1].updated : ""}`} id={`${firstHalfMainMarketResult[1].results && firstHalfMainMarketResult[1].results[1] ? firstHalfMainMarketResult[1].results[1].id : ""}`} onClick={e => { handleBetSlip(firstHalfMainMarketResult[1], item, 1) }} >
                                                                                    {/* <span className="odd-td-left">{(firstHalfMainMarketResult[1] && firstHalfMainMarketResult[1].attr ? firstHalfMainMarketResult[1].attr * -1 : "").toString()}</span>
                                                                                            <span className="odd-td-right">{firstHalfMainMarketResult[1].results && firstHalfMainMarketResult[1].results[1] ? firstHalfMainMarketResult[1].results[1].oddValue : ""}</span> */}
                                                                                </td>
                                                                                <td className={`match- match-draft ${firstHalfMainMarketResult[2] && firstHalfMainMarketResult[2].results[2] ? firstHalfMainMarketResult[2].results[2].updated : ""}`} id={`${firstHalfMainMarketResult[2].results && firstHalfMainMarketResult[2].results[2] ? firstHalfMainMarketResult[2].results[2].id : ""}`} onClick={e => { handleBetSlip(firstHalfMainMarketResult[2], item, 2) }} >
                                                                                    {/* <span className="odd-td-left">{(firstHalfMainMarketResult[2] && firstHalfMainMarketResult[2].attr ? `U ${firstHalfMainMarketResult[2].attr}` : "").toString()}</span> */}
                                                                                    <span className="odd-td-right">{firstHalfMainMarketResult[2].results && firstHalfMainMarketResult[2].results[2] ? firstHalfMainMarketResult[2].results[2].oddValue : ""}</span>
                                                                                </td>
                                                                            </tr>
                                                                        </tbody>
                                                                    </table>
                                                                </React.Fragment>
                                                            )
                                                        })
                                                    }
                                                </div>
                                            </CardBody>
                                        </React.Fragment>

                                    )
                                }
                            })}
                        </Card>
                    </TabPane>
                    <TabPane tabId='2'>
                        <Card className="b-team__list">
                            {Object.keys(eventData).map((key, index) => {
                                const eventArray = eventData[key]
                                if (eventArray.length > 0) {
                                    let flagImg = "all_leagues"
                                    let regionName = eventArray[0].RegionName.replaceAll("(", "")
                                    regionName = eventArray[0].RegionName.replaceAll(")", "")
                                    regionName = eventArray[0].RegionName.replaceAll(" ", "")
                                    if (flagsByRegionName[regionName]) {
                                        flagImg = flagsByRegionName[regionName]
                                    } else {
                                        flagImg = regionName
                                    }
                                    return (
                                        <React.Fragment key={index}>
                                            <CardHeader >
                                                <div className="left d-flex align-items-center">
                                                    <h2 id="soccer-game" className="soccer mr-1">{sportsNameById[eventArray[0]["SportId"]]}</h2>
                                                    <span onClick={e => { handleRefresh() }} className={`timer-number d-flex align-items-center ${isRefreshing ? "refresh-loading" : ""}`}>{timerNumber}</span>
                                                </div>
                                                <div className="right">
                                                    {/* <a className="fav-link" href="" data-nsfw-filter-status="swf">Favourite Events</a> */}
                                                </div>
                                            </CardHeader>
                                            <CardBody className="b-team pt-0 pb-0">
                                                <div className="table-wrapper">
                                                    {
                                                        eventArray.map((item, order) => {
                                                            const mainMarketResultKey = mainMarketResultBySportId["4"]
                                                            let markets = []
                                                            const mainMarketResult = ["", "", ""]
                                                            const firstHalfMainMarketResult = ["", "", ""]
                                                            let favorId = ""
                                                            const homeTeamScore = item.Scoreboard && item.Scoreboard.score ? item.Scoreboard.score.split(":")[0] : ""
                                                            const awayTeamScore = item.Scoreboard && item.Scoreboard.score ? item.Scoreboard.score.split(":")[1] : ""
                                                            // const currentTime = item.Scoreboard && item.Scoreboard.timer ? parseInt((new Date(item.Scoreboard.timer.base) - new Date(item.Date)) / (60 * 1000)) : ""
                                                            const currentTime = item.Scoreboard && item.Scoreboard.timer ? parseInt(item.Scoreboard.timer.seconds / 60) : ""
                                                            favorId = item.Id.replace(":", "")
                                                            if (item.Markets.length > 0) {
                                                                markets = item.Markets
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
                                                            return (
                                                                <React.Fragment key={order}>
                                                                    <div className="title py-1">
                                                                        <div className="left">
                                                                            <h3>
                                                                                <img src={`https://getbet77.com/files/flags1/${flagImg}.png`} alt="" />
                                                                                <span data-nsfw-filter-status="swf">{item["LeagueName"]}</span>
                                                                            </h3>
                                                                        </div>
                                                                    </div>
                                                                    <table className="table-style table table-bordered">
                                                                        <tbody>
                                                                            <tr className="table-header">
                                                                                <td rowSpan="2">
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
                                                                            <tr>
                                                                                <td rowSpan="3" className="">
                                                                                    <div className="d-flex mb-1 justify-content-center" id={`favor_${favorId}`} onClick={e => { handleFavor(item, favorId) }}><Star className={`favor-icon active`} /></div>
                                                                                    <div className="d-flex justify-content-center">{moment(item.Date).format('MM/DD HH:mm')}</div>
                                                                                    {/* <div className="d-flex justify-content-center">{currentTime}"</div> */}
                                                                                </td>
                                                                                <td className="match-event">{getTextByLanguage(item.HomeTeam)}</td>
                                                                                <td className={`match-odds match-event ${mainMarketResult[0] && mainMarketResult[0].results[0] ? mainMarketResult[0].results[0].updated : ""}`} id={`${mainMarketResult[0].results && mainMarketResult[0].results[0] ? mainMarketResult[0].results[0].id : ""}`} onClick={e => { handleBetSlip(mainMarketResult[0], item, 0) }} >{mainMarketResult[0].results && mainMarketResult[0].results[0] ? mainMarketResult[0].results[0].oddValue : ""}</td>
                                                                                <td className={`match-odds match-event ${mainMarketResult[1] && mainMarketResult[1].results[0] ? mainMarketResult[1].results[0].updated : ""}`} id={`${mainMarketResult[1].results && mainMarketResult[1].results[0] ? mainMarketResult[1].results[0].id : ""}`} onClick={e => { handleBetSlip(mainMarketResult[1], item, 0) }} >
                                                                                    <span className="odd-td-left">{(mainMarketResult[1] && mainMarketResult[1].attr ? `+ ${parseFloat(mainMarketResult[1].attr) * 1}` : "").toString()}</span>
                                                                                    <span className="odd-td-right">{mainMarketResult[1].results && mainMarketResult[1].results[0] ? mainMarketResult[1].results[0].oddValue : ""}</span>
                                                                                </td>
                                                                                <td className={`match-odds match-event ${mainMarketResult[2] && mainMarketResult[2].results[0] ? mainMarketResult[2].results[0].updated : ""}`} id={`${mainMarketResult[2].results && mainMarketResult[2].results[0] ? mainMarketResult[2].results[0].id : ""}`} onClick={e => { handleBetSlip(mainMarketResult[2], item, 0) }} >
                                                                                    <span className="odd-td-left">{(mainMarketResult[2] && mainMarketResult[2].attr ? `O ${mainMarketResult[2].attr}` : "").toString()}</span>
                                                                                    <span className="odd-td-right">{mainMarketResult[2].results && mainMarketResult[2].results[0] ? mainMarketResult[2].results[0].oddValue : ""}</span>
                                                                                </td>
                                                                                <td className={`match-odds match-event ${firstHalfMainMarketResult[0] && firstHalfMainMarketResult[0].results[0] ? firstHalfMainMarketResult[0].results[0].updated : ""}`} id={`${firstHalfMainMarketResult[0].results && firstHalfMainMarketResult[0].results[0] ? firstHalfMainMarketResult[0].results[0].id : ""}`} onClick={e => { handleBetSlip(firstHalfMainMarketResult[0], item, 0) }} >{firstHalfMainMarketResult[0].results && firstHalfMainMarketResult[0].results[0] ? firstHalfMainMarketResult[0].results[0].oddValue : ""}</td>
                                                                                <td className={`match-odds match-event ${firstHalfMainMarketResult[1] && firstHalfMainMarketResult[1].results[0] ? firstHalfMainMarketResult[1].results[0].updated : ""}`} id={`${firstHalfMainMarketResult[1].results && firstHalfMainMarketResult[1].results[0] ? firstHalfMainMarketResult[1].results[0].id : ""}`} onClick={e => { handleBetSlip(firstHalfMainMarketResult[1], item, 0) }} >
                                                                                    <span className="odd-td-left">{(firstHalfMainMarketResult[1] && firstHalfMainMarketResult[1].attr ? `+ ${parseFloat(firstHalfMainMarketResult[1].attr) * 1}` : "").toString()}</span>
                                                                                    <span className="odd-td-right">{firstHalfMainMarketResult[1].results && firstHalfMainMarketResult[1].results[0] ? firstHalfMainMarketResult[1].results[0].oddValue : ""}</span>
                                                                                </td>
                                                                                <td className={`match-odds match-event ${firstHalfMainMarketResult[2] && firstHalfMainMarketResult[2].results[0] ? firstHalfMainMarketResult[2].results[0].updated : ""}`} id={`${firstHalfMainMarketResult[2].results && firstHalfMainMarketResult[2].results[0] ? firstHalfMainMarketResult[2].results[0].id : ""}`} onClick={e => { handleBetSlip(firstHalfMainMarketResult[2], item, 0) }} >
                                                                                    <span className="odd-td-left">{(firstHalfMainMarketResult[2] && firstHalfMainMarketResult[2].attr ? `O ${firstHalfMainMarketResult[2].attr}` : "").toString()}</span>
                                                                                    <span className="odd-td-right">{firstHalfMainMarketResult[2].results && firstHalfMainMarketResult[2].results[0] ? firstHalfMainMarketResult[2].results[0].oddValue : ""}</span>
                                                                                </td>
                                                                                <td className="match-odds more-odds" rowSpan="3"><a href={`/event/${item.Id}`}>+{markets.length > 45 ? 45 : markets.length}</a></td>
                                                                            </tr>
                                                                            <tr>
                                                                                <td className="match-event">{getTextByLanguage(item.AwayTeam)}</td>
                                                                                <td className={`match-odds match-event ${mainMarketResult[0] && mainMarketResult[0].results[2] ? mainMarketResult[0].results[2].updated : ""}`} id={`${mainMarketResult[0].results && mainMarketResult[0].results[2] ? mainMarketResult[0].results[2].id : ""}`} onClick={e => { handleBetSlip(mainMarketResult[0], item, 2) }} >{mainMarketResult[0].results && mainMarketResult[0].results[2] ? mainMarketResult[0].results[2].oddValue : ""}</td>
                                                                                <td className={`match-odds match-event ${mainMarketResult[1] && mainMarketResult[1].results[2] ? mainMarketResult[1].results[2].updated : ""}`} id={`${mainMarketResult[1].results && mainMarketResult[1].results[2] ? mainMarketResult[1].results[2].id : ""}`} onClick={e => { handleBetSlip(mainMarketResult[1], item, 2) }} >
                                                                                    <span className="odd-td-left">{(mainMarketResult[1] && mainMarketResult[1].attr ? mainMarketResult[1].attr * -1 : "").toString()}</span>
                                                                                    <span className="odd-td-right">{mainMarketResult[1].results && mainMarketResult[1].results[2] ? mainMarketResult[1].results[2].oddValue : ""}</span>
                                                                                </td>
                                                                                <td className={`match-odds match-event ${mainMarketResult[2] && mainMarketResult[2].results[1] ? mainMarketResult[2].results[1].updated : ""}`} id={`${mainMarketResult[2].results && mainMarketResult[2].results[1] ? mainMarketResult[2].results[1].id : ""}`} onClick={e => { handleBetSlip(mainMarketResult[2], item, 1) }} >
                                                                                    <span className="odd-td-left">{(mainMarketResult[2] && mainMarketResult[2].attr ? `U ${mainMarketResult[2].attr}` : "").toString()}</span>
                                                                                    <span className="odd-td-right">{mainMarketResult[2].results && mainMarketResult[2].results[1] ? mainMarketResult[2].results[1].oddValue : ""}</span>
                                                                                </td>
                                                                                <td className={`match-odds match-event ${firstHalfMainMarketResult[0] && firstHalfMainMarketResult[0].results[1] ? firstHalfMainMarketResult[0].results[1].updated : ""}`} id={`${firstHalfMainMarketResult[0].results && firstHalfMainMarketResult[0].results[2] ? firstHalfMainMarketResult[0].results[2].id : ""}`} onClick={e => { handleBetSlip(firstHalfMainMarketResult[0], item, 2) }} >{firstHalfMainMarketResult[0].results && firstHalfMainMarketResult[0].results[2] ? firstHalfMainMarketResult[0].results[2].oddValue : ""}</td>
                                                                                <td className={`match-odds match-event ${firstHalfMainMarketResult[1] && firstHalfMainMarketResult[1].results[2] ? firstHalfMainMarketResult[1].results[2].updated : ""}`} id={`${firstHalfMainMarketResult[1].results && firstHalfMainMarketResult[1].results[2] ? firstHalfMainMarketResult[1].results[2].id : ""}`} onClick={e => { handleBetSlip(firstHalfMainMarketResult[1], item, 2) }} >
                                                                                    <span className="odd-td-left">{(firstHalfMainMarketResult[1] && firstHalfMainMarketResult[1].attr ? firstHalfMainMarketResult[1].attr * -1 : "").toString()}</span>
                                                                                    <span className="odd-td-right">{firstHalfMainMarketResult[1].results && firstHalfMainMarketResult[1].results[2] ? firstHalfMainMarketResult[1].results[2].oddValue : ""}</span>
                                                                                </td>
                                                                                <td className={`match-odds match-event ${firstHalfMainMarketResult[2] && firstHalfMainMarketResult[2].results[1] ? firstHalfMainMarketResult[2].results[1].updated : ""}`} id={`${firstHalfMainMarketResult[2].results && firstHalfMainMarketResult[2].results[1] ? firstHalfMainMarketResult[2].results[1].id : ""}`} onClick={e => { handleBetSlip(firstHalfMainMarketResult[2], item, 1) }} >
                                                                                    <span className="odd-td-left">{(firstHalfMainMarketResult[2] && firstHalfMainMarketResult[2].attr ? `U ${firstHalfMainMarketResult[2].attr}` : "").toString()}</span>
                                                                                    <span className="odd-td-right">{firstHalfMainMarketResult[2].results && firstHalfMainMarketResult[2].results[1] ? firstHalfMainMarketResult[2].results[1].oddValue : ""}</span>
                                                                                </td>
                                                                            </tr>
                                                                            <tr>
                                                                                <td className="match-draft">{getTextByLanguage("Draw")}</td>
                                                                                <td className={`match-odds match-draft ${mainMarketResult[0] && mainMarketResult[0].results[1] ? mainMarketResult[0].results[1].updated : ""}`} id={`${mainMarketResult[0].results && mainMarketResult[0].results[1] ? mainMarketResult[0].results[1].id : ""}`} onClick={e => { handleBetSlip(mainMarketResult[0], item, 1) }} >{mainMarketResult[0].results && mainMarketResult[0].results[1] ? mainMarketResult[0].results[1].oddValue : ""}</td>
                                                                                <td className={`match-odds match-draft ${mainMarketResult[1] && mainMarketResult[1].results[1] ? mainMarketResult[1].results[1].updated : ""}`} id={`${mainMarketResult[1].results && mainMarketResult[1].results[1] ? mainMarketResult[1].results[1].id : ""}`} onClick={e => { handleBetSlip(mainMarketResult[1], item, 1) }} >
                                                                                    {/* <span className="odd-td-left">{(mainMarketResult[1] && mainMarketResult[1].attr ? mainMarketResult[1].attr * -1 : "").toString()}</span> */}
                                                                                    {/* <span classNameodds="odd-td-right">{mainMarketResult[1].results && mainMarketResult[1].results[1] ? mainMarketResult[1].results[1].oddValue : ""}</span> */}
                                                                                </td>
                                                                                <td className={`match-odds match-draft ${mainMarketResult[2] && mainMarketResult[2].results[2] ? mainMarketResult[2].results[2].updated : ""}`} id={`${mainMarketResult[2].results && mainMarketResult[2].results[2] ? mainMarketResult[2].results[2].id : ""}`} onClick={e => { handleBetSlip(mainMarketResult[2], item, 2) }} >
                                                                                    {/* <span className="odd-td-left">{(mainMarketResult[2] && mainMarketResult[2].attr ? `U ${mainMarketResult[2].attr}` : "").toString()}</span> */}
                                                                                    <span className="odd-td-right">{mainMarketResult[2].results && mainMarketResult[2].results[2] ? mainMarketResult[2].results[2].oddValue : ""}</span>
                                                                                </td>
                                                                                <td className={`match-odds match-draft ${firstHalfMainMarketResult[0] && firstHalfMainMarketResult[0].results[2] ? firstHalfMainMarketResult[0].results[2].updated : ""}`} id={`${firstHalfMainMarketResult[0].results && firstHalfMainMarketResult[0].results[1] ? firstHalfMainMarketResult[0].results[1].id : ""}`} onClick={e => { handleBetSlip(firstHalfMainMarketResult[0], item, 1) }} >{firstHalfMainMarketResult[0].results && firstHalfMainMarketResult[0].results[1] ? firstHalfMainMarketResult[0].results[1].oddValue : ""}</td>
                                                                                <td className={`match-odds match-draft ${firstHalfMainMarketResult[1] && firstHalfMainMarketResult[1].results[1] ? firstHalfMainMarketResult[1].results[1].updated : ""}`} id={`${firstHalfMainMarketResult[1].results && firstHalfMainMarketResult[1].results[1] ? firstHalfMainMarketResult[1].results[1].id : ""}`} onClick={e => { handleBetSlip(firstHalfMainMarketResult[1], item, 1) }} >
                                                                                    {/* <span className="odd-td-left">{(firstHalfMainMarketResult[1] && firstHalfMainMarketResult[1].attr ? firstHalfMainMarketResult[1].attr * -1 : "").toString()}</span>
                                                                                            <span className="odd-td-right">{firstHalfMainMarketResult[1].results && firstHalfMainMarketResult[1].results[1] ? firstHalfMainMarketResult[1].results[1].oddValue : ""}</span> */}
                                                                                </td>
                                                                                <td className={`match- match-draft ${firstHalfMainMarketResult[2] && firstHalfMainMarketResult[2].results[2] ? firstHalfMainMarketResult[2].results[2].updated : ""}`} id={`${firstHalfMainMarketResult[2].results && firstHalfMainMarketResult[2].results[2] ? firstHalfMainMarketResult[2].results[2].id : ""}`} onClick={e => { handleBetSlip(firstHalfMainMarketResult[2], item, 2) }} >
                                                                                    {/* <span className="odd-td-left">{(firstHalfMainMarketResult[2] && firstHalfMainMarketResult[2].attr ? `U ${firstHalfMainMarketResult[2].attr}` : "").toString()}</span> */}
                                                                                    <span className="odd-td-right">{firstHalfMainMarketResult[2].results && firstHalfMainMarketResult[2].results[2] ? firstHalfMainMarketResult[2].results[2].oddValue : ""}</span>
                                                                                </td>
                                                                            </tr>
                                                                        </tbody>
                                                                    </table>
                                                                </React.Fragment>
                                                            )
                                                        })
                                                    }
                                                </div>
                                            </CardBody>
                                        </React.Fragment>

                                    )
                                }
                            })}
                        </Card>
                    </TabPane>
                    <TabPane tabId='3'>
                        <Card className="b-team__list">
                            {Object.keys(eventData).map((key, index) => {
                                const eventArray = eventData[key]
                                if (eventArray.length > 0) {
                                    let flagImg = "all_leagues"
                                    let regionName = eventArray[0].RegionName.replaceAll("(", "")
                                    regionName = eventArray[0].RegionName.replaceAll(")", "")
                                    regionName = eventArray[0].RegionName.replaceAll(" ", "")
                                    if (flagsByRegionName[regionName]) {
                                        flagImg = flagsByRegionName[regionName]
                                    } else {
                                        flagImg = regionName
                                    }
                                    return (
                                        <React.Fragment key={index}>
                                            <CardHeader >
                                                <div className="left d-flex align-items-center">
                                                    <h2 id="soccer-game" className="soccer mr-1">{sportsNameById[eventArray[0]["SportId"]]}</h2>
                                                    <span onClick={e => { handleRefresh() }} className={`timer-number d-flex align-items-center ${isRefreshing ? "refresh-loading" : ""}`}>{timerNumber}</span>
                                                </div>
                                                <div className="right">
                                                    {/* <a className="fav-link" href="" data-nsfw-filter-status="swf">Favourite Events</a> */}
                                                </div>
                                            </CardHeader>
                                            <CardBody className="b-team pt-0 pb-0">
                                                <div className="table-wrapper">
                                                    <table className="table table-bordered">
                                                        {
                                                            eventArray.map((item, order) => {
                                                                const mainMarketResultKey = mainMarketResultBySportId["4"]
                                                                let markets = []
                                                                const mainMarketResult = ["", "", ""]
                                                                const firstHalfMainMarketResult = ["", "", ""]
                                                                let favorId = ""
                                                                const homeTeamScore = item.Scoreboard && item.Scoreboard.score ? item.Scoreboard.score.split(":")[0] : ""
                                                                const awayTeamScore = item.Scoreboard && item.Scoreboard.score ? item.Scoreboard.score.split(":")[1] : ""
                                                                // const currentTime = item.Scoreboard && item.Scoreboard.timer ? parseInt((new Date(item.Scoreboard.timer.base) - new Date(item.Date)) / (60 * 1000)) : ""
                                                                const currentTime = item.Scoreboard && item.Scoreboard.timer ? parseInt(item.Scoreboard.timer.seconds / 60) : ""
                                                                favorId = item.Id.replace(":", "")
                                                                if (item.Markets.length > 0) {
                                                                    markets = item.Markets
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
                                                                return (
                                                                    <React.Fragment key={order}>
                                                                        <div className="title py-1">
                                                                            <div className="left">
                                                                                <h3>
                                                                                    <img src={`https://getbet77.com/files/flags1/${flagImg}.png`} alt="" />
                                                                                    <span data-nsfw-filter-status="swf">{item["LeagueName"]}</span>
                                                                                </h3>
                                                                            </div>
                                                                        </div>
                                                                        <table className="table-style table table-bordered">
                                                                            <tbody>
                                                                                <tr className="table-header">
                                                                                    <td rowSpan="2">
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
                                                                                <tr>
                                                                                    <td rowSpan="3" className="">
                                                                                        <div className="d-flex mb-1 justify-content-center" id={`favor_${favorId}`} onClick={e => { handleFavor(item, favorId) }}><Star className={`favor-icon active`} /></div>
                                                                                        <div className="d-flex justify-content-center">{moment(item.Date).format('MM/DD HH:mm')}</div>
                                                                                        {/* <div className="d-flex justify-content-center">{currentTime}"</div> */}
                                                                                    </td>
                                                                                    <td className="match-event">{getTextByLanguage(item.HomeTeam)}</td>
                                                                                    <td className={`match-odds match-event ${mainMarketResult[0] && mainMarketResult[0].results[0] ? mainMarketResult[0].results[0].updated : ""}`} id={`${mainMarketResult[0].results && mainMarketResult[0].results[0] ? mainMarketResult[0].results[0].id : ""}`} onClick={e => { handleBetSlip(mainMarketResult[0], item, 0) }} >{mainMarketResult[0].results && mainMarketResult[0].results[0] ? mainMarketResult[0].results[0].oddValue : ""}</td>
                                                                                    <td className={`match-odds match-event ${mainMarketResult[1] && mainMarketResult[1].results[0] ? mainMarketResult[1].results[0].updated : ""}`} id={`${mainMarketResult[1].results && mainMarketResult[1].results[0] ? mainMarketResult[1].results[0].id : ""}`} onClick={e => { handleBetSlip(mainMarketResult[1], item, 0) }} >
                                                                                        <span className="odd-td-left">{(mainMarketResult[1] && mainMarketResult[1].attr ? `+ ${parseFloat(mainMarketResult[1].attr) * 1}` : "").toString()}</span>
                                                                                        <span className="odd-td-right">{mainMarketResult[1].results && mainMarketResult[1].results[0] ? mainMarketResult[1].results[0].oddValue : ""}</span>
                                                                                    </td>
                                                                                    <td className={`match-odds match-event ${mainMarketResult[2] && mainMarketResult[2].results[0] ? mainMarketResult[2].results[0].updated : ""}`} id={`${mainMarketResult[2].results && mainMarketResult[2].results[0] ? mainMarketResult[2].results[0].id : ""}`} onClick={e => { handleBetSlip(mainMarketResult[2], item, 0) }} >
                                                                                        <span className="odd-td-left">{(mainMarketResult[2] && mainMarketResult[2].attr ? `O ${mainMarketResult[2].attr}` : "").toString()}</span>
                                                                                        <span className="odd-td-right">{mainMarketResult[2].results && mainMarketResult[2].results[0] ? mainMarketResult[2].results[0].oddValue : ""}</span>
                                                                                    </td>
                                                                                    <td className={`match-odds match-event ${firstHalfMainMarketResult[0] && firstHalfMainMarketResult[0].results[0] ? firstHalfMainMarketResult[0].results[0].updated : ""}`} id={`${firstHalfMainMarketResult[0].results && firstHalfMainMarketResult[0].results[0] ? firstHalfMainMarketResult[0].results[0].id : ""}`} onClick={e => { handleBetSlip(firstHalfMainMarketResult[0], item, 0) }} >{firstHalfMainMarketResult[0].results && firstHalfMainMarketResult[0].results[0] ? firstHalfMainMarketResult[0].results[0].oddValue : ""}</td>
                                                                                    <td className={`match-odds match-event ${firstHalfMainMarketResult[1] && firstHalfMainMarketResult[1].results[0] ? firstHalfMainMarketResult[1].results[0].updated : ""}`} id={`${firstHalfMainMarketResult[1].results && firstHalfMainMarketResult[1].results[0] ? firstHalfMainMarketResult[1].results[0].id : ""}`} onClick={e => { handleBetSlip(firstHalfMainMarketResult[1], item, 0) }} >
                                                                                        <span className="odd-td-left">{(firstHalfMainMarketResult[1] && firstHalfMainMarketResult[1].attr ? `+ ${parseFloat(firstHalfMainMarketResult[1].attr) * 1}` : "").toString()}</span>
                                                                                        <span className="odd-td-right">{firstHalfMainMarketResult[1].results && firstHalfMainMarketResult[1].results[0] ? firstHalfMainMarketResult[1].results[0].oddValue : ""}</span>
                                                                                    </td>
                                                                                    <td className={`match-odds match-event ${firstHalfMainMarketResult[2] && firstHalfMainMarketResult[2].results[0] ? firstHalfMainMarketResult[2].results[0].updated : ""}`} id={`${firstHalfMainMarketResult[2].results && firstHalfMainMarketResult[2].results[0] ? firstHalfMainMarketResult[2].results[0].id : ""}`} onClick={e => { handleBetSlip(firstHalfMainMarketResult[2], item, 0) }} >
                                                                                        <span className="odd-td-left">{(firstHalfMainMarketResult[2] && firstHalfMainMarketResult[2].attr ? `O ${firstHalfMainMarketResult[2].attr}` : "").toString()}</span>
                                                                                        <span className="odd-td-right">{firstHalfMainMarketResult[2].results && firstHalfMainMarketResult[2].results[0] ? firstHalfMainMarketResult[2].results[0].oddValue : ""}</span>
                                                                                    </td>
                                                                                    <td className="match-odds more-odds" rowSpan="3"><a href={`/event/${item.Id}`}>+{markets.length > 45 ? 45 : markets.length}</a></td>
                                                                                </tr>
                                                                                <tr>
                                                                                    <td className="match-event">{getTextByLanguage(item.AwayTeam)}</td>
                                                                                    <td className={`match-odds match-event ${mainMarketResult[0] && mainMarketResult[0].results[2] ? mainMarketResult[0].results[2].updated : ""}`} id={`${mainMarketResult[0].results && mainMarketResult[0].results[2] ? mainMarketResult[0].results[2].id : ""}`} onClick={e => { handleBetSlip(mainMarketResult[0], item, 2) }} >{mainMarketResult[0].results && mainMarketResult[0].results[2] ? mainMarketResult[0].results[2].oddValue : ""}</td>
                                                                                    <td className={`match-odds match-event ${mainMarketResult[1] && mainMarketResult[1].results[2] ? mainMarketResult[1].results[2].updated : ""}`} id={`${mainMarketResult[1].results && mainMarketResult[1].results[2] ? mainMarketResult[1].results[2].id : ""}`} onClick={e => { handleBetSlip(mainMarketResult[1], item, 2) }} >
                                                                                        <span className="odd-td-left">{(mainMarketResult[1] && mainMarketResult[1].attr ? mainMarketResult[1].attr * -1 : "").toString()}</span>
                                                                                        <span className="odd-td-right">{mainMarketResult[1].results && mainMarketResult[1].results[2] ? mainMarketResult[1].results[2].oddValue : ""}</span>
                                                                                    </td>
                                                                                    <td className={`match-odds match-event ${mainMarketResult[2] && mainMarketResult[2].results[1] ? mainMarketResult[2].results[1].updated : ""}`} id={`${mainMarketResult[2].results && mainMarketResult[2].results[1] ? mainMarketResult[2].results[1].id : ""}`} onClick={e => { handleBetSlip(mainMarketResult[2], item, 1) }} >
                                                                                        <span className="odd-td-left">{(mainMarketResult[2] && mainMarketResult[2].attr ? `U ${mainMarketResult[2].attr}` : "").toString()}</span>
                                                                                        <span className="odd-td-right">{mainMarketResult[2].results && mainMarketResult[2].results[1] ? mainMarketResult[2].results[1].oddValue : ""}</span>
                                                                                    </td>
                                                                                    <td className={`match-odds match-event ${firstHalfMainMarketResult[0] && firstHalfMainMarketResult[0].results[1] ? firstHalfMainMarketResult[0].results[1].updated : ""}`} id={`${firstHalfMainMarketResult[0].results && firstHalfMainMarketResult[0].results[2] ? firstHalfMainMarketResult[0].results[2].id : ""}`} onClick={e => { handleBetSlip(firstHalfMainMarketResult[0], item, 2) }} >{firstHalfMainMarketResult[0].results && firstHalfMainMarketResult[0].results[2] ? firstHalfMainMarketResult[0].results[2].oddValue : ""}</td>
                                                                                    <td className={`match-odds match-event ${firstHalfMainMarketResult[1] && firstHalfMainMarketResult[1].results[2] ? firstHalfMainMarketResult[1].results[2].updated : ""}`} id={`${firstHalfMainMarketResult[1].results && firstHalfMainMarketResult[1].results[2] ? firstHalfMainMarketResult[1].results[2].id : ""}`} onClick={e => { handleBetSlip(firstHalfMainMarketResult[1], item, 2) }} >
                                                                                        <span className="odd-td-left">{(firstHalfMainMarketResult[1] && firstHalfMainMarketResult[1].attr ? firstHalfMainMarketResult[1].attr * -1 : "").toString()}</span>
                                                                                        <span className="odd-td-right">{firstHalfMainMarketResult[1].results && firstHalfMainMarketResult[1].results[2] ? firstHalfMainMarketResult[1].results[2].oddValue : ""}</span>
                                                                                    </td>
                                                                                    <td className={`match-odds match-event ${firstHalfMainMarketResult[2] && firstHalfMainMarketResult[2].results[1] ? firstHalfMainMarketResult[2].results[1].updated : ""}`} id={`${firstHalfMainMarketResult[2].results && firstHalfMainMarketResult[2].results[1] ? firstHalfMainMarketResult[2].results[1].id : ""}`} onClick={e => { handleBetSlip(firstHalfMainMarketResult[2], item, 1) }} >
                                                                                        <span className="odd-td-left">{(firstHalfMainMarketResult[2] && firstHalfMainMarketResult[2].attr ? `U ${firstHalfMainMarketResult[2].attr}` : "").toString()}</span>
                                                                                        <span className="odd-td-right">{firstHalfMainMarketResult[2].results && firstHalfMainMarketResult[2].results[1] ? firstHalfMainMarketResult[2].results[1].oddValue : ""}</span>
                                                                                    </td>
                                                                                </tr>
                                                                                <tr>
                                                                                    <td className="match-draft">{getTextByLanguage("Draw")}</td>
                                                                                    <td className={`match-odds match-draft ${mainMarketResult[0] && mainMarketResult[0].results[1] ? mainMarketResult[0].results[1].updated : ""}`} id={`${mainMarketResult[0].results && mainMarketResult[0].results[1] ? mainMarketResult[0].results[1].id : ""}`} onClick={e => { handleBetSlip(mainMarketResult[0], item, 1) }} >{mainMarketResult[0].results && mainMarketResult[0].results[1] ? mainMarketResult[0].results[1].oddValue : ""}</td>
                                                                                    <td className={`match-odds match-draft ${mainMarketResult[1] && mainMarketResult[1].results[1] ? mainMarketResult[1].results[1].updated : ""}`} id={`${mainMarketResult[1].results && mainMarketResult[1].results[1] ? mainMarketResult[1].results[1].id : ""}`} onClick={e => { handleBetSlip(mainMarketResult[1], item, 1) }} >
                                                                                        {/* <span className="odd-td-left">{(mainMarketResult[1] && mainMarketResult[1].attr ? mainMarketResult[1].attr * -1 : "").toString()}</span> */}
                                                                                        {/* <span classNameodds="odd-td-right">{mainMarketResult[1].results && mainMarketResult[1].results[1] ? mainMarketResult[1].results[1].oddValue : ""}</span> */}
                                                                                    </td>
                                                                                    <td className={`match-odds match-draft ${mainMarketResult[2] && mainMarketResult[2].results[2] ? mainMarketResult[2].results[2].updated : ""}`} id={`${mainMarketResult[2].results && mainMarketResult[2].results[2] ? mainMarketResult[2].results[2].id : ""}`} onClick={e => { handleBetSlip(mainMarketResult[2], item, 2) }} >
                                                                                        {/* <span className="odd-td-left">{(mainMarketResult[2] && mainMarketResult[2].attr ? `U ${mainMarketResult[2].attr}` : "").toString()}</span> */}
                                                                                        <span className="odd-td-right">{mainMarketResult[2].results && mainMarketResult[2].results[2] ? mainMarketResult[2].results[2].oddValue : ""}</span>
                                                                                    </td>
                                                                                    <td className={`match-odds match-draft ${firstHalfMainMarketResult[0] && firstHalfMainMarketResult[0].results[2] ? firstHalfMainMarketResult[0].results[2].updated : ""}`} id={`${firstHalfMainMarketResult[0].results && firstHalfMainMarketResult[0].results[1] ? firstHalfMainMarketResult[0].results[1].id : ""}`} onClick={e => { handleBetSlip(firstHalfMainMarketResult[0], item, 1) }} >{firstHalfMainMarketResult[0].results && firstHalfMainMarketResult[0].results[1] ? firstHalfMainMarketResult[0].results[1].oddValue : ""}</td>
                                                                                    <td className={`match-odds match-draft ${firstHalfMainMarketResult[1] && firstHalfMainMarketResult[1].results[1] ? firstHalfMainMarketResult[1].results[1].updated : ""}`} id={`${firstHalfMainMarketResult[1].results && firstHalfMainMarketResult[1].results[1] ? firstHalfMainMarketResult[1].results[1].id : ""}`} onClick={e => { handleBetSlip(firstHalfMainMarketResult[1], item, 1) }} >
                                                                                        {/* <span className="odd-td-left">{(firstHalfMainMarketResult[1] && firstHalfMainMarketResult[1].attr ? firstHalfMainMarketResult[1].attr * -1 : "").toString()}</span>
                                                                                            <span className="odd-td-right">{firstHalfMainMarketResult[1].results && firstHalfMainMarketResult[1].results[1] ? firstHalfMainMarketResult[1].results[1].oddValue : ""}</span> */}
                                                                                    </td>
                                                                                    <td className={`match- match-draft ${firstHalfMainMarketResult[2] && firstHalfMainMarketResult[2].results[2] ? firstHalfMainMarketResult[2].results[2].updated : ""}`} id={`${firstHalfMainMarketResult[2].results && firstHalfMainMarketResult[2].results[2] ? firstHalfMainMarketResult[2].results[2].id : ""}`} onClick={e => { handleBetSlip(firstHalfMainMarketResult[2], item, 2) }} >
                                                                                        {/* <span className="odd-td-left">{(firstHalfMainMarketResult[2] && firstHalfMainMarketResult[2].attr ? `U ${firstHalfMainMarketResult[2].attr}` : "").toString()}</span> */}
                                                                                        <span className="odd-td-right">{firstHalfMainMarketResult[2].results && firstHalfMainMarketResult[2].results[2] ? firstHalfMainMarketResult[2].results[2].oddValue : ""}</span>
                                                                                    </td>
                                                                                </tr>
                                                                            </tbody>
                                                                        </table>
                                                                    </React.Fragment>
                                                                )
                                                            })
                                                        }
                                                    </table>
                                                </div>
                                            </CardBody>
                                        </React.Fragment>

                                    )
                                }
                            })}
                        </Card>
                    </TabPane>
                </TabContent>
                <BetSlipCmp />
            </div>
        </div>
    )
}

export default FavoriteCmp
