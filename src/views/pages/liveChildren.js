import React, { useCallback, useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import {
    TabContent, TabPane, Nav, NavItem, NavLink,
    Card, CardHeader, CardBody
} from 'reactstrap'
import Axios from '../../utility/hooks/Axios'
import { toast } from 'react-toastify'
import Spinner from "@components/spinner/Fallback-spinner"
import { Lock, Star } from 'react-feather'
import moment from 'moment'
import { flagsByRegionName, mainMarketResultBySportId } from '../../configs/mainConfig'
import $, { isEmptyObject } from "jquery"
import { addBetSlipData, changeOdds } from '../../redux/actions/sports'
import { useDispatch, useSelector } from 'react-redux'
import ReactInterval from 'react-interval'
import { useTranslator } from '@hooks/useTranslator'
import { getOddType } from '@utils'

const LiveChildren = () => {
    const [active, setActive] = useState('1')
    const [SportId, setSportId] = useState(4)
    const [sportsData, setSportsData] = useState(null)
    const [isLoading, setIsLoading] = useState(true)
    const [isRefreshing, setRefreshing] = useState(false)
    const [eventData, setEventData] = useState([])
    const [leagueData, setLeagueData] = useState(null)
    const [timerNumber, setTimerNumber] = useState(30)
    const slipType = useSelector(state => { return state.sports.betSlipType })
    const betSlipData = useSelector(state => { return state.sports.betSlipData })
    const dispatch = useDispatch()
    const [oddType, setOddType] = useState("odds")
    const [clientPlatform, setClientPlatform] = useState("desktop")
    const [getTextByLanguage] = useTranslator()

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
        if (data.results && data.results[index] && event) {
            if (data.results[index]["odds"] < 100 && data.results[index][oddType]) {
                const result = {
                    HomeTeam: event.HomeTeam,
                    AwayTeam: event.AwayTeam,
                    LeagueName: event.LeagueName,
                    SportName: event.SportName,
                    odds: data.results[index][oddType],
                    HomeTeamScore: event.Scoreboard && event.Scoreboard.score ? event.Scoreboard.score.split(":")[0] : "-",
                    AwayTeamScore: event.Scoreboard && event.Scoreboard.score ? event.Scoreboard.score.split(":")[1] : "-",
                    name: data.results[index].name.value,
                    live: !event.IsPreMatch,
                    id: data.results[index].id,
                    eventId: event.Id,
                    leagueId: event.LeagueId,
                    marketId: data.id,
                    IsPreMatch: event.IsPreMatch,
                    isOddChanged: false,

                    our_event_id: event.our_event_id,
                    period: data.Period,
                    marketType: data.MarketType,
                    team: index === 0 ? "1" : (index === 1 ? "Draw" : "2")
                }
                console.log(result)
                const checkValue = dispatch(addBetSlipData(betSlipData, result, slipType))
                if (checkValue) {
                    $(`#${data.results[index].id}`).addClass("active")
                } else {
                    $(`#${data.results[index].id}`).removeClass("active")
                }
            }
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
                                        console.log("changed odd")
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
        setLeagueData(data.leagueData)
        setEventData(data.eventData)
    }

    const getLeagueDataBySportId = async (id, tab) => {
        // setIsLoading(true)
        const request = {
            SportId: id
        }
        const response = await Axios({
            endpoint: "/sports/get-live",
            method: "POST",
            params: request
        })
        console.log(response)
        if (response.status === 200) {
            setLeagueData(response.data.leagueData)
            setEventData(response.data.eventData)
            handleChangeSlipData(response.data.eventData)
            setOddType(getOddType())
            setIsLoading(false)
            setTimerNumber(30)
        } else {
            setIsLoading(true)
            toast.error(response.data)
        }
    }

    const toggle = (tab, id) => {
        if (active !== tab) {
            setActive(tab)
        }
        setSportId(id)
        getLeagueDataBySportId(id, tab)
    }

    const handleSelectedSlipStyle = async () => {
        for (const i in betSlipData) {
            console.log($(`#${betSlipData[i].id}`))
            $(`#${betSlipData[i].id}`).addClass("active")
        }
    }

    const handleRefresh = async () => {
        console.log("handleRefresh")
        setRefreshing(true)
        const request = {
            SportId
        }
        const response = await Axios({
            endpoint: "/sports/get-live",
            method: "POST",
            params: request
        })
        console.log(response)
        if (response.status === 200) {
            handleOddChange(response.data)
            handleChangeSlipData(response.data.eventData)
            setRefreshing(false)
        } else {
            setRefreshing(true)
            toast.error(response.data)
        }
        handleSelectedSlipStyle()
    }

    const handleTimer = async () => {
        if (timerNumber === 0) {
            setTimerNumber(30)
            handleRefresh()
        } else {
            setTimerNumber(timerNumber - 1)
        }
    }

    useEffect(() => {
        if (window.innerWidth < 1184) {
            setClientPlatform("mobile")
        } else {
            setClientPlatform("desktop")
        }
        getLeagueDataBySportId(SportId)
    }, [])

    return (
        <React.Fragment>
            <ReactInterval timeout={1000} enabled={true} callback={e => { handleTimer() }} />
            {isLoading ? <Spinner color='white' size='lg' /> : (
                <React.Fragment>
                    <Nav tabs className="category-links m-0">
                        <NavItem className="live-bet-tabs">
                            <NavLink
                                active={active === '1'}
                                onClick={() => {
                                    toggle('1', 4)
                                }}
                            >
                                {getTextByLanguage("Football")}
                            </NavLink>
                        </NavItem>
                        <NavItem className="live-bet-tabs">
                            <NavLink
                                active={active === '2'}
                                onClick={() => {
                                    toggle('2', 56)
                                }}
                            >
                                {getTextByLanguage("Table Tennis")}
                            </NavLink>
                        </NavItem>
                        <NavItem className="live-bet-tabs">
                            <NavLink
                                active={active === '3'}
                                onClick={() => {
                                    toggle('3', 7)
                                }}
                            >
                                {getTextByLanguage("Basketball")}
                            </NavLink>
                        </NavItem>
                        <NavItem className="live-bet-tabs">
                            <NavLink
                                active={active === '4'}
                                onClick={() => {
                                    toggle('4', 5)
                                }}
                            >
                                {getTextByLanguage("Tennis")}
                            </NavLink>
                        </NavItem>
                        <NavItem className="live-bet-tabs">
                            <NavLink
                                active={active === '5'}
                                onClick={() => {
                                    toggle('5', 12)
                                }}
                            >
                                {getTextByLanguage("Ice Hockey")}
                            </NavLink>
                        </NavItem>
                        <NavItem className="live-bet-tabs">
                            <NavLink
                                active={active === '6'}
                                onClick={() => {
                                    toggle('6', 18)
                                }}
                            >
                                {getTextByLanguage("Volleyball")}
                            </NavLink>
                        </NavItem>
                    </Nav>
                    < TabContent className={`category-content ${clientPlatform === "desktop" ? "mr-5" : "mr-1"}`} activeTab={active} style={{ width: "70%" }}>
                        <TabPane tabId='1'>
                            {
                                active === "1" ? (
                                    <Card className="b-team__list">
                                        <CardHeader >
                                            <div className="left d-flex align-items-center">
                                                <h2 id={`sport-title-4`} className="soccer m-auto pl-3 p-1">{getTextByLanguage("Football")}</h2>
                                                <span onClick={e => { handleRefresh() }} className={`timer-number d-flex align-items-center ${isRefreshing ? "refresh-loading" : ""}`}>{timerNumber}</span>
                                            </div>
                                            <div className="right">
                                                <a className="fav-link mr-2" href="/favorite" data-nsfw-filter-status="swf">{getTextByLanguage("Favourite Events")}</a>
                                            </div>
                                        </CardHeader >
                                        {
                                            Object.keys(leagueData).map((key, index) => {
                                                const league = leagueData[key]
                                                let flagImg = "all_leagues"
                                                let regionName = league[0].RegionName.replaceAll("(", "")
                                                regionName = league[0].RegionName.replaceAll(")", "")
                                                regionName = league[0].RegionName.replaceAll(" ", "")
                                                if (flagsByRegionName[regionName]) {
                                                    flagImg = flagsByRegionName[regionName]
                                                } else {
                                                    flagImg = regionName
                                                }
                                                return (
                                                    <React.Fragment key={index}>
                                                        <div className="title py-1">
                                                            <div className="left">
                                                                <h3>
                                                                    <img src={`https://getbet77.com/files/flags1/${flagImg}.png`} alt="" />
                                                                    <span data-nsfw-filter-status="swf">{getTextByLanguage(league[0]["RegionName"])} {getTextByLanguage(league[0]["LeagueName"])}</span>
                                                                </h3>
                                                            </div>
                                                        </div>
                                                        <CardBody className="b-team pt-0 pb-0">
                                                            <div className="table-wrapper">
                                                                <table className="table table-bordered">
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
                                                                        {
                                                                            league.map((item, order) => {
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
                                                                                if (eventData[item.Id]) {
                                                                                    markets = eventData[item.Id].Markets
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
                                                                                        <tr>
                                                                                            <td rowSpan="3" className="">
                                                                                                <div className="d-flex mb-1 justify-content-center" id={`favor_${favorId}`} onClick={e => { handleFavor(item, favorId) }}><Star className={`favor-icon ${item.favor ? "active" : ""} `} /></div>
                                                                                                {/* <div className="d-flex justify-content-center">{moment(item.Date).format('MM/DD/ hh:mm')}</div> */}
                                                                                                <div className="d-flex justify-content-center">{currentTime}"</div>
                                                                                            </td>
                                                                                            <td className="match-event">
                                                                                                <span className='team-name'>{homeTeamScore} - {getTextByLanguage(item.HomeTeam)}</span>
                                                                                                {
                                                                                                    item.Scoreboard.yellowCards && item.Scoreboard.yellowCards.player1["255"] > 0 ? (
                                                                                                        <span className="yellow-card"><sup>{item.Scoreboard.yellowCards.player1["255"]}</sup></span>
                                                                                                    ) : null
                                                                                                }
                                                                                                {
                                                                                                    item.Scoreboard.redCards && item.Scoreboard.redCards.player1["255"] > 0 ? (
                                                                                                        <span className="red-card"><sup>{item.Scoreboard.redCards.player1["255"]}</sup></span>
                                                                                                    ) : null
                                                                                                }
                                                                                            </td>
                                                                                            <td className={`match-odds match-event ${mainMarketResult[0] && mainMarketResult[0].results[0] ? mainMarketResult[0].results[0].updated : ""}`} id={`${mainMarketResult[0].results && mainMarketResult[0].results[0] ? mainMarketResult[0].results[0].id : ""}`} onClick={e => { handleBetSlip(mainMarketResult[0], item, 0, '1') }} >{mainMarketResult[0].results && mainMarketResult[0].results[0] ? mainMarketResult[0].results[0].oddValue : ""}</td>
                                                                                            <td className={`match-odds match-event ${mainMarketResult[1] && mainMarketResult[1].results[0] ? mainMarketResult[1].results[0].updated : ""}`} id={`${mainMarketResult[1].results && mainMarketResult[1].results[0] ? mainMarketResult[1].results[0].id : ""}`} onClick={e => { handleBetSlip(mainMarketResult[1], item, 0, '1') }} >
                                                                                                <span className="odd-td-left">{(mainMarketResult[1] && mainMarketResult[1].attr ? `+ ${parseFloat(mainMarketResult[1].attr) * 1}` : "").toString()}</span>
                                                                                                <span className="odd-td-right">{mainMarketResult[1].results && mainMarketResult[1].results[0] ? mainMarketResult[1].results[0].oddValue : ""}</span>
                                                                                            </td>
                                                                                            <td className={`match-odds match-event ${mainMarketResult[2] && mainMarketResult[2].results[0] ? mainMarketResult[2].results[0].updated : ""}`} id={`${mainMarketResult[2].results && mainMarketResult[2].results[0] ? mainMarketResult[2].results[0].id : ""}`} onClick={e => { handleBetSlip(mainMarketResult[2], item, 0, '1') }} >
                                                                                                <span className="odd-td-left">{(mainMarketResult[2] && mainMarketResult[2].attr ? `O ${mainMarketResult[2].attr}` : "").toString()}</span>
                                                                                                <span className="odd-td-right">{mainMarketResult[2].results && mainMarketResult[2].results[0] ? mainMarketResult[2].results[0].oddValue : ""}</span>
                                                                                            </td>
                                                                                            <td className={`match-odds match-event ${firstHalfMainMarketResult[0] && firstHalfMainMarketResult[0].results[0] ? firstHalfMainMarketResult[0].results[0].updated : ""}`} id={`${firstHalfMainMarketResult[0].results && firstHalfMainMarketResult[0].results[0] ? firstHalfMainMarketResult[0].results[0].id : ""}`} onClick={e => { handleBetSlip(firstHalfMainMarketResult[0], item, 0, '1') }} >{firstHalfMainMarketResult[0].results && firstHalfMainMarketResult[0].results[0] ? firstHalfMainMarketResult[0].results[0].oddValue : ""}</td>
                                                                                            <td className={`match-odds match-event ${firstHalfMainMarketResult[1] && firstHalfMainMarketResult[1].results[0] ? firstHalfMainMarketResult[1].results[0].updated : ""}`} id={`${firstHalfMainMarketResult[1].results && firstHalfMainMarketResult[1].results[0] ? firstHalfMainMarketResult[1].results[0].id : ""}`} onClick={e => { handleBetSlip(firstHalfMainMarketResult[1], item, 0, '1') }} >
                                                                                                <span className="odd-td-left">{(firstHalfMainMarketResult[1] && firstHalfMainMarketResult[1].attr ? `+ ${parseFloat(firstHalfMainMarketResult[1].attr) * 1}` : "").toString()}</span>
                                                                                                <span className="odd-td-right">{firstHalfMainMarketResult[1].results && firstHalfMainMarketResult[1].results[0] ? firstHalfMainMarketResult[1].results[0].oddValue : ""}</span>
                                                                                            </td>
                                                                                            <td className={`match-odds match-event ${firstHalfMainMarketResult[2] && firstHalfMainMarketResult[2].results[0] ? firstHalfMainMarketResult[2].results[0].updated : ""}`} id={`${firstHalfMainMarketResult[2].results && firstHalfMainMarketResult[2].results[0] ? firstHalfMainMarketResult[2].results[0].id : ""}`} onClick={e => { handleBetSlip(firstHalfMainMarketResult[2], item, 0, '1') }} >
                                                                                                <span className="odd-td-left">{(firstHalfMainMarketResult[2] && firstHalfMainMarketResult[2].attr ? `O ${firstHalfMainMarketResult[2].attr}` : "").toString()}</span>
                                                                                                <span className="odd-td-right">{firstHalfMainMarketResult[2].results && firstHalfMainMarketResult[2].results[0] ? firstHalfMainMarketResult[2].results[0].oddValue : ""}</span>
                                                                                            </td>
                                                                                            <td className="match-odds more-odds" rowSpan="3"><a href={`/event/${item.Id}`}>+{markets.length > 45 ? 45 : markets.length}</a></td>
                                                                                        </tr>
                                                                                        <tr>
                                                                                            <td className="match-event">
                                                                                                <span className='team-name'>{awayTeamScore} -{getTextByLanguage(item.AwayTeam)}</span>
                                                                                                {
                                                                                                    item.Scoreboard.yellowCards && item.Scoreboard.yellowCards.player2["255"] > 0 ? (
                                                                                                        <span className="yellow-card"><sup>{item.Scoreboard.yellowCards.player2["255"]}</sup></span>
                                                                                                    ) : null
                                                                                                }
                                                                                                {
                                                                                                    item.Scoreboard.redCards && item.Scoreboard.redCards.player2["255"] > 0 ? (
                                                                                                        <span className="red-card"><sup>{item.Scoreboard.redCards.player2["255"]}</sup></span>
                                                                                                    ) : null
                                                                                                }
                                                                                            </td>
                                                                                            <td className={`match-odds match-event ${mainMarketResult[0] && mainMarketResult[0].results[2] ? mainMarketResult[0].results[2].updated : ""}`} id={`${mainMarketResult[0].results && mainMarketResult[0].results[2] ? mainMarketResult[0].results[2].id : ""}`} onClick={e => { handleBetSlip(mainMarketResult[0], item, 2, '2') }} >{mainMarketResult[0].results && mainMarketResult[0].results[2] ? mainMarketResult[0].results[2].oddValue : ""}</td>
                                                                                            <td className={`match-odds match-event ${mainMarketResult[1] && mainMarketResult[1].results[2] ? mainMarketResult[1].results[2].updated : ""}`} id={`${mainMarketResult[1].results && mainMarketResult[1].results[2] ? mainMarketResult[1].results[2].id : ""}`} onClick={e => { handleBetSlip(mainMarketResult[1], item, 2, '2') }} >
                                                                                                <span className="odd-td-left">{(mainMarketResult[1] && mainMarketResult[1].attr ? mainMarketResult[1].attr * -1 : "").toString()}</span>
                                                                                                <span className="odd-td-right">{mainMarketResult[1].results && mainMarketResult[1].results[2] ? mainMarketResult[1].results[2].oddValue : ""}</span>
                                                                                            </td>
                                                                                            <td className={`match-odds match-event ${mainMarketResult[2] && mainMarketResult[2].results[1] ? mainMarketResult[2].results[1].updated : ""}`} id={`${mainMarketResult[2].results && mainMarketResult[2].results[1] ? mainMarketResult[2].results[1].id : ""}`} onClick={e => { handleBetSlip(mainMarketResult[2], item, 1, '2') }} >
                                                                                                <span className="odd-td-left">{(mainMarketResult[2] && mainMarketResult[2].attr ? `U ${mainMarketResult[2].attr}` : "").toString()}</span>
                                                                                                <span className="odd-td-right">{mainMarketResult[2].results && mainMarketResult[2].results[1] ? mainMarketResult[2].results[1].oddValue : ""}</span>
                                                                                            </td>
                                                                                            <td className={`match-odds match-event ${firstHalfMainMarketResult[0] && firstHalfMainMarketResult[0].results[1] ? firstHalfMainMarketResult[0].results[1].updated : ""}`} id={`${firstHalfMainMarketResult[0].results && firstHalfMainMarketResult[0].results[2] ? firstHalfMainMarketResult[0].results[2].id : ""}`} onClick={e => { handleBetSlip(firstHalfMainMarketResult[0], item, 2, '2') }} >{firstHalfMainMarketResult[0].results && firstHalfMainMarketResult[0].results[2] ? firstHalfMainMarketResult[0].results[2].oddValue : ""}</td>
                                                                                            <td className={`match-odds match-event ${firstHalfMainMarketResult[1] && firstHalfMainMarketResult[1].results[2] ? firstHalfMainMarketResult[1].results[2].updated : ""}`} id={`${firstHalfMainMarketResult[1].results && firstHalfMainMarketResult[1].results[2] ? firstHalfMainMarketResult[1].results[2].id : ""}`} onClick={e => { handleBetSlip(firstHalfMainMarketResult[1], item, 2, '2') }} >
                                                                                                <span className="odd-td-left">{(firstHalfMainMarketResult[1] && firstHalfMainMarketResult[1].attr ? firstHalfMainMarketResult[1].attr * -1 : "").toString()}</span>
                                                                                                <span className="odd-td-right">{firstHalfMainMarketResult[1].results && firstHalfMainMarketResult[1].results[2] ? firstHalfMainMarketResult[1].results[2].oddValue : ""}</span>
                                                                                            </td>
                                                                                            <td className={`match-odds match-event ${firstHalfMainMarketResult[2] && firstHalfMainMarketResult[2].results[1] ? firstHalfMainMarketResult[2].results[1].updated : ""}`} id={`${firstHalfMainMarketResult[2].results && firstHalfMainMarketResult[2].results[1] ? firstHalfMainMarketResult[2].results[1].id : ""}`} onClick={e => { handleBetSlip(firstHalfMainMarketResult[2], item, 1, '2') }} >
                                                                                                <span className="odd-td-left">{(firstHalfMainMarketResult[2] && firstHalfMainMarketResult[2].attr ? `U ${firstHalfMainMarketResult[2].attr}` : "").toString()}</span>
                                                                                                <span className="odd-td-right">{firstHalfMainMarketResult[2].results && firstHalfMainMarketResult[2].results[1] ? firstHalfMainMarketResult[2].results[1].oddValue : ""}</span>
                                                                                            </td>
                                                                                        </tr>
                                                                                        <tr>
                                                                                            <td className="match-draft">{getTextByLanguage("Draw")}</td>
                                                                                            <td className={`match-odds match-draft ${mainMarketResult[0] && mainMarketResult[0].results[1] ? mainMarketResult[0].results[1].updated : ""}`} id={`${mainMarketResult[0].results && mainMarketResult[0].results[1] ? mainMarketResult[0].results[1].id : ""}`} onClick={e => { handleBetSlip(mainMarketResult[0], item, 1, 'Draw') }} >{mainMarketResult[0].results && mainMarketResult[0].results[1] ? mainMarketResult[0].results[1].oddValue : ""}</td>
                                                                                            <td className={`match-odds match-draft ${mainMarketResult[1] && mainMarketResult[1].results[1] ? mainMarketResult[1].results[1].updated : ""}`} id={`${mainMarketResult[1].results && mainMarketResult[1].results[1] ? mainMarketResult[1].results[1].id : ""}`} onClick={e => { handleBetSlip(mainMarketResult[1], item, 1, 'Draw') }} >
                                                                                                {/* <span className="odd-td-left">{(mainMarketResult[1] && mainMarketResult[1].attr ? mainMarketResult[1].attr * -1 : "").toString()}</span> */}
                                                                                                {/* <span classNameodds="odd-td-right">{mainMarketResult[1].results && mainMarketResult[1].results[1] ? mainMarketResult[1].results[1].oddValue : ""}</span> */}
                                                                                            </td>
                                                                                            <td className={`match-odds match-draft ${mainMarketResult[2] && mainMarketResult[2].results[2] ? mainMarketResult[2].results[2].updated : ""}`} id={`${mainMarketResult[2].results && mainMarketResult[2].results[2] ? mainMarketResult[2].results[2].id : ""}`} onClick={e => { handleBetSlip(mainMarketResult[2], item, 2, 'Draw') }} >
                                                                                                {/* <span className="odd-td-left">{(mainMarketResult[2] && mainMarketResult[2].attr ? `U ${mainMarketResult[2].attr}` : "").toString()}</span> */}
                                                                                                <span className="odd-td-right">{mainMarketResult[2].results && mainMarketResult[2].results[2] ? mainMarketResult[2].results[2].oddValue : ""}</span>
                                                                                            </td>
                                                                                            <td className={`match-odds match-draft ${firstHalfMainMarketResult[0] && firstHalfMainMarketResult[0].results[2] ? firstHalfMainMarketResult[0].results[2].updated : ""}`} id={`${firstHalfMainMarketResult[0].results && firstHalfMainMarketResult[0].results[1] ? firstHalfMainMarketResult[0].results[1].id : ""}`} onClick={e => { handleBetSlip(firstHalfMainMarketResult[0], item, 1, 'Draw') }} >{firstHalfMainMarketResult[0].results && firstHalfMainMarketResult[0].results[1] ? firstHalfMainMarketResult[0].results[1].oddValue : ""}</td>
                                                                                            <td className={`match-odds match-draft ${firstHalfMainMarketResult[1] && firstHalfMainMarketResult[1].results[1] ? firstHalfMainMarketResult[1].results[1].updated : ""}`} id={`${firstHalfMainMarketResult[1].results && firstHalfMainMarketResult[1].results[1] ? firstHalfMainMarketResult[1].results[1].id : ""}`} onClick={e => { handleBetSlip(firstHalfMainMarketResult[1], item, 1, 'Draw') }} >
                                                                                                {/* <span className="odd-td-left">{(firstHalfMainMarketResult[1] && firstHalfMainMarketResult[1].attr ? firstHalfMainMarketResult[1].attr * -1 : "").toString()}</span>
                                                                                            <span className="odd-td-right">{firstHalfMainMarketResult[1].results && firstHalfMainMarketResult[1].results[1] ? firstHalfMainMarketResult[1].results[1].oddValue : ""}</span> */}
                                                                                            </td>
                                                                                            <td className={`match- match-draft ${firstHalfMainMarketResult[2] && firstHalfMainMarketResult[2].results[2] ? firstHalfMainMarketResult[2].results[2].updated : ""}`} id={`${firstHalfMainMarketResult[2].results && firstHalfMainMarketResult[2].results[2] ? firstHalfMainMarketResult[2].results[2].id : ""}`} onClick={e => { handleBetSlip(firstHalfMainMarketResult[2], item, 2, 'Draw') }} >
                                                                                                {/* <span className="odd-td-left">{(firstHalfMainMarketResult[2] && firstHalfMainMarketResult[2].attr ? `U ${firstHalfMainMarketResult[2].attr}` : "").toString()}</span> */}
                                                                                                <span className="odd-td-right">{firstHalfMainMarketResult[2].results && firstHalfMainMarketResult[2].results[2] ? firstHalfMainMarketResult[2].results[2].oddValue : ""}</span>
                                                                                            </td>
                                                                                        </tr>
                                                                                    </React.Fragment>
                                                                                )
                                                                            })
                                                                        }
                                                                    </tbody>
                                                                </table>
                                                            </div>
                                                        </CardBody>
                                                    </React.Fragment>

                                                )
                                            })
                                        }
                                    </Card >
                                ) : ""
                            }
                        </TabPane >
                        <TabPane tabId='2'>
                            {
                                active === "2" ? (
                                    <Card className="b-team__list">
                                        <CardHeader >
                                            <div className="left d-flex align-items-center">
                                                <h2 id={`sport-title-56`} className="soccer m-auto pl-3 p-1">{getTextByLanguage("Table Tennis")}</h2>
                                                <span onClick={e => { handleRefresh() }} className={`timer-number d-flex align-items-center ${isRefreshing ? "refresh-loading" : ""}`}>{timerNumber}</span>
                                            </div>
                                            <div className="right">
                                                <a className="fav-link mr-2" href="/favorite" data-nsfw-filter-status="swf">{getTextByLanguage("Favourite Events")}</a>
                                            </div>
                                        </CardHeader>
                                        {Object.keys(leagueData).map((key, index) => {
                                            const league = leagueData[key]
                                            let flagImg = "all_leagues"
                                            let regionName = league[0].RegionName.replaceAll("(", "")
                                            regionName = league[0].RegionName.replaceAll(")", "")
                                            regionName = league[0].RegionName.replaceAll(" ", "")
                                            if (flagsByRegionName[regionName]) {
                                                flagImg = flagsByRegionName[regionName]
                                            } else {
                                                flagImg = regionName
                                            }
                                            return (
                                                <React.Fragment key={index}>
                                                    <div className="title py-1">
                                                        <div className="left">
                                                            <h3>
                                                                <img src={`https://getbet77.com/files/flags1/${flagImg}.png`} alt="" />
                                                                <span data-nsfw-filter-status="swf">{getTextByLanguage(league[0]["RegionName"])} {getTextByLanguage(league[0]["LeagueName"])}</span>
                                                            </h3>
                                                        </div>
                                                    </div>
                                                    <CardBody className="b-team pt-0 pb-0">
                                                        <div className="table-wrapper">
                                                            <table className="table table-bordered">
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
                                                                    {
                                                                        league.map((item, order) => {
                                                                            const mainMarketResultKey = mainMarketResultBySportId["56"]
                                                                            let markets = []
                                                                            const mainMarketResult = ["", "", ""]
                                                                            const firstHalfMainMarketResult = ["", "", ""]
                                                                            let favorId = ""
                                                                            const homeTeamScore = item.Scoreboard && item.Scoreboard.score ? item.Scoreboard.score.split(":")[0] : ""
                                                                            const awayTeamScore = item.Scoreboard && item.Scoreboard.score ? item.Scoreboard.score.split(":")[1] : ""
                                                                            favorId = item.Id.replace(":", "")
                                                                            if (eventData[item.Id]) {
                                                                                markets = eventData[item.Id].Markets
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
                                                                                    <tr>
                                                                                        <td rowSpan="3" className="">
                                                                                            <div className="d-flex mb-1 justify-content-center" id={`favor_${favorId}`} onClick={e => { handleFavor(item, favorId) }}><Star className={`favor-icon ${item.favor ? "active" : ""} `} /></div>
                                                                                            <div className="d-flex justify-content-center">Live</div>
                                                                                        </td>
                                                                                        <td className="match-event">
                                                                                            <span className='team-name'>{getTextByLanguage(item.HomeTeam)}</span>
                                                                                            {
                                                                                                item.Scoreboard.yellowCards && item.Scoreboard.yellowCards.player1["255"] > 0 ? (
                                                                                                    <span className="yellow-card"><sup>{item.Scoreboard.yellowCards.player1["255"]}</sup></span>
                                                                                                ) : null
                                                                                            }
                                                                                            {
                                                                                                item.Scoreboard.redCards && item.Scoreboard.redCards.player1["255"] > 0 ? (
                                                                                                    <span className="red-card"><sup>{item.Scoreboard.redCards.player1["255"]}</sup></span>
                                                                                                ) : null
                                                                                            }
                                                                                        </td>
                                                                                        <td className={`match-odds match-event ${mainMarketResult[0].results && mainMarketResult[0].results[0] ? mainMarketResult[0].results[0].updated : ""}`} id={`${mainMarketResult[0].results && mainMarketResult[0].results[0] ? mainMarketResult[0].results[0].id : ""}`} onClick={e => { handleBetSlip(mainMarketResult[0], item, 0, '1') }} >{mainMarketResult[0].results && mainMarketResult[0].results[0] ? mainMarketResult[0].results[0].oddValue : ""}</td>
                                                                                        <td className={`match-odds match-event ${mainMarketResult[1].results && mainMarketResult[1].results[0] ? mainMarketResult[1].results[0].updated : ""}`} id={`${mainMarketResult[1].results && mainMarketResult[1].results[0] ? mainMarketResult[1].results[0].id : ""}`} onClick={e => { handleBetSlip(mainMarketResult[1], item, 0, '1') }} >
                                                                                            <span className="odd-td-left">{(mainMarketResult[1] && mainMarketResult[1].attr ? `+ ${parseFloat(mainMarketResult[1].attr) * 1}` : "").toString()}</span>
                                                                                            <span className="odd-td-right">{mainMarketResult[1].results && mainMarketResult[1].results[0] ? mainMarketResult[1].results[0].oddValue : ""}</span>
                                                                                        </td>
                                                                                        <td className={`match-odds match-event ${mainMarketResult[2].results && mainMarketResult[2].results[0] ? mainMarketResult[2].results[0].updated : ""}`} id={`${mainMarketResult[2].results && mainMarketResult[2].results[0] ? mainMarketResult[2].results[0].id : ""}`} onClick={e => { handleBetSlip(mainMarketResult[2], item, 0, '1') }} >
                                                                                            <span className="odd-td-right">{mainMarketResult[2].results && mainMarketResult[2].results[0] ? mainMarketResult[2].results[0].oddValue : ""}</span>
                                                                                        </td>
                                                                                        <td className={`match-odds match-event ${firstHalfMainMarketResult[0].results && firstHalfMainMarketResult[0].results[0] ? firstHalfMainMarketResult[0].results[0].updated : ""}`} id={`${firstHalfMainMarketResult[0].results && firstHalfMainMarketResult[0].results[0] ? firstHalfMainMarketResult[0].results[0].id : ""}`} onClick={e => { handleBetSlip(firstHalfMainMarketResult[0], item, 0, '1') }} >{firstHalfMainMarketResult[0].results && firstHalfMainMarketResult[0].results[0] ? firstHalfMainMarketResult[0].results[0].oddValue : ""}</td>
                                                                                        <td className={`match-odds match-event ${firstHalfMainMarketResult[1].results && firstHalfMainMarketResult[1].results[0] ? firstHalfMainMarketResult[1].results[0].updated : ""}`} id={`${firstHalfMainMarketResult[1].results && firstHalfMainMarketResult[1].results[0] ? firstHalfMainMarketResult[1].results[0].id : ""}`} onClick={e => { handleBetSlip(firstHalfMainMarketResult[1], item, 0, '1') }} >
                                                                                            <span className="odd-td-left">{(firstHalfMainMarketResult[1] && firstHalfMainMarketResult[1].attr ? `+ ${parseFloat(firstHalfMainMarketResult[1].attr) * 1}` : "").toString()}</span>
                                                                                            <span className="odd-td-right">{firstHalfMainMarketResult[1].results && firstHalfMainMarketResult[1].results[0] ? firstHalfMainMarketResult[1].results[0].oddValue : ""}</span>
                                                                                        </td>
                                                                                        <td className={`match-odds match-event ${firstHalfMainMarketResult[2].results && firstHalfMainMarketResult[2].results[0] ? firstHalfMainMarketResult[2].results[0].updated : ""}`} id={`${firstHalfMainMarketResult[2].results && firstHalfMainMarketResult[2].results[0] ? firstHalfMainMarketResult[2].results[0].id : ""}`} onClick={e => { handleBetSlip(firstHalfMainMarketResult[2], item, 0, '1') }} >
                                                                                            <span className="odd-td-right">{firstHalfMainMarketResult[2].results && firstHalfMainMarketResult[2].results[0] ? firstHalfMainMarketResult[2].results[0].oddValue : ""}</span>
                                                                                        </td>
                                                                                        <td className="match-odds more-odds" rowSpan="3"><a href={`/event/${item.Id}`}>+{markets.length > 45 ? 45 : markets.length}</a></td>
                                                                                    </tr>
                                                                                    <tr>
                                                                                        <td className="match-event">
                                                                                            <span className='team-name'>{getTextByLanguage(item.AwayTeam)}</span>
                                                                                            {
                                                                                                item.Scoreboard.yellowCards && item.Scoreboard.yellowCards.player2["255"] > 0 ? (
                                                                                                    <span className="yellow-card"><sup>{item.Scoreboard.yellowCards.player2["255"]}</sup></span>
                                                                                                ) : null
                                                                                            }
                                                                                            {
                                                                                                item.Scoreboard.redCards && item.Scoreboard.redCards.player2["255"] > 0 ? (
                                                                                                    <span className="red-card"><sup>{item.Scoreboard.redCards.player2["255"]}</sup></span>
                                                                                                ) : null
                                                                                            }
                                                                                        </td>
                                                                                        <td className={`match-odds match-event ${mainMarketResult[0].results && mainMarketResult[0].results[1] ? mainMarketResult[0].results[1].updated : ""}`} id={`${mainMarketResult[0].results && mainMarketResult[0].results[1] ? mainMarketResult[0].results[1].id : ""}`} onClick={e => { handleBetSlip(mainMarketResult[0], item, 1, '2') }} >{mainMarketResult[0].results && mainMarketResult[0].results[1] ? mainMarketResult[0].results[1].oddValue : ""}</td>
                                                                                        <td className={`match-odds match-event ${mainMarketResult[1].results && mainMarketResult[1].results[1] ? mainMarketResult[1].results[1].updated : ""}`} id={`${mainMarketResult[1].results && mainMarketResult[1].results[1] ? mainMarketResult[1].results[1].id : ""}`} onClick={e => { handleBetSlip(mainMarketResult[1], item, 1, '2') }} >
                                                                                            <span className="odd-td-left">{(mainMarketResult[1] && mainMarketResult[1].attr ? mainMarketResult[1].attr * -1 : "").toString()}</span>
                                                                                            <span className="odd-td-right">{mainMarketResult[1].results && mainMarketResult[1].results[1] ? mainMarketResult[1].results[1].oddValue : ""}</span>
                                                                                        </td>
                                                                                        <td className={`match-odds match-event ${mainMarketResult[2].results && mainMarketResult[2].results[1] ? mainMarketResult[2].results[1].updated : ""}`} id={`${mainMarketResult[2].results && mainMarketResult[2].results[1] ? mainMarketResult[2].results[1].id : ""}`} onClick={e => { handleBetSlip(mainMarketResult[2], item, 1, '2') }} >
                                                                                            <span className="odd-td-left">{(mainMarketResult[2] && mainMarketResult[2].attr ? `U ${mainMarketResult[2].attr}` : "").toString()}</span>
                                                                                            <span className="odd-td-right">{mainMarketResult[2].results && mainMarketResult[2].results[1] ? mainMarketResult[2].results[1].oddValue : ""}</span>
                                                                                        </td>
                                                                                        <td className={`match-odds match-event ${firstHalfMainMarketResult[0].results && firstHalfMainMarketResult[0].results[2] ? firstHalfMainMarketResult[0].results[2].updated : ""}`} id={`${firstHalfMainMarketResult[0].results && firstHalfMainMarketResult[0].results[2] ? firstHalfMainMarketResult[0].results[2].id : ""}`} onClick={e => { handleBetSlip(firstHalfMainMarketResult[0], item, 2, '2') }} >{firstHalfMainMarketResult[0].results && firstHalfMainMarketResult[0].results[2] ? firstHalfMainMarketResult[0].results[2].oddValue : ""}</td>
                                                                                        <td className={`match-odds match-event ${firstHalfMainMarketResult[1].results && firstHalfMainMarketResult[1].results[2] ? firstHalfMainMarketResult[1].results[2].updated : ""}`} id={`${firstHalfMainMarketResult[1].results && firstHalfMainMarketResult[1].results[2] ? firstHalfMainMarketResult[1].results[2].id : ""}`} onClick={e => { handleBetSlip(firstHalfMainMarketResult[1], item, 2, '2') }} >
                                                                                            <span className="odd-td-left">{(firstHalfMainMarketResult[1] && firstHalfMainMarketResult[1].attr ? firstHalfMainMarketResult[1].attr * -1 : "").toString()}</span>
                                                                                            <span className="odd-td-right">{firstHalfMainMarketResult[1].results && firstHalfMainMarketResult[1].results[2] ? firstHalfMainMarketResult[1].results[2].oddValue : ""}</span>
                                                                                        </td>
                                                                                        <td className={`match-odds match-event ${firstHalfMainMarketResult[2].results && firstHalfMainMarketResult[2].results[1] ? firstHalfMainMarketResult[2].results[1].updated : ""}`} id={`${firstHalfMainMarketResult[2].results && firstHalfMainMarketResult[2].results[1] ? firstHalfMainMarketResult[2].results[1].id : ""}`} onClick={e => { handleBetSlip(firstHalfMainMarketResult[2], item, 1, '2') }} >
                                                                                            <span className="odd-td-left">{(firstHalfMainMarketResult[2] && firstHalfMainMarketResult[2].attr ? `U ${firstHalfMainMarketResult[2].attr}` : "").toString()}</span>
                                                                                            <span className="odd-td-right">{firstHalfMainMarketResult[2].results && firstHalfMainMarketResult[2].results[1] ? firstHalfMainMarketResult[2].results[1].oddValue : ""}</span>
                                                                                        </td>
                                                                                    </tr>
                                                                                    <tr>
                                                                                        <td className="match-draft">{getTextByLanguage("Draw")}</td>
                                                                                        <td className={`match-odds match-draft ${mainMarketResult[0].results && mainMarketResult[0].results[2] ? mainMarketResult[0].results[2].updated : ""}`} id={`${mainMarketResult[0].results && mainMarketResult[0].results[2] ? mainMarketResult[0].results[2].id : ""}`} onClick={e => { handleBetSlip(mainMarketResult[0], item, 2, 'Draw') }} >{mainMarketResult[0].results && mainMarketResult[0].results[2] ? mainMarketResult[0].results[2].oddValue : ""}</td>
                                                                                        <td className={`match-odds match-draft ${mainMarketResult[1].results && mainMarketResult[1].results[2] ? mainMarketResult[1].results[2].updated : ""}`} id={`${mainMarketResult[1].results && mainMarketResult[1].results[2] ? mainMarketResult[1].results[2].id : ""}`} onClick={e => { handleBetSlip(mainMarketResult[1], item, 2, 'Draw') }} >
                                                                                            {/* <span className="odd-td-left">{(mainMarketResult[1] && mainMarketResult[1].attr ? mainMarketResult[1].attr * -1 : "").toString()}</span>
                                                                                            <span className="odd-td-right">{mainMarketResult[1].results && mainMarketResult[1].results[2] ? mainMarketResult[1].results[2].oddValue : ""}</span> */}
                                                                                        </td>
                                                                                        <td className={`match-odds match-draft ${mainMarketResult[2].results && mainMarketResult[2].results[2] ? mainMarketResult[2].results[2].updated : ""}`} id={`${mainMarketResult[2].results && mainMarketResult[2].results[2] ? mainMarketResult[2].results[2].id : ""}`} onClick={e => { handleBetSlip(mainMarketResult[2], item, 2, 'Draw') }} >
                                                                                            {/* <span className="odd-td-left">{(mainMarketResult[2] && mainMarketResult[2].attr ? `U ${mainMarketResult[2].attr}` : "").toString()}</span> */}
                                                                                            <span className="odd-td-right">{mainMarketResult[2].results && mainMarketResult[2].results[2] ? mainMarketResult[2].results[2].oddValue : ""}</span>
                                                                                        </td>
                                                                                        <td className={`match-odds match-draft ${firstHalfMainMarketResult[0].results && firstHalfMainMarketResult[0].results[1] ? firstHalfMainMarketResult[0].results[1].updated : ""}`} id={`${firstHalfMainMarketResult[0].results && firstHalfMainMarketResult[0].results[1] ? firstHalfMainMarketResult[0].results[1].id : ""}`} onClick={e => { handleBetSlip(firstHalfMainMarketResult[0], item, 1, 'Draw') }} >{firstHalfMainMarketResult[0].results && firstHalfMainMarketResult[0].results[1] ? firstHalfMainMarketResult[0].results[1].oddValue : ""}</td>
                                                                                        <td className={`match-odds match-draft ${firstHalfMainMarketResult[1].results && firstHalfMainMarketResult[1].results[1] ? firstHalfMainMarketResult[1].results[1].updated : ""}`} id={`${firstHalfMainMarketResult[1].results && firstHalfMainMarketResult[1].results[1] ? firstHalfMainMarketResult[1].results[1].id : ""}`} onClick={e => { handleBetSlip(firstHalfMainMarketResult[1], item, 1, 'Draw') }} >
                                                                                            <span className="odd-td-left">{(firstHalfMainMarketResult[1] && firstHalfMainMarketResult[1].attr ? firstHalfMainMarketResult[1].attr * -1 : "").toString()}</span>
                                                                                            <span className="odd-td-right">{firstHalfMainMarketResult[1].results && firstHalfMainMarketResult[1].results[1] ? firstHalfMainMarketResult[1].results[1].oddValue : ""}</span>
                                                                                        </td>
                                                                                        <td className={`match-odds match-draft ${firstHalfMainMarketResult[2].results && firstHalfMainMarketResult[2].results[2] ? firstHalfMainMarketResult[2].results[2].updated : ""}`} id={`${firstHalfMainMarketResult[2].results && firstHalfMainMarketResult[2].results[2] ? firstHalfMainMarketResult[2].results[2].id : ""}`} onClick={e => { handleBetSlip(firstHalfMainMarketResult[2], item, 2, 'Draw') }} >
                                                                                            {/* <span className="odd-td-left">{(firstHalfMainMarketResult[2] && firstHalfMainMarketResult[2].attr ? `U ${firstHalfMainMarketResult[2].attr}` : "").toString()}</span> */}
                                                                                            <span className="odd-td-right">{firstHalfMainMarketResult[2].results && firstHalfMainMarketResult[2].results[2] ? firstHalfMainMarketResult[2].results[2].oddValue : ""}</span>
                                                                                        </td>
                                                                                    </tr>
                                                                                </React.Fragment>
                                                                            )
                                                                        })
                                                                    }
                                                                </tbody>
                                                            </table>
                                                        </div>
                                                    </CardBody>
                                                </React.Fragment>

                                            )
                                        })}
                                    </Card>
                                ) : ""
                            }
                        </TabPane>
                        <TabPane tabId='3'>
                            {
                                active === "3" ? (
                                    <Card className="b-team__list">
                                        <CardHeader >
                                            <div className="left d-flex align-items-center">
                                                <h2 id={`sport-title-7`} className="soccer m-auto pl-3 p-1">{getTextByLanguage("Basketball")}</h2>
                                                <span onClick={e => { handleRefresh() }} className={`timer-number d-flex align-items-center ${isRefreshing ? "refresh-loading" : ""}`}>{timerNumber}</span>
                                            </div>
                                            <div className="right">
                                                <a className="fav-link mr-2" href="/favorite" data-nsfw-filter-status="swf">{getTextByLanguage("Favourite Events")}</a>
                                            </div>
                                        </CardHeader>
                                        {Object.keys(leagueData).map((key, index) => {
                                            const league = leagueData[key]
                                            let flagImg = "all_leagues"
                                            let regionName = league[0].RegionName.replaceAll("(", "")
                                            regionName = league[0].RegionName.replaceAll(")", "")
                                            regionName = league[0].RegionName.replaceAll(" ", "")
                                            if (flagsByRegionName[regionName]) {
                                                flagImg = flagsByRegionName[regionName]
                                            } else {
                                                flagImg = regionName
                                            }
                                            return (
                                                <React.Fragment key={index}>
                                                    <div className="title py-1">
                                                        <div className="left">
                                                            <h3>
                                                                <img src={`https://getbet77.com/files/flags1/${flagImg}.png`} alt="" />
                                                                <span data-nsfw-filter-status="swf">{getTextByLanguage(league[0]["RegionName"])} {getTextByLanguage(league[0]["LeagueName"])}</span>
                                                            </h3>
                                                        </div>
                                                    </div>
                                                    <CardBody className="b-team pt-0 pb-0">
                                                        <div className="table-wrapper">
                                                            <table className="table table-bordered">
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
                                                                    {
                                                                        league.map((item, order) => {
                                                                            const mainMarketResultKey = mainMarketResultBySportId["7"]
                                                                            let markets = []
                                                                            const mainMarketResult = ["", "", ""]
                                                                            const firstHalfMainMarketResult = ["", "", ""]
                                                                            let favorId = ""
                                                                            const homeTeamScore = item.Scoreboard && item.Scoreboard.score ? item.Scoreboard.score.split(":")[0] : ""
                                                                            const awayTeamScore = item.Scoreboard && item.Scoreboard.score ? item.Scoreboard.score.split(":")[1] : ""
                                                                            favorId = item.Id.replace(":", "")
                                                                            if (eventData[item.Id]) {
                                                                                markets = eventData[item.Id].Markets
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
                                                                                    <tr>
                                                                                        <td rowSpan="3" className="">
                                                                                            <div className="d-flex mb-1 justify-content-center" id={`favor_${favorId}`} onClick={e => { handleFavor(item, favorId) }}><Star className={`favor-icon ${item.favor ? "active" : ""} `} /></div>
                                                                                            <div className="d-flex justify-content-center">Live</div>
                                                                                        </td>
                                                                                        <td className="match-event">
                                                                                            <span className='team-name'>{getTextByLanguage(item.HomeTeam)}</span>
                                                                                            {
                                                                                                item.Scoreboard.yellowCards && item.Scoreboard.yellowCards.player1["255"] > 0 ? (
                                                                                                    <span className="yellow-card"><sup>{item.Scoreboard.yellowCards.player1["255"]}</sup></span>
                                                                                                ) : null
                                                                                            }
                                                                                            {
                                                                                                item.Scoreboard.redCards && item.Scoreboard.redCards.player1["255"] > 0 ? (
                                                                                                    <span className="red-card"><sup>{item.Scoreboard.redCards.player1["255"]}</sup></span>
                                                                                                ) : null
                                                                                            }
                                                                                        </td>
                                                                                        <td className={`match-odds match-event ${mainMarketResult[0].results && mainMarketResult[0].results[0] ? mainMarketResult[0].results[0].updated : ""}`} id={`${mainMarketResult[0].results && mainMarketResult[0].results[0] ? mainMarketResult[0].results[0].id : ""}`} onClick={e => { handleBetSlip(mainMarketResult[0], item, 0, '1') }} >{mainMarketResult[0].results && mainMarketResult[0].results[0] ? mainMarketResult[0].results[0].oddValue : ""}</td>
                                                                                        <td className={`match-odds match-event ${mainMarketResult[1].results && mainMarketResult[1].results[0] ? mainMarketResult[1].results[0].updated : ""}`} id={`${mainMarketResult[1].results && mainMarketResult[1].results[0] ? mainMarketResult[1].results[0].id : ""}`} onClick={e => { handleBetSlip(mainMarketResult[1], item, 0, '1') }} >
                                                                                            <span className="odd-td-left">{(mainMarketResult[1] && mainMarketResult[1].attr ? `+ ${parseFloat(mainMarketResult[1].attr) * 1}` : "").toString()}</span>
                                                                                            <span className="odd-td-right">{mainMarketResult[1].results && mainMarketResult[1].results[0] ? mainMarketResult[1].results[0].oddValue : ""}</span>
                                                                                        </td>
                                                                                        <td className={`match-odds match-event ${mainMarketResult[2].results && mainMarketResult[2].results[0] ? mainMarketResult[2].results[0].updated : ""}`} id={`${mainMarketResult[2].results && mainMarketResult[2].results[0] ? mainMarketResult[2].results[0].id : ""}`} onClick={e => { handleBetSlip(mainMarketResult[2], item, 0, '1') }} >
                                                                                            <span className="odd-td-right">{mainMarketResult[2].results && mainMarketResult[2].results[0] ? mainMarketResult[2].results[0].oddValue : ""}</span>
                                                                                        </td>
                                                                                        <td className={`match-odds match-event ${firstHalfMainMarketResult[0].results && firstHalfMainMarketResult[0].results[0] ? firstHalfMainMarketResult[0].results[0].updated : ""}`} id={`${firstHalfMainMarketResult[0].results && firstHalfMainMarketResult[0].results[0] ? firstHalfMainMarketResult[0].results[0].id : ""}`} onClick={e => { handleBetSlip(firstHalfMainMarketResult[0], item, 0, '1') }} >{firstHalfMainMarketResult[0].results && firstHalfMainMarketResult[0].results[0] ? firstHalfMainMarketResult[0].results[0].oddValue : ""}</td>
                                                                                        <td className={`match-odds match-event ${firstHalfMainMarketResult[1].results && firstHalfMainMarketResult[1].results[0] ? firstHalfMainMarketResult[1].results[0].updated : ""}`} id={`${firstHalfMainMarketResult[1].results && firstHalfMainMarketResult[1].results[0] ? firstHalfMainMarketResult[1].results[0].id : ""}`} onClick={e => { handleBetSlip(firstHalfMainMarketResult[1], item, 0, '1') }} >
                                                                                            <span className="odd-td-left">{(firstHalfMainMarketResult[1] && firstHalfMainMarketResult[1].attr ? `+ ${parseFloat(firstHalfMainMarketResult[1].attr) * 1}` : "").toString()}</span>
                                                                                            <span className="odd-td-right">{firstHalfMainMarketResult[1].results && firstHalfMainMarketResult[1].results[0] ? firstHalfMainMarketResult[1].results[0].oddValue : ""}</span>
                                                                                        </td>
                                                                                        <td className={`match-odds match-event ${firstHalfMainMarketResult[2].results && firstHalfMainMarketResult[2].results[0] ? firstHalfMainMarketResult[2].results[0].updated : ""}`} id={`${firstHalfMainMarketResult[2].results && firstHalfMainMarketResult[2].results[0] ? firstHalfMainMarketResult[2].results[0].id : ""}`} onClick={e => { handleBetSlip(firstHalfMainMarketResult[2], item, 0, '1') }} >
                                                                                            <span className="odd-td-right">{firstHalfMainMarketResult[2].results && firstHalfMainMarketResult[2].results[0] ? firstHalfMainMarketResult[2].results[0].oddValue : ""}</span>
                                                                                        </td>
                                                                                        <td className="match-odds more-odds" rowSpan="3"><a href={`/event/${item.Id}`}>+{markets.length > 45 ? 45 : markets.length}</a></td>
                                                                                    </tr>
                                                                                    <tr>
                                                                                        <td className="match-event">
                                                                                            <span className='team-name'>{getTextByLanguage(item.AwayTeam)}</span>
                                                                                            {
                                                                                                item.Scoreboard.yellowCards && item.Scoreboard.yellowCards.player2["255"] > 0 ? (
                                                                                                    <span className="yellow-card"><sup>{item.Scoreboard.yellowCards.player2["255"]}</sup></span>
                                                                                                ) : null
                                                                                            }
                                                                                            {
                                                                                                item.Scoreboard.redCards && item.Scoreboard.redCards.player2["255"] > 0 ? (
                                                                                                    <span className="red-card"><sup>{item.Scoreboard.redCards.player2["255"]}</sup></span>
                                                                                                ) : null
                                                                                            }
                                                                                        </td>
                                                                                        <td className={`match-odds match-event ${mainMarketResult[0].results && mainMarketResult[0].results[1] ? mainMarketResult[0].results[1].updated : ""}`} id={`${mainMarketResult[0].results && mainMarketResult[0].results[1] ? mainMarketResult[0].results[1].id : ""}`} onClick={e => { handleBetSlip(mainMarketResult[0], item, 1, '2') }} >{mainMarketResult[0].results && mainMarketResult[0].results[1] ? mainMarketResult[0].results[1].oddValue : ""}</td>
                                                                                        <td className={`match-odds match-event ${mainMarketResult[1].results && mainMarketResult[1].results[1] ? mainMarketResult[1].results[1].updated : ""}`} id={`${mainMarketResult[1].results && mainMarketResult[1].results[1] ? mainMarketResult[1].results[1].id : ""}`} onClick={e => { handleBetSlip(mainMarketResult[1], item, 1, '2') }} >
                                                                                            <span className="odd-td-left">{(mainMarketResult[1] && mainMarketResult[1].attr ? mainMarketResult[1].attr * -1 : "").toString()}</span>
                                                                                            <span className="odd-td-right">{mainMarketResult[1].results && mainMarketResult[1].results[1] ? mainMarketResult[1].results[1].oddValue : ""}</span>
                                                                                        </td>
                                                                                        <td className={`match-odds match-event ${mainMarketResult[2].results && mainMarketResult[2].results[1] ? mainMarketResult[2].results[1].updated : ""}`} id={`${mainMarketResult[2].results && mainMarketResult[2].results[1] ? mainMarketResult[2].results[1].id : ""}`} onClick={e => { handleBetSlip(mainMarketResult[2], item, 1, '2') }} >
                                                                                            <span className="odd-td-left">{(mainMarketResult[2] && mainMarketResult[2].attr ? `U ${mainMarketResult[2].attr}` : "").toString()}</span>
                                                                                            <span className="odd-td-right">{mainMarketResult[2].results && mainMarketResult[2].results[1] ? mainMarketResult[2].results[1].oddValue : ""}</span>
                                                                                        </td>
                                                                                        <td className={`match-odds match-event ${firstHalfMainMarketResult[0].results && firstHalfMainMarketResult[0].results[1] ? firstHalfMainMarketResult[0].results[1].updated : ""}`} id={`${firstHalfMainMarketResult[0].results && firstHalfMainMarketResult[0].results[1] ? firstHalfMainMarketResult[0].results[1].id : ""}`} onClick={e => { handleBetSlip(firstHalfMainMarketResult[0], item, 2, '2') }} >{firstHalfMainMarketResult[0].results && firstHalfMainMarketResult[0].results[1] ? firstHalfMainMarketResult[0].results[1].oddValue : ""}</td>
                                                                                        <td className={`match-odds match-event ${firstHalfMainMarketResult[1].results && firstHalfMainMarketResult[1].results[1] ? firstHalfMainMarketResult[1].results[1].updated : ""}`} id={`${firstHalfMainMarketResult[1].results && firstHalfMainMarketResult[1].results[1] ? firstHalfMainMarketResult[1].results[1].id : ""}`} onClick={e => { handleBetSlip(firstHalfMainMarketResult[1], item, 1, '2') }} >
                                                                                            <span className="odd-td-left">{(firstHalfMainMarketResult[1] && firstHalfMainMarketResult[1].attr ? firstHalfMainMarketResult[1].attr * -1 : "").toString()}</span>
                                                                                            <span className="odd-td-right">{firstHalfMainMarketResult[1].results && firstHalfMainMarketResult[1].results[1] ? firstHalfMainMarketResult[1].results[1].oddValue : ""}</span>
                                                                                        </td>
                                                                                        <td className={`match-odds match-event ${firstHalfMainMarketResult[2].results && firstHalfMainMarketResult[2].results[1] ? firstHalfMainMarketResult[2].results[1].updated : ""}`} id={`${firstHalfMainMarketResult[2].results && firstHalfMainMarketResult[2].results[1] ? firstHalfMainMarketResult[2].results[1].id : ""}`} onClick={e => { handleBetSlip(firstHalfMainMarketResult[2], item, 1, '2') }} >
                                                                                            <span className="odd-td-left">{(firstHalfMainMarketResult[2] && firstHalfMainMarketResult[2].attr ? `U ${firstHalfMainMarketResult[2].attr}` : "").toString()}</span>
                                                                                            <span className="odd-td-right">{firstHalfMainMarketResult[2].results && firstHalfMainMarketResult[2].results[1] ? firstHalfMainMarketResult[2].results[1].oddValue : ""}</span>
                                                                                        </td>
                                                                                    </tr>
                                                                                    <tr>
                                                                                        <td className="match-draft">{getTextByLanguage("Draw")}</td>
                                                                                        <td className={`match-odds match-draft ${mainMarketResult[0].results && mainMarketResult[0].results[2] ? mainMarketResult[0].results[2].updated : ""}`} id={`${mainMarketResult[0].results && mainMarketResult[0].results[2] ? mainMarketResult[0].results[2].id : ""}`} onClick={e => { handleBetSlip(mainMarketResult[0], item, 2, 'Draw') }} >{mainMarketResult[0].results && mainMarketResult[0].results[2] ? mainMarketResult[0].results[2].oddValue : ""}</td>
                                                                                        <td className={`match-odds match-draft ${mainMarketResult[1].results && mainMarketResult[1].results[2] ? mainMarketResult[1].results[2].updated : ""}`} id={`${mainMarketResult[1].results && mainMarketResult[1].results[2] ? mainMarketResult[1].results[2].id : ""}`} onClick={e => { handleBetSlip(mainMarketResult[1], item, 2, 'Draw') }} >
                                                                                            <span className="odd-td-left">{(mainMarketResult[1] && mainMarketResult[1].attr ? mainMarketResult[1].attr * -1 : "").toString()}</span>
                                                                                            <span className="odd-td-right">{mainMarketResult[1].results && mainMarketResult[1].results[2] ? mainMarketResult[1].results[2].oddValue : ""}</span>
                                                                                        </td>
                                                                                        <td className={`match-odds match-draft ${mainMarketResult[2].results && mainMarketResult[2].results[2] ? mainMarketResult[2].results[2].updated : ""}`} id={`${mainMarketResult[2].results && mainMarketResult[2].results[2] ? mainMarketResult[2].results[2].id : ""}`} onClick={e => { handleBetSlip(mainMarketResult[2], item, 2, 'Draw') }} >
                                                                                            {/* <span className="odd-td-left">{(mainMarketResult[2] && mainMarketResult[2].attr ? `U ${mainMarketResult[2].attr}` : "").toString()}</span> */}
                                                                                            <span className="odd-td-right">{mainMarketResult[2].results && mainMarketResult[2].results[2] ? mainMarketResult[2].results[2].oddValue : ""}</span>
                                                                                        </td>
                                                                                        <td className={`match-odds match-draft ${firstHalfMainMarketResult[0].results && firstHalfMainMarketResult[0].results[2] ? firstHalfMainMarketResult[0].results[2].updated : ""}`} id={`${firstHalfMainMarketResult[0].results && firstHalfMainMarketResult[0].results[2] ? firstHalfMainMarketResult[0].results[2].id : ""}`} onClick={e => { handleBetSlip(firstHalfMainMarketResult[0], item, 1, 'Draw') }} >{firstHalfMainMarketResult[0].results && firstHalfMainMarketResult[0].results[2] ? firstHalfMainMarketResult[0].results[2].oddValue : ""}</td>
                                                                                        <td className={`match-odds match-draft ${firstHalfMainMarketResult[1].results && firstHalfMainMarketResult[1].results[2] ? firstHalfMainMarketResult[1].results[2].updated : ""}`} id={`${firstHalfMainMarketResult[1].results && firstHalfMainMarketResult[1].results[2] ? firstHalfMainMarketResult[1].results[2].id : ""}`} onClick={e => { handleBetSlip(firstHalfMainMarketResult[1], item, 1, 'Draw') }} >
                                                                                            {/* <span className="odd-td-left">{(firstHalfMainMarketResult[1] && firstHalfMainMarketResult[1].attr ? firstHalfMainMarketResult[1].attr * -1 : "").toString()}</span>
                                                                                            <span className="odd-td-right">{firstHalfMainMarketResult[1].results && firstHalfMainMarketResult[1].results[2] ? firstHalfMainMarketResult[1].results[2].oddValue : ""}</span> */}
                                                                                        </td>
                                                                                        <td className={`match-odds match-draft ${firstHalfMainMarketResult[2].results && firstHalfMainMarketResult[2].results[2] ? firstHalfMainMarketResult[2].results[2].updated : ""}`} id={`${firstHalfMainMarketResult[2].results && firstHalfMainMarketResult[2].results[2] ? firstHalfMainMarketResult[2].results[2].id : ""}`} onClick={e => { handleBetSlip(firstHalfMainMarketResult[2], item, 2, 'Draw') }} >
                                                                                            {/* <span className="odd-td-left">{(firstHalfMainMarketResult[2] && firstHalfMainMarketResult[2].attr ? `U ${firstHalfMainMarketResult[2].attr}` : "").toString()}</span> */}
                                                                                            <span className="odd-td-right">{firstHalfMainMarketResult[2].results && firstHalfMainMarketResult[2].results[2] ? firstHalfMainMarketResult[2].results[2].oddValue : ""}</span>
                                                                                        </td>
                                                                                    </tr>
                                                                                </React.Fragment>
                                                                            )
                                                                        })
                                                                    }
                                                                </tbody>
                                                            </table>
                                                        </div>
                                                    </CardBody>
                                                </React.Fragment>

                                            )
                                        })}
                                    </Card>
                                ) : ""
                            }
                        </TabPane>
                        <TabPane tabId='4'>
                            {
                                active === "4" ? (
                                    <Card className="b-team__list">
                                        <CardHeader >
                                            <div className="left d-flex align-items-center">
                                                <h2 id={`sport-title-5`} className="soccer m-auto pl-3 p-1">{getTextByLanguage("Tennis")}</h2>
                                                <span onClick={e => { handleRefresh() }} className={`timer-number d-flex align-items-center ${isRefreshing ? "refresh-loading" : ""}`}>{timerNumber}</span>
                                            </div>
                                            <div className="right">
                                                <a className="fav-link mr-2" href="/favorite" data-nsfw-filter-status="swf">{getTextByLanguage("Favourite Events")}</a>
                                            </div>
                                        </CardHeader>
                                        {Object.keys(leagueData).map((key, index) => {
                                            const league = leagueData[key]
                                            let flagImg = "all_leagues"
                                            let regionName = league[0].RegionName.replaceAll("(", "")
                                            regionName = league[0].RegionName.replaceAll(")", "")
                                            regionName = league[0].RegionName.replaceAll(" ", "")
                                            if (flagsByRegionName[regionName]) {
                                                flagImg = flagsByRegionName[regionName]
                                            } else {
                                                flagImg = regionName
                                            }
                                            return (
                                                <React.Fragment key={index}>
                                                    <div className="title py-1">
                                                        <div className="left">
                                                            <h3>
                                                                <img src={`https://getbet77.com/files/flags1/${flagImg}.png`} alt="" />
                                                                <span data-nsfw-filter-status="swf">{getTextByLanguage(league[0]["RegionName"])} {getTextByLanguage(league[0]["LeagueName"])}</span>
                                                            </h3>
                                                        </div>
                                                    </div>
                                                    <CardBody className="b-team pt-0 pb-0">
                                                        <div className="table-wrapper">
                                                            <table className="table table-bordered">
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
                                                                    {
                                                                        league.map((item, order) => {
                                                                            const mainMarketResultKey = mainMarketResultBySportId["5"]
                                                                            let markets = []
                                                                            const mainMarketResult = ["", "", ""]
                                                                            const firstHalfMainMarketResult = ["", "", ""]
                                                                            let favorId = ""
                                                                            const homeTeamScore = item.Scoreboard && item.Scoreboard.score ? item.Scoreboard.score.split(":")[0] : ""
                                                                            const awayTeamScore = item.Scoreboard && item.Scoreboard.score ? item.Scoreboard.score.split(":")[1] : ""
                                                                            favorId = item.Id.replace(":", "")
                                                                            if (eventData[item.Id]) {
                                                                                markets = eventData[item.Id].Markets
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
                                                                                    <tr>
                                                                                        <td rowSpan="3" className="">
                                                                                            <div className="d-flex mb-1 justify-content-center" id={`favor_${favorId}`} onClick={e => { handleFavor(item, favorId) }}><Star className={`favor-icon ${item.favor ? "active" : ""} `} /></div>
                                                                                            <div className="d-flex justify-content-center">Live</div>
                                                                                        </td>
                                                                                        <td className="match-event">
                                                                                            <span className='team-name'>{getTextByLanguage(item.HomeTeam)}</span>
                                                                                            {
                                                                                                item.Scoreboard.yellowCards && item.Scoreboard.yellowCards.player1["255"] > 0 ? (
                                                                                                    <span className="yellow-card"><sup>{item.Scoreboard.yellowCards.player1["255"]}</sup></span>
                                                                                                ) : null
                                                                                            }
                                                                                            {
                                                                                                item.Scoreboard.redCards && item.Scoreboard.redCards.player1["255"] > 0 ? (
                                                                                                    <span className="red-card"><sup>{item.Scoreboard.redCards.player1["255"]}</sup></span>
                                                                                                ) : null
                                                                                            }
                                                                                        </td>
                                                                                        <td className={`match-odds match-event ${mainMarketResult[0].results && mainMarketResult[0].results[0] ? mainMarketResult[0].results[0].updated : ""}`} id={`${mainMarketResult[0].results && mainMarketResult[0].results[0] ? mainMarketResult[0].results[0].id : ""}`} onClick={e => { handleBetSlip(mainMarketResult[0], item, 0, '1') }} >{mainMarketResult[0].results && mainMarketResult[0].results[0] ? mainMarketResult[0].results[0].oddValue : ""}</td>
                                                                                        <td className={`match-odds match-event ${mainMarketResult[1].results && mainMarketResult[1].results[0] ? mainMarketResult[1].results[0].updated : ""}`} id={`${mainMarketResult[1].results && mainMarketResult[1].results[0] ? mainMarketResult[1].results[0].id : ""}`} onClick={e => { handleBetSlip(mainMarketResult[1], item, 0, '1') }} >
                                                                                            <span className="odd-td-left">{(mainMarketResult[1] && mainMarketResult[1].attr ? `+ ${parseFloat(mainMarketResult[1].attr) * 1}` : "").toString()}</span>
                                                                                            <span className="odd-td-right">{mainMarketResult[1].results && mainMarketResult[1].results[0] ? mainMarketResult[1].results[0].oddValue : ""}</span>
                                                                                        </td>
                                                                                        <td className={`match-odds match-event ${mainMarketResult[2].results && mainMarketResult[2].results[0] ? mainMarketResult[2].results[0].updated : ""}`} id={`${mainMarketResult[2].results && mainMarketResult[2].results[0] ? mainMarketResult[2].results[0].id : ""}`} onClick={e => { handleBetSlip(mainMarketResult[2], item, 0, '1') }} >
                                                                                            <span className="odd-td-right">{mainMarketResult[2].results && mainMarketResult[2].results[0] ? mainMarketResult[2].results[0].oddValue : ""}</span>
                                                                                        </td>
                                                                                        <td className={`match-odds match-event ${firstHalfMainMarketResult[0].results && firstHalfMainMarketResult[0].results[0] ? firstHalfMainMarketResult[0].results[0].updated : ""}`} id={`${firstHalfMainMarketResult[0].results && firstHalfMainMarketResult[0].results[0] ? firstHalfMainMarketResult[0].results[0].id : ""}`} onClick={e => { handleBetSlip(firstHalfMainMarketResult[0], item, 0, '1') }} >{firstHalfMainMarketResult[0].results && firstHalfMainMarketResult[0].results[0] ? firstHalfMainMarketResult[0].results[0].oddValue : ""}</td>
                                                                                        <td className={`match-odds match-event ${firstHalfMainMarketResult[1].results && firstHalfMainMarketResult[1].results[0] ? firstHalfMainMarketResult[1].results[0].updated : ""}`} id={`${firstHalfMainMarketResult[1].results && firstHalfMainMarketResult[1].results[0] ? firstHalfMainMarketResult[1].results[0].id : ""}`} onClick={e => { handleBetSlip(firstHalfMainMarketResult[1], item, 0, '1') }} >
                                                                                            <span className="odd-td-left">{(firstHalfMainMarketResult[1] && firstHalfMainMarketResult[1].attr ? `+ ${parseFloat(firstHalfMainMarketResult[1].attr) * 1}` : "").toString()}</span>
                                                                                            <span className="odd-td-right">{firstHalfMainMarketResult[1].results && firstHalfMainMarketResult[1].results[0] ? firstHalfMainMarketResult[1].results[0].oddValue : ""}</span>
                                                                                        </td>
                                                                                        <td className={`match-odds match-event ${firstHalfMainMarketResult[2].results && firstHalfMainMarketResult[2].results[0] ? firstHalfMainMarketResult[2].results[0].updated : ""}`} id={`${firstHalfMainMarketResult[2].results && firstHalfMainMarketResult[2].results[0] ? firstHalfMainMarketResult[2].results[0].id : ""}`} onClick={e => { handleBetSlip(firstHalfMainMarketResult[2], item, 0, '1') }} >
                                                                                            <span className="odd-td-right">{firstHalfMainMarketResult[2].results && firstHalfMainMarketResult[2].results[0] ? firstHalfMainMarketResult[2].results[0].oddValue : ""}</span>
                                                                                        </td>
                                                                                        <td className="match-odds more-odds" rowSpan="3"><a href={`/event/${item.Id}`}>+{markets.length > 45 ? 45 : markets.length}</a></td>
                                                                                    </tr>
                                                                                    <tr>
                                                                                        <td className="match-event">
                                                                                            <span className='team-name'>{getTextByLanguage(item.AwayTeam)}</span>
                                                                                            {
                                                                                                item.Scoreboard.yellowCards && item.Scoreboard.yellowCards.player2["255"] > 0 ? (
                                                                                                    <span className="yellow-card"><sup>{item.Scoreboard.yellowCards.player2["255"]}</sup></span>
                                                                                                ) : null
                                                                                            }
                                                                                            {
                                                                                                item.Scoreboard.redCards && item.Scoreboard.redCards.player2["255"] > 0 ? (
                                                                                                    <span className="red-card"><sup>{item.Scoreboard.redCards.player2["255"]}</sup></span>
                                                                                                ) : null
                                                                                            }
                                                                                        </td>
                                                                                        <td className={`match-odds match-event ${mainMarketResult[0].results && mainMarketResult[0].results[1] ? mainMarketResult[0].results[1].updated : ""}`} id={`${mainMarketResult[0].results && mainMarketResult[0].results[1] ? mainMarketResult[0].results[1].id : ""}`} onClick={e => { handleBetSlip(mainMarketResult[0], item, 1, '2') }} >{mainMarketResult[0].results && mainMarketResult[0].results[1] ? mainMarketResult[0].results[1].oddValue : ""}</td>
                                                                                        <td className={`match-odds match-event ${mainMarketResult[1].results && mainMarketResult[1].results[1] ? mainMarketResult[1].results[1].updated : ""}`} id={`${mainMarketResult[1].results && mainMarketResult[1].results[1] ? mainMarketResult[1].results[1].id : ""}`} onClick={e => { handleBetSlip(mainMarketResult[1], item, 1, '2') }} >
                                                                                            <span className="odd-td-left">{(mainMarketResult[1] && mainMarketResult[1].attr ? mainMarketResult[1].attr * -1 : "").toString()}</span>
                                                                                            <span className="odd-td-right">{mainMarketResult[1].results && mainMarketResult[1].results[1] ? mainMarketResult[1].results[1].oddValue : ""}</span>
                                                                                        </td>
                                                                                        <td className={`match-odds match-event ${mainMarketResult[2].results && mainMarketResult[2].results[1] ? mainMarketResult[2].results[1].updated : ""}`} id={`${mainMarketResult[2].results && mainMarketResult[2].results[1] ? mainMarketResult[2].results[1].id : ""}`} onClick={e => { handleBetSlip(mainMarketResult[2], item, 1, '2') }} >
                                                                                            <span className="odd-td-left">{(mainMarketResult[2] && mainMarketResult[2].attr ? `U ${mainMarketResult[2].attr}` : "").toString()}</span>
                                                                                            <span className="odd-td-right">{mainMarketResult[2].results && mainMarketResult[2].results[1] ? mainMarketResult[2].results[1].oddValue : ""}</span>
                                                                                        </td>
                                                                                        <td className={`match-odds match-event ${firstHalfMainMarketResult[0].results && firstHalfMainMarketResult[0].results[2] ? firstHalfMainMarketResult[0].results[2].updated : ""}`} id={`${firstHalfMainMarketResult[0].results && firstHalfMainMarketResult[0].results[2] ? firstHalfMainMarketResult[0].results[2].id : ""}`} onClick={e => { handleBetSlip(firstHalfMainMarketResult[0], item, 2, '2') }} >{firstHalfMainMarketResult[0].results && firstHalfMainMarketResult[0].results[2] ? firstHalfMainMarketResult[0].results[2].oddValue : ""}</td>
                                                                                        <td className={`match-odds match-event ${firstHalfMainMarketResult[1].results && firstHalfMainMarketResult[1].results[2] ? firstHalfMainMarketResult[1].results[2].updated : ""}`} id={`${firstHalfMainMarketResult[1].results && firstHalfMainMarketResult[1].results[2] ? firstHalfMainMarketResult[1].results[2].id : ""}`} onClick={e => { handleBetSlip(firstHalfMainMarketResult[1], item, 2, '2') }} >
                                                                                            <span className="odd-td-left">{(firstHalfMainMarketResult[1] && firstHalfMainMarketResult[1].attr ? firstHalfMainMarketResult[1].attr * -1 : "").toString()}</span>
                                                                                            <span className="odd-td-right">{firstHalfMainMarketResult[1].results && firstHalfMainMarketResult[1].results[2] ? firstHalfMainMarketResult[1].results[2].oddValue : ""}</span>
                                                                                        </td>
                                                                                        <td className={`match-odds match-event ${firstHalfMainMarketResult[2].results && firstHalfMainMarketResult[2].results[1] ? firstHalfMainMarketResult[2].results[1].updated : ""}`} id={`${firstHalfMainMarketResult[2].results && firstHalfMainMarketResult[2].results[1] ? firstHalfMainMarketResult[2].results[1].id : ""}`} onClick={e => { handleBetSlip(firstHalfMainMarketResult[2], item, 1, '2') }} >
                                                                                            <span className="odd-td-left">{(firstHalfMainMarketResult[2] && firstHalfMainMarketResult[2].attr ? `U ${firstHalfMainMarketResult[2].attr}` : "").toString()}</span>
                                                                                            <span className="odd-td-right">{firstHalfMainMarketResult[2].results && firstHalfMainMarketResult[2].results[1] ? firstHalfMainMarketResult[2].results[1].oddValue : ""}</span>
                                                                                        </td>
                                                                                    </tr>
                                                                                    <tr>
                                                                                        <td className="match-draft">{getTextByLanguage("Draw")}</td>
                                                                                        <td className={`match-odds match-draft ${mainMarketResult[0].results && mainMarketResult[0].results[2] ? mainMarketResult[0].results[2].updated : ""}`} id={`${mainMarketResult[0].results && mainMarketResult[0].results[2] ? mainMarketResult[0].results[2].id : ""}`} onClick={e => { handleBetSlip(mainMarketResult[0], item, 2, 'Draw') }} >{mainMarketResult[0].results && mainMarketResult[0].results[2] ? mainMarketResult[0].results[2].oddValue : ""}</td>
                                                                                        <td className={`match-odds match-draft ${mainMarketResult[1].results && mainMarketResult[1].results[2] ? mainMarketResult[1].results[2].updated : ""}`} id={`${mainMarketResult[1].results && mainMarketResult[1].results[2] ? mainMarketResult[1].results[2].id : ""}`} onClick={e => { handleBetSlip(mainMarketResult[1], item, 2, 'Draw') }} >
                                                                                            {/* <span className="odd-td-left">{(mainMarketResult[1] && mainMarketResult[1].attr ? mainMarketResult[1].attr * -1 : "").toString()}</span>
                                                                                            <span className="odd-td-right">{mainMarketResult[1].results && mainMarketResult[1].results[2] ? mainMarketResult[1].results[2].oddValue : ""}</span> */}
                                                                                        </td>
                                                                                        <td className={`match-odds match-draft ${mainMarketResult[2].results && mainMarketResult[2].results[2] ? mainMarketResult[2].results[2].updated : ""}`} id={`${mainMarketResult[2].results && mainMarketResult[2].results[2] ? mainMarketResult[2].results[2].id : ""}`} onClick={e => { handleBetSlip(mainMarketResult[2], item, 2, 'Draw') }} >
                                                                                            {/* <span className="odd-td-left">{(mainMarketResult[2] && mainMarketResult[2].attr ? `U ${mainMarketResult[2].attr}` : "").toString()}</span> */}
                                                                                            <span className="odd-td-right">{mainMarketResult[2].results && mainMarketResult[2].results[2] ? mainMarketResult[2].results[2].oddValue : ""}</span>
                                                                                        </td>
                                                                                        <td className={`match-odds match-draft ${firstHalfMainMarketResult[0].results && firstHalfMainMarketResult[0].results[1] ? firstHalfMainMarketResult[0].results[1].updated : ""}`} id={`${firstHalfMainMarketResult[0].results && firstHalfMainMarketResult[0].results[1] ? firstHalfMainMarketResult[0].results[1].id : ""}`} onClick={e => { handleBetSlip(firstHalfMainMarketResult[0], item, 1, 'Draw') }} >{firstHalfMainMarketResult[0].results && firstHalfMainMarketResult[0].results[1] ? firstHalfMainMarketResult[0].results[1].oddValue : ""}</td>
                                                                                        <td className={`match-odds match-draft ${firstHalfMainMarketResult[1].results && firstHalfMainMarketResult[1].results[1] ? firstHalfMainMarketResult[1].results[1].updated : ""}`} id={`${firstHalfMainMarketResult[1].results && firstHalfMainMarketResult[1].results[1] ? firstHalfMainMarketResult[1].results[1].id : ""}`} onClick={e => { handleBetSlip(firstHalfMainMarketResult[1], item, 1, 'Draw') }} >
                                                                                            <span className="odd-td-left">{(firstHalfMainMarketResult[1] && firstHalfMainMarketResult[1].attr ? firstHalfMainMarketResult[1].attr * -1 : "").toString()}</span>
                                                                                            <span className="odd-td-right">{firstHalfMainMarketResult[1].results && firstHalfMainMarketResult[1].results[1] ? firstHalfMainMarketResult[1].results[1].oddValue : ""}</span>
                                                                                        </td>
                                                                                        <td className={`match-odds match-draft ${firstHalfMainMarketResult[2].results && firstHalfMainMarketResult[2].results[2] ? firstHalfMainMarketResult[2].results[2].updated : ""}`} id={`${firstHalfMainMarketResult[2].results && firstHalfMainMarketResult[2].results[2] ? firstHalfMainMarketResult[2].results[2].id : ""}`} onClick={e => { handleBetSlip(firstHalfMainMarketResult[2], item, 2, 'Draw') }} >
                                                                                            {/* <span className="odd-td-left">{(firstHalfMainMarketResult[2] && firstHalfMainMarketResult[2].attr ? `U ${firstHalfMainMarketResult[2].attr}` : "").toString()}</span> */}
                                                                                            <span className="odd-td-right">{firstHalfMainMarketResult[2].results && firstHalfMainMarketResult[2].results[2] ? firstHalfMainMarketResult[2].results[2].oddValue : ""}</span>
                                                                                        </td>
                                                                                    </tr>
                                                                                </React.Fragment>
                                                                            )
                                                                        })
                                                                    }
                                                                </tbody>
                                                            </table>
                                                        </div>
                                                    </CardBody>
                                                </React.Fragment>

                                            )
                                        })}
                                    </Card>
                                ) : ""
                            }
                        </TabPane>
                        <TabPane tabId='5'>
                            {
                                active === "5" ? (
                                    <Card className="b-team__list">
                                        <CardHeader >
                                            <div className="left d-flex align-items-center">
                                                <h2 id={`sport-title-12`} className="soccer m-auto pl-3 p-1">{getTextByLanguage("Ice Hockey")}</h2>
                                                <span onClick={e => { handleRefresh() }} className={`timer-number d-flex align-items-center ${isRefreshing ? "refresh-loading" : ""}`}>{timerNumber}</span>
                                            </div>
                                            <div className="right">
                                                <a className="fav-link mr-2" href="/favorite" data-nsfw-filter-status="swf">{getTextByLanguage("Favourite Events")}</a>
                                            </div>
                                        </CardHeader>
                                        {Object.keys(leagueData).map((key, index) => {
                                            const league = leagueData[key]
                                            let flagImg = "all_leagues"
                                            let regionName = league[0].RegionName.replaceAll("(", "")
                                            regionName = league[0].RegionName.replaceAll(")", "")
                                            regionName = league[0].RegionName.replaceAll(" ", "")
                                            if (flagsByRegionName[regionName]) {
                                                flagImg = flagsByRegionName[regionName]
                                            } else {
                                                flagImg = regionName
                                            }
                                            return (
                                                <React.Fragment key={index}>
                                                    <div className="title py-1">
                                                        <div className="left">
                                                            <h3>
                                                                <img src={`https://getbet77.com/files/flags1/${flagImg}.png`} alt="" />
                                                                <span data-nsfw-filter-status="swf">{getTextByLanguage(league[0]["RegionName"])} {getTextByLanguage(league[0]["LeagueName"])}</span>
                                                            </h3>
                                                        </div>
                                                    </div>
                                                    <CardBody className="b-team pt-0 pb-0">
                                                        <div className="table-wrapper">
                                                            <table className="table table-bordered">
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
                                                                    {
                                                                        league.map((item, order) => {
                                                                            const mainMarketResultKey = mainMarketResultBySportId["12"]
                                                                            let markets = []
                                                                            const mainMarketResult = ["", "", ""]
                                                                            const firstHalfMainMarketResult = ["", "", ""]
                                                                            let favorId = ""
                                                                            const homeTeamScore = item.Scoreboard && item.Scoreboard.score ? item.Scoreboard.score.split(":")[0] : ""
                                                                            const awayTeamScore = item.Scoreboard && item.Scoreboard.score ? item.Scoreboard.score.split(":")[1] : ""
                                                                            favorId = item.Id.replace(":", "")
                                                                            if (eventData[item.Id]) {
                                                                                markets = eventData[item.Id].Markets
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
                                                                                    <tr>
                                                                                        <td rowSpan="3" className="">
                                                                                            <div className="d-flex mb-1 justify-content-center" id={`favor_${favorId}`} onClick={e => { handleFavor(item, favorId) }}><Star className={`favor-icon ${item.favor ? "active" : ""} `} /></div>
                                                                                            <div className="d-flex justify-content-center">Live</div>
                                                                                        </td>
                                                                                        <td className="match-event">
                                                                                            <span className='team-name'>{getTextByLanguage(item.HomeTeam)}</span>
                                                                                            {
                                                                                                item.Scoreboard.yellowCards && item.Scoreboard.yellowCards.player1["255"] > 0 ? (
                                                                                                    <span className="yellow-card"><sup>{item.Scoreboard.yellowCards.player1["255"]}</sup></span>
                                                                                                ) : null
                                                                                            }
                                                                                            {
                                                                                                item.Scoreboard.redCards && item.Scoreboard.redCards.player1["255"] > 0 ? (
                                                                                                    <span className="red-card"><sup>{item.Scoreboard.redCards.player1["255"]}</sup></span>
                                                                                                ) : null
                                                                                            }
                                                                                        </td>
                                                                                        <td className={`match-odds match-event ${mainMarketResult[0].results && mainMarketResult[0].results[0] ? mainMarketResult[0].results[0].updated : ""}`} id={`${mainMarketResult[0].results && mainMarketResult[0].results[0] ? mainMarketResult[0].results[0].id : ""}`} onClick={e => { handleBetSlip(mainMarketResult[0], item, 0, '1') }} >{mainMarketResult[0].results && mainMarketResult[0].results[0] ? mainMarketResult[0].results[0].oddValue : ""}</td>
                                                                                        <td className={`match-odds match-event ${mainMarketResult[1].results && mainMarketResult[1].results[0] ? mainMarketResult[1].results[0].updated : ""}`} id={`${mainMarketResult[1].results && mainMarketResult[1].results[0] ? mainMarketResult[1].results[0].id : ""}`} onClick={e => { handleBetSlip(mainMarketResult[1], item, 0, '1') }} >
                                                                                            <span className="odd-td-left">{(mainMarketResult[1] && mainMarketResult[1].attr ? `+ ${parseFloat(mainMarketResult[1].attr) * 1}` : "").toString()}</span>
                                                                                            <span className="odd-td-right">{mainMarketResult[1].results && mainMarketResult[1].results[0] ? mainMarketResult[1].results[0].oddValue : ""}</span>
                                                                                        </td>
                                                                                        <td className={`match-odds match-event ${mainMarketResult[2].results && mainMarketResult[2].results[0] ? mainMarketResult[2].results[0].updated : ""}`} id={`${mainMarketResult[2].results && mainMarketResult[2].results[0] ? mainMarketResult[2].results[0].id : ""}`} onClick={e => { handleBetSlip(mainMarketResult[2], item, 0, '1') }} >
                                                                                            <span className="odd-td-right">{mainMarketResult[2].results && mainMarketResult[2].results[0] ? mainMarketResult[2].results[0].oddValue : ""}</span>
                                                                                        </td>
                                                                                        <td className={`match-odds match-event ${firstHalfMainMarketResult[0].results && firstHalfMainMarketResult[0].results[0] ? firstHalfMainMarketResult[0].results[0].updated : ""}`} id={`${firstHalfMainMarketResult[0].results && firstHalfMainMarketResult[0].results[0] ? firstHalfMainMarketResult[0].results[0].id : ""}`} onClick={e => { handleBetSlip(firstHalfMainMarketResult[0], item, 0, '1') }} >{firstHalfMainMarketResult[0].results && firstHalfMainMarketResult[0].results[0] ? firstHalfMainMarketResult[0].results[0].oddValue : ""}</td>
                                                                                        <td className={`match-odds match-event ${firstHalfMainMarketResult[1].results && firstHalfMainMarketResult[1].results[0] ? firstHalfMainMarketResult[1].results[0].updated : ""}`} id={`${firstHalfMainMarketResult[1].results && firstHalfMainMarketResult[1].results[0] ? firstHalfMainMarketResult[1].results[0].id : ""}`} onClick={e => { handleBetSlip(firstHalfMainMarketResult[1], item, 0, '1') }} >
                                                                                            <span className="odd-td-left">{(firstHalfMainMarketResult[1] && firstHalfMainMarketResult[1].attr ? `+ ${parseFloat(firstHalfMainMarketResult[1].attr) * 1}` : "").toString()}</span>
                                                                                            <span className="odd-td-right">{firstHalfMainMarketResult[1].results && firstHalfMainMarketResult[1].results[0] ? firstHalfMainMarketResult[1].results[0].oddValue : ""}</span>
                                                                                        </td>
                                                                                        <td className={`match-odds match-event ${firstHalfMainMarketResult[2].results && firstHalfMainMarketResult[2].results[0] ? firstHalfMainMarketResult[2].results[0].updated : ""}`} id={`${firstHalfMainMarketResult[2].results && firstHalfMainMarketResult[2].results[0] ? firstHalfMainMarketResult[2].results[0].id : ""}`} onClick={e => { handleBetSlip(firstHalfMainMarketResult[2], item, 0, '1') }} >
                                                                                            <span className="odd-td-right">{firstHalfMainMarketResult[2].results && firstHalfMainMarketResult[2].results[0] ? firstHalfMainMarketResult[2].results[0].oddValue : ""}</span>
                                                                                        </td>
                                                                                        <td className="match-odds more-odds" rowSpan="3"><a href={`/event/${item.Id}`}>+{markets.length > 45 ? 45 : markets.length}</a></td>
                                                                                    </tr>
                                                                                    <tr>
                                                                                        <td className="match-event">
                                                                                            <span className='team-name'>{getTextByLanguage(item.AwayTeam)}</span>
                                                                                            {
                                                                                                item.Scoreboard.yellowCards && item.Scoreboard.yellowCards.player2["255"] > 0 ? (
                                                                                                    <span className="yellow-card"><sup>{item.Scoreboard.yellowCards.player2["255"]}</sup></span>
                                                                                                ) : null
                                                                                            }
                                                                                            {
                                                                                                item.Scoreboard.redCards && item.Scoreboard.redCards.player2["255"] > 0 ? (
                                                                                                    <span className="red-card"><sup>{item.Scoreboard.redCards.player2["255"]}</sup></span>
                                                                                                ) : null
                                                                                            }
                                                                                        </td>
                                                                                        <td className={`match-odds match-event ${mainMarketResult[0].results && mainMarketResult[0].results[2] ? mainMarketResult[0].results[2].updated : ""}`} id={`${mainMarketResult[0].results && mainMarketResult[0].results[2] ? mainMarketResult[0].results[2].id : ""}`} onClick={e => { handleBetSlip(mainMarketResult[0], item, 2, '2') }} >{mainMarketResult[0].results && mainMarketResult[0].results[2] ? mainMarketResult[0].results[2].oddValue : ""}</td>
                                                                                        <td className={`match-odds match-event ${mainMarketResult[1].results && mainMarketResult[1].results[1] ? mainMarketResult[1].results[1].updated : ""}`} id={`${mainMarketResult[1].results && mainMarketResult[1].results[1] ? mainMarketResult[1].results[1].id : ""}`} onClick={e => { handleBetSlip(mainMarketResult[1], item, 1, '2') }} >
                                                                                            <span className="odd-td-left">{(mainMarketResult[1] && mainMarketResult[1].attr ? mainMarketResult[1].attr * -1 : "").toString()}</span>
                                                                                            <span className="odd-td-right">{mainMarketResult[1].results && mainMarketResult[1].results[1] ? mainMarketResult[1].results[1].oddValue : ""}</span>
                                                                                        </td>
                                                                                        <td className={`match-odds match-event ${mainMarketResult[2].results && mainMarketResult[2].results[1] ? mainMarketResult[2].results[1].updated : ""}`} id={`${mainMarketResult[2].results && mainMarketResult[2].results[1] ? mainMarketResult[2].results[1].id : ""}`} onClick={e => { handleBetSlip(mainMarketResult[2], item, 1, '2') }} >
                                                                                            <span className="odd-td-left">{(mainMarketResult[2] && mainMarketResult[2].attr ? `U ${mainMarketResult[2].attr}` : "").toString()}</span>
                                                                                            <span className="odd-td-right">{mainMarketResult[2].results && mainMarketResult[2].results[1] ? mainMarketResult[2].results[1].oddValue : ""}</span>
                                                                                        </td>
                                                                                        <td className={`match-odds match-event ${firstHalfMainMarketResult[0].results && firstHalfMainMarketResult[0].results[2] ? firstHalfMainMarketResult[0].results[2].updated : ""}`} id={`${firstHalfMainMarketResult[0].results && firstHalfMainMarketResult[0].results[2] ? firstHalfMainMarketResult[0].results[2].id : ""}`} onClick={e => { handleBetSlip(firstHalfMainMarketResult[0], item, 2, '2') }} >{firstHalfMainMarketResult[0].results && firstHalfMainMarketResult[0].results[2] ? firstHalfMainMarketResult[0].results[2].oddValue : ""}</td>
                                                                                        <td className={`match-odds match-event ${firstHalfMainMarketResult[1].results && firstHalfMainMarketResult[1].results[2] ? firstHalfMainMarketResult[1].results[2].updated : ""}`} id={`${firstHalfMainMarketResult[1].results && firstHalfMainMarketResult[1].results[2] ? firstHalfMainMarketResult[1].results[2].id : ""}`} onClick={e => { handleBetSlip(firstHalfMainMarketResult[1], item, 2, '2') }} >
                                                                                            <span className="odd-td-left">{(firstHalfMainMarketResult[1] && firstHalfMainMarketResult[1].attr ? firstHalfMainMarketResult[1].attr * -1 : "").toString()}</span>
                                                                                            <span className="odd-td-right">{firstHalfMainMarketResult[1].results && firstHalfMainMarketResult[1].results[2] ? firstHalfMainMarketResult[1].results[2].oddValue : ""}</span>
                                                                                        </td>
                                                                                        <td className={`match-odds match-event ${firstHalfMainMarketResult[2].results && firstHalfMainMarketResult[2].results[1] ? firstHalfMainMarketResult[2].results[1].updated : ""}`} id={`${firstHalfMainMarketResult[2].results && firstHalfMainMarketResult[2].results[1] ? firstHalfMainMarketResult[2].results[1].id : ""}`} onClick={e => { handleBetSlip(firstHalfMainMarketResult[2], item, 1, '2') }} >
                                                                                            <span className="odd-td-left">{(firstHalfMainMarketResult[2] && firstHalfMainMarketResult[2].attr ? `U ${firstHalfMainMarketResult[2].attr}` : "").toString()}</span>
                                                                                            <span className="odd-td-right">{firstHalfMainMarketResult[2].results && firstHalfMainMarketResult[2].results[1] ? firstHalfMainMarketResult[2].results[1].oddValue : ""}</span>
                                                                                        </td>
                                                                                    </tr>
                                                                                    <tr>
                                                                                        <td className="match-draft">{getTextByLanguage("Draw")}</td>
                                                                                        <td className={`match-odds match-draft ${mainMarketResult[0].results && mainMarketResult[0].results[1] ? mainMarketResult[0].results[1].updated : ""}`} id={`${mainMarketResult[0].results && mainMarketResult[0].results[1] ? mainMarketResult[0].results[1].id : ""}`} onClick={e => { handleBetSlip(mainMarketResult[0], item, 1, 'Draw') }} >{mainMarketResult[0].results && mainMarketResult[0].results[1] ? mainMarketResult[0].results[1].oddValue : ""}</td>
                                                                                        <td className={`match-odds match-draft ${mainMarketResult[1].results && mainMarketResult[1].results[2] ? mainMarketResult[1].results[2].updated : ""}`} id={`${mainMarketResult[1].results && mainMarketResult[1].results[2] ? mainMarketResult[1].results[2].id : ""}`} onClick={e => { handleBetSlip(mainMarketResult[1], item, 2, 'Draw') }} >
                                                                                            {/* <span className="odd-td-left">{(mainMarketResult[1] && mainMarketResult[1].attr ? mainMarketResult[1].attr * -1 : "").toString()}</span>
                                                                                            <span className="odd-td-right">{mainMarketResult[1].results && mainMarketResult[1].results[2] ? mainMarketResult[1].results[2].oddValue : ""}</span> */}
                                                                                        </td>
                                                                                        <td className={`match-odds match-draft ${mainMarketResult[2].results && mainMarketResult[2].results[2] ? mainMarketResult[2].results[2].updated : ""}`} id={`${mainMarketResult[2].results && mainMarketResult[2].results[2] ? mainMarketResult[2].results[2].id : ""}`} onClick={e => { handleBetSlip(mainMarketResult[2], item, 2, 'Draw') }} >
                                                                                            {/* <span className="odd-td-left">{(mainMarketResult[2] && mainMarketResult[2].attr ? `U ${mainMarketResult[2].attr}` : "").toString()}</span> */}
                                                                                            <span className="odd-td-right">{mainMarketResult[2].results && mainMarketResult[2].results[2] ? mainMarketResult[2].results[2].oddValue : ""}</span>
                                                                                        </td>
                                                                                        <td className={`match-odds match-draft ${firstHalfMainMarketResult[0].results && firstHalfMainMarketResult[0].results[1] ? firstHalfMainMarketResult[0].results[1].updated : ""}`} id={`${firstHalfMainMarketResult[0].results && firstHalfMainMarketResult[0].results[1] ? firstHalfMainMarketResult[0].results[1].id : ""}`} onClick={e => { handleBetSlip(firstHalfMainMarketResult[0], item, 1, 'Draw') }} >{firstHalfMainMarketResult[0].results && firstHalfMainMarketResult[0].results[1] ? firstHalfMainMarketResult[0].results[1].oddValue : ""}</td>
                                                                                        <td className={`match-odds match-draft ${firstHalfMainMarketResult[1].results && firstHalfMainMarketResult[1].results[1] ? firstHalfMainMarketResult[1].results[1].updated : ""}`} id={`${firstHalfMainMarketResult[1].results && firstHalfMainMarketResult[1].results[1] ? firstHalfMainMarketResult[1].results[1].id : ""}`} onClick={e => { handleBetSlip(firstHalfMainMarketResult[1], item, 1, 'Draw') }} >
                                                                                            {/* <span className="odd-td-left">{(firstHalfMainMarketResult[1] && firstHalfMainMarketResult[1].attr ? firstHalfMainMarketResult[1].attr * -1 : "").toString()}</span>
                                                                                            <span className="odd-td-right">{firstHalfMainMarketResult[1].results && firstHalfMainMarketResult[1].results[1] ? firstHalfMainMarketResult[1].results[1].oddValue : ""}</span> */}
                                                                                        </td>
                                                                                        <td className={`match-odds match-draft ${firstHalfMainMarketResult[2].results && firstHalfMainMarketResult[2].results[2] ? firstHalfMainMarketResult[2].results[2].updated : ""}`} id={`${firstHalfMainMarketResult[2].results && firstHalfMainMarketResult[2].results[2] ? firstHalfMainMarketResult[2].results[2].id : ""}`} onClick={e => { handleBetSlip(firstHalfMainMarketResult[2], item, 2, 'Draw') }} >
                                                                                            {/* <span className="odd-td-left">{(firstHalfMainMarketResult[2] && firstHalfMainMarketResult[2].attr ? `U ${firstHalfMainMarketResult[2].attr}` : "").toString()}</span> */}
                                                                                            <span className="odd-td-right">{firstHalfMainMarketResult[2].results && firstHalfMainMarketResult[2].results[2] ? firstHalfMainMarketResult[2].results[2].oddValue : ""}</span>
                                                                                        </td>
                                                                                    </tr>
                                                                                </React.Fragment>
                                                                            )
                                                                        })
                                                                    }
                                                                </tbody>
                                                            </table>
                                                        </div>
                                                    </CardBody>
                                                </React.Fragment>

                                            )
                                        })}
                                    </Card>
                                ) : ""
                            }
                        </TabPane>
                        <TabPane tabId='6'>
                            {
                                active === "6" ? (
                                    <Card className="b-team__list">
                                        <CardHeader >
                                            <div className="left d-flex align-items-center">
                                                <h2 id={`sport-title-18`} className="soccer m-auto pl-3 p-1">{getTextByLanguage("Volleyball")}</h2>
                                                <span onClick={e => { handleRefresh() }} className={`timer-number d-flex align-items-center ${isRefreshing ? "refresh-loading" : ""}`}>{timerNumber}</span>
                                            </div>
                                            <div className="right">
                                                <a className="fav-link mr-2" href="/favorite" data-nsfw-filter-status="swf">{getTextByLanguage("Favourite Events")}</a>
                                            </div>
                                        </CardHeader>
                                        {Object.keys(leagueData).map((key, index) => {
                                            const league = leagueData[key]
                                            let flagImg = "all_leagues"
                                            let regionName = league[0].RegionName.replaceAll("(", "")
                                            regionName = league[0].RegionName.replaceAll(")", "")
                                            regionName = league[0].RegionName.replaceAll(" ", "")
                                            if (flagsByRegionName[regionName]) {
                                                flagImg = flagsByRegionName[regionName]
                                            } else {
                                                flagImg = regionName
                                            }
                                            return (
                                                <React.Fragment key={index}>
                                                    <div className="title py-1">
                                                        <div className="left">
                                                            <h3>
                                                                <img src={`https://getbet77.com/files/flags1/${flagImg}.png`} alt="" />
                                                                <span data-nsfw-filter-status="swf">{getTextByLanguage(league[0]["RegionName"])} {getTextByLanguage(league[0]["LeagueName"])}</span>
                                                            </h3>
                                                        </div>
                                                    </div>
                                                    <CardBody className="b-team pt-0 pb-0">
                                                        <div className="table-wrapper">
                                                            <table className="table table-bordered">
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
                                                                    {
                                                                        league.map((item, order) => {
                                                                            const mainMarketResultKey = mainMarketResultBySportId["18"]
                                                                            let markets = []
                                                                            const mainMarketResult = ["", "", ""]
                                                                            const firstHalfMainMarketResult = ["", "", ""]
                                                                            let favorId = ""
                                                                            const homeTeamScore = item.Scoreboard && item.Scoreboard.score ? item.Scoreboard.score.split(":")[0] : ""
                                                                            const awayTeamScore = item.Scoreboard && item.Scoreboard.score ? item.Scoreboard.score.split(":")[1] : ""
                                                                            favorId = item.Id.replace(":", "")
                                                                            if (eventData[item.Id]) {
                                                                                markets = eventData[item.Id].Markets
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
                                                                                    <tr>
                                                                                        <td rowSpan="3" className="">
                                                                                            <div className="d-flex mb-1 justify-content-center" id={`favor_${favorId}`} onClick={e => { handleFavor(item, favorId) }}><Star className={`favor-icon ${item.favor ? "active" : ""} `} /></div>
                                                                                            <div className="d-flex justify-content-center">Live</div>
                                                                                        </td>
                                                                                        <td className="match-event">
                                                                                            <span className='team-name'>{getTextByLanguage(item.HomeTeam)}</span>
                                                                                            {
                                                                                                item.Scoreboard.yellowCards && item.Scoreboard.yellowCards.player1["255"] > 0 ? (
                                                                                                    <span className="yellow-card"><sup>{item.Scoreboard.yellowCards.player1["255"]}</sup></span>
                                                                                                ) : null
                                                                                            }
                                                                                            {
                                                                                                item.Scoreboard.redCards && item.Scoreboard.redCards.player1["255"] > 0 ? (
                                                                                                    <span className="red-card"><sup>{item.Scoreboard.redCards.player1["255"]}</sup></span>
                                                                                                ) : null
                                                                                            }
                                                                                        </td>
                                                                                        <td className={`match-odds match-event ${mainMarketResult[0].results && mainMarketResult[0].results[0] ? mainMarketResult[0].results[0].updated : ""}`} id={`${mainMarketResult[0].results && mainMarketResult[0].results[0] ? mainMarketResult[0].results[0].id : ""}`} onClick={e => { handleBetSlip(mainMarketResult[0], item, 0, '1') }} >{mainMarketResult[0].results && mainMarketResult[0].results[0] ? mainMarketResult[0].results[0].oddValue : ""}</td>
                                                                                        <td className={`match-odds match-event ${mainMarketResult[1].results && mainMarketResult[1].results[0] ? mainMarketResult[1].results[0].updated : ""}`} id={`${mainMarketResult[1].results && mainMarketResult[1].results[0] ? mainMarketResult[1].results[0].id : ""}`} onClick={e => { handleBetSlip(mainMarketResult[1], item, 0, '1') }} >
                                                                                            <span className="odd-td-left">{(mainMarketResult[1] && mainMarketResult[1].attr ? `+ ${parseFloat(mainMarketResult[1].attr) * 1}` : "").toString()}</span>
                                                                                            <span className="odd-td-right">{mainMarketResult[1].results && mainMarketResult[1].results[0] ? mainMarketResult[1].results[0].oddValue : ""}</span>
                                                                                        </td>
                                                                                        <td className={`match-odds match-event ${mainMarketResult[2].results && mainMarketResult[2].results[0] ? mainMarketResult[2].results[0].updated : ""}`} id={`${mainMarketResult[2].results && mainMarketResult[2].results[0] ? mainMarketResult[2].results[0].id : ""}`} onClick={e => { handleBetSlip(mainMarketResult[2], item, 0, '1') }} >
                                                                                            <span className="odd-td-right">{mainMarketResult[2].results && mainMarketResult[2].results[0] ? mainMarketResult[2].results[0].oddValue : ""}</span>
                                                                                        </td>
                                                                                        <td className={`match-odds match-event ${firstHalfMainMarketResult[0].results && firstHalfMainMarketResult[0].results[0] ? firstHalfMainMarketResult[0].results[0].updated : ""}`} id={`${firstHalfMainMarketResult[0].results && firstHalfMainMarketResult[0].results[0] ? firstHalfMainMarketResult[0].results[0].id : ""}`} onClick={e => { handleBetSlip(firstHalfMainMarketResult[0], item, 0, '1') }} >{firstHalfMainMarketResult[0].results && firstHalfMainMarketResult[0].results[0] ? firstHalfMainMarketResult[0].results[0].oddValue : ""}</td>
                                                                                        <td className={`match-odds match-event ${firstHalfMainMarketResult[1].results && firstHalfMainMarketResult[1].results[0] ? firstHalfMainMarketResult[1].results[0].updated : ""}`} id={`${firstHalfMainMarketResult[1].results && firstHalfMainMarketResult[1].results[0] ? firstHalfMainMarketResult[1].results[0].id : ""}`} onClick={e => { handleBetSlip(firstHalfMainMarketResult[1], item, 0, '1') }} >
                                                                                            <span className="odd-td-left">{(firstHalfMainMarketResult[1] && firstHalfMainMarketResult[1].attr ? `+ ${parseFloat(firstHalfMainMarketResult[1].attr) * 1}` : "").toString()}</span>
                                                                                            <span className="odd-td-right">{firstHalfMainMarketResult[1].results && firstHalfMainMarketResult[1].results[0] ? firstHalfMainMarketResult[1].results[0].oddValue : ""}</span>
                                                                                        </td>
                                                                                        <td className={`match-odds match-event ${firstHalfMainMarketResult[2].results && firstHalfMainMarketResult[2].results[0] ? firstHalfMainMarketResult[2].results[0].updated : ""}`} id={`${firstHalfMainMarketResult[2].results && firstHalfMainMarketResult[2].results[0] ? firstHalfMainMarketResult[2].results[0].id : ""}`} onClick={e => { handleBetSlip(firstHalfMainMarketResult[2], item, 0, '1') }} >
                                                                                            <span className="odd-td-right">{firstHalfMainMarketResult[2].results && firstHalfMainMarketResult[2].results[0] ? firstHalfMainMarketResult[2].results[0].oddValue : ""}</span>
                                                                                        </td>
                                                                                        <td className="match-odds more-odds" rowSpan="3"><a href={`/event/${item.Id}`}>+{markets.length > 45 ? 45 : markets.length}</a></td>
                                                                                    </tr>
                                                                                    <tr>
                                                                                        <td className="match-event">
                                                                                            <span className='team-name'>{getTextByLanguage(item.AwayTeam)}</span>
                                                                                            {
                                                                                                item.Scoreboard.yellowCards && item.Scoreboard.yellowCards.player2["255"] > 0 ? (
                                                                                                    <span className="yellow-card"><sup>{item.Scoreboard.yellowCards.player2["255"]}</sup></span>
                                                                                                ) : null
                                                                                            }
                                                                                            {
                                                                                                item.Scoreboard.redCards && item.Scoreboard.redCards.player2["255"] > 0 ? (
                                                                                                    <span className="red-card"><sup>{item.Scoreboard.redCards.player2["255"]}</sup></span>
                                                                                                ) : null
                                                                                            }
                                                                                        </td>
                                                                                        <td className={`match-odds match-event ${mainMarketResult[0].results && mainMarketResult[0].results[1] ? mainMarketResult[0].results[1].updated : ""}`} id={`${mainMarketResult[0].results && mainMarketResult[0].results[1] ? mainMarketResult[0].results[1].id : ""}`} onClick={e => { handleBetSlip(mainMarketResult[0], item, 1, '2') }} >{mainMarketResult[0].results && mainMarketResult[0].results[1] ? mainMarketResult[0].results[1].oddValue : ""}</td>
                                                                                        <td className={`match-odds match-event ${mainMarketResult[1].results && mainMarketResult[1].results[1] ? mainMarketResult[1].results[1].updated : ""}`} id={`${mainMarketResult[1].results && mainMarketResult[1].results[1] ? mainMarketResult[1].results[1].id : ""}`} onClick={e => { handleBetSlip(mainMarketResult[1], item, 1, '2') }} >
                                                                                            <span className="odd-td-left">{(mainMarketResult[1] && mainMarketResult[1].attr ? mainMarketResult[1].attr * -1 : "").toString()}</span>
                                                                                            <span className="odd-td-right">{mainMarketResult[1].results && mainMarketResult[1].results[1] ? mainMarketResult[1].results[1].oddValue : ""}</span>
                                                                                        </td>
                                                                                        <td className={`match-odds match-event ${mainMarketResult[2].results && mainMarketResult[2].results[1] ? mainMarketResult[2].results[1].updated : ""}`} id={`${mainMarketResult[2].results && mainMarketResult[2].results[1] ? mainMarketResult[2].results[1].id : ""}`} onClick={e => { handleBetSlip(mainMarketResult[2], item, 1, '2') }} >
                                                                                            <span className="odd-td-left">{(mainMarketResult[2] && mainMarketResult[2].attr ? `U ${mainMarketResult[2].attr}` : "").toString()}</span>
                                                                                            <span className="odd-td-right">{mainMarketResult[2].results && mainMarketResult[2].results[1] ? mainMarketResult[2].results[1].oddValue : ""}</span>
                                                                                        </td>
                                                                                        <td className={`match-odds match-event ${firstHalfMainMarketResult[0].results && firstHalfMainMarketResult[0].results[2] ? firstHalfMainMarketResult[0].results[2].updated : ""}`} id={`${firstHalfMainMarketResult[0].results && firstHalfMainMarketResult[0].results[2] ? firstHalfMainMarketResult[0].results[2].id : ""}`} onClick={e => { handleBetSlip(firstHalfMainMarketResult[0], item, 2, '2') }} >{firstHalfMainMarketResult[0].results && firstHalfMainMarketResult[0].results[2] ? firstHalfMainMarketResult[0].results[2].oddValue : ""}</td>
                                                                                        <td className={`match-odds match-event ${firstHalfMainMarketResult[1].results && firstHalfMainMarketResult[1].results[2] ? firstHalfMainMarketResult[1].results[2].updated : ""}`} id={`${firstHalfMainMarketResult[1].results && firstHalfMainMarketResult[1].results[2] ? firstHalfMainMarketResult[1].results[2].id : ""}`} onClick={e => { handleBetSlip(firstHalfMainMarketResult[1], item, 2, '2') }} >
                                                                                            <span className="odd-td-left">{(firstHalfMainMarketResult[1] && firstHalfMainMarketResult[1].attr ? firstHalfMainMarketResult[1].attr * -1 : "").toString()}</span>
                                                                                            <span className="odd-td-right">{firstHalfMainMarketResult[1].results && firstHalfMainMarketResult[1].results[2] ? firstHalfMainMarketResult[1].results[2].oddValue : ""}</span>
                                                                                        </td>
                                                                                        <td className={`match-odds match-event ${firstHalfMainMarketResult[2].results && firstHalfMainMarketResult[2].results[1] ? firstHalfMainMarketResult[2].results[1].updated : ""}`} id={`${firstHalfMainMarketResult[2].results && firstHalfMainMarketResult[2].results[1] ? firstHalfMainMarketResult[2].results[1].id : ""}`} onClick={e => { handleBetSlip(firstHalfMainMarketResult[2], item, 1, '2') }} >
                                                                                            <span className="odd-td-left">{(firstHalfMainMarketResult[2] && firstHalfMainMarketResult[2].attr ? `U ${firstHalfMainMarketResult[2].attr}` : "").toString()}</span>
                                                                                            <span className="odd-td-right">{firstHalfMainMarketResult[2].results && firstHalfMainMarketResult[2].results[1] ? firstHalfMainMarketResult[2].results[1].oddValue : ""}</span>
                                                                                        </td>
                                                                                    </tr>
                                                                                    <tr>
                                                                                        <td className="match-draft">{getTextByLanguage("Draw")}</td>
                                                                                        <td className={`match-odds match-draft ${mainMarketResult[0].results && mainMarketResult[0].results[2] ? mainMarketResult[0].results[2].updated : ""}`} id={`${mainMarketResult[0].results && mainMarketResult[0].results[2] ? mainMarketResult[0].results[2].id : ""}`} onClick={e => { handleBetSlip(mainMarketResult[0], item, 2, 'Draw') }} >{mainMarketResult[0].results && mainMarketResult[0].results[2] ? mainMarketResult[0].results[2].oddValue : ""}</td>
                                                                                        <td className={`match-odds match-draft ${mainMarketResult[1].results && mainMarketResult[1].results[2] ? mainMarketResult[1].results[2].updated : ""} `} id={`${mainMarketResult[1].results && mainMarketResult[1].results[2] ? mainMarketResult[1].results[2].id : ""}`} onClick={e => { handleBetSlip(mainMarketResult[1], item, 2, 'Draw') }} >
                                                                                            {/* <span className="odd-td-left">{(mainMarketResult[1] && mainMarketResult[1].attr ? mainMarketResult[1].attr * -1 : "").toString()}</span>
                                                                                            <span className="odd-td-right">{mainMarketResult[1].results && mainMarketResult[1].results[2] ? mainMarketResult[1].results[2].oddValue : ""}</span> */}
                                                                                        </td>
                                                                                        <td className={`match-odds match-draft ${mainMarketResult[2].results && mainMarketResult[2].results[2] ? mainMarketResult[2].results[2].updated : ""}`} id={`${mainMarketResult[2].results && mainMarketResult[2].results[2] ? mainMarketResult[2].results[2].id : ""}`} onClick={e => { handleBetSlip(mainMarketResult[2], item, 2, 'Draw') }} >
                                                                                            {/* <span className="odd-td-left">{(mainMarketResult[2] && mainMarketResult[2].attr ? `U ${mainMarketResult[2].attr}` : "").toString()}</span> */}
                                                                                            <span className="odd-td-right">{mainMarketResult[2].results && mainMarketResult[2].results[2] ? mainMarketResult[2].results[2].oddValue : ""}</span>
                                                                                        </td>
                                                                                        <td className={`match-odds match-draft ${firstHalfMainMarketResult[0].results && firstHalfMainMarketResult[0].results[1] ? firstHalfMainMarketResult[0].results[1].updated : ""}`} id={`${firstHalfMainMarketResult[0].results && firstHalfMainMarketResult[0].results[1] ? firstHalfMainMarketResult[0].results[1].id : ""}`} onClick={e => { handleBetSlip(firstHalfMainMarketResult[0], item, 1, 'Draw') }} >{firstHalfMainMarketResult[0].results && firstHalfMainMarketResult[0].results[1] ? firstHalfMainMarketResult[0].results[1].oddValue : ""}</td>
                                                                                        <td className={`match-odds match-draft ${firstHalfMainMarketResult[1].results && firstHalfMainMarketResult[1].results[1] ? firstHalfMainMarketResult[1].results[1].updated : ""}`} id={`${firstHalfMainMarketResult[1].results && firstHalfMainMarketResult[1].results[1] ? firstHalfMainMarketResult[1].results[1].id : ""}`} onClick={e => { handleBetSlip(firstHalfMainMarketResult[1], item, 1, 'Draw') }} >
                                                                                            {/* <span className="odd-td-left">{(firstHalfMainMarketResult[1] && firstHalfMainMarketResult[1].attr ? firstHalfMainMarketResult[1].attr * -1 : "").toString()}</span>
                                                                                            <span className="odd-td-right">{firstHalfMainMarketResult[1].results && firstHalfMainMarketResult[1].results[1] ? firstHalfMainMarketResult[1].results[1].oddValue : ""}</span> */}
                                                                                        </td>
                                                                                        <td className={`match-odds match-draft ${firstHalfMainMarketResult[2].results && firstHalfMainMarketResult[2].results[2] ? firstHalfMainMarketResult[2].results[2].updated : ""}`} id={`${firstHalfMainMarketResult[2].results && firstHalfMainMarketResult[2].results[2] ? firstHalfMainMarketResult[2].results[2].id : ""}`} onClick={e => { handleBetSlip(firstHalfMainMarketResult[2], item, 2, 'Draw') }} >
                                                                                            {/* <span className="odd-td-left">{(firstHalfMainMarketResult[2] && firstHalfMainMarketResult[2].attr ? `U ${firstHalfMainMarketResult[2].attr}` : "").toString()}</span> */}
                                                                                            <span className="odd-td-right">{firstHalfMainMarketResult[2].results && firstHalfMainMarketResult[2].results[2] ? firstHalfMainMarketResult[2].results[2].oddValue : ""}</span>
                                                                                        </td>
                                                                                    </tr>
                                                                                </React.Fragment>
                                                                            )
                                                                        })
                                                                    }
                                                                </tbody>
                                                            </table>
                                                        </div>
                                                    </CardBody>
                                                </React.Fragment>

                                            )
                                        })}
                                    </Card>
                                ) : ""
                            }
                        </TabPane>
                    </TabContent >
                </React.Fragment >
            )
            }
        </React.Fragment >
    )
}

export default LiveChildren
