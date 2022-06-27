import React, { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useParams } from 'react-router-dom'
import { toast } from 'react-toastify'
import moment from 'moment'
import {
    Card, CardHeader
} from 'reactstrap'
import { Lock } from 'react-feather'
import $ from "jquery"
import AppCollapse from '@components/app-collapse'
import Axios from '../../utility/hooks/Axios'
import Spinner from "@components/spinner/Fallback-spinner"
import { addBetSlipData, changeOdds } from '../../redux/actions/sports'
import ReactInterval from 'react-interval'
import { useTranslator } from '@hooks/useTranslator'
import { getOddType } from '@utils'
import { flagsByRegionName } from '../../configs/mainConfig'

const EventChildren = ({ setHeader }) => {
    const { id } = useParams()
    const [sportsData, setSportsData] = useState(null)
    const [isLoading, setIsLoading] = useState(true)
    const [eventData, setEventData] = useState([])
    const [timerNumber, setTimerNumber] = useState(30)
    const dispatch = useDispatch()
    const slipType = useSelector(state => { return state.sports.betSlipType })
    const betSlipData = useSelector(state => { return state.sports.betSlipData })
    const [getTextByLanguage] = useTranslator()
    const [oddType, setOddType] = useState("odds")


    const handleBetSlip = (data, event, market, team) => {
        if (data[oddType] < 100) {
            if (Object.keys(betSlipData).length <= 5) {
                const result = {
                    HomeTeam: event.HomeTeam,
                    AwayTeam: event.AwayTeam,
                    LeagueName: event.LeagueName,
                    SportName: event.SportName,
                    odds: data[oddType],
                    HomeTeamScore: event.Scoreboard && event.Scoreboard.score ? event.Scoreboard.score.split(":")[0] : "-",
                    AwayTeamScore: event.Scoreboard && event.Scoreboard.score ? event.Scoreboard.score.split(":")[1] : "-",
                    name: data.name.value,
                    live: !event.IsPreMatch,
                    id: data.id,
                    eventId: id,
                    leagueId: event.LeagueId,
                    marketId: market.id,
                    IsPreMatch: event.IsPreMatch,
                    our_event_id: event.our_event_id,
                    period: market.Period,
                    marketType: market.MarketType,
                    team
                }
                const checkValue = dispatch(addBetSlipData(betSlipData, result, slipType))
                if (checkValue) {
                    $(`#${data.id}`).addClass("active")
                } else {
                    $(`#${data.id}`).removeClass("active")
                }
            }
        }
    }

    const handleChangeSlipData = async (data) => {
        for (const j in betSlipData) {
            if (betSlipData[j].leagueId === data.LeagueId && betSlipData[j].eventId === data.Id) {
                for (const k in data.Markets) {
                    if (data.Markets[k].id === betSlipData[j].marketId) {
                        for (const e in data.Markets[k].results) {
                            if (data.Markets[k].results[e].id === betSlipData[j].id) {
                                if (data.Markets[k].results[e][oddType] !== betSlipData[j][oddType]) {
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

    const handleRefresh = async () => {
        setIsLoading(true)
        const request = {
            eventId: id
        }
        const response = await Axios({
            endpoint: "/sports/get-event",
            method: "POST",
            params: request
        })
        if (response.status === 200 && response.data) {
            const item = response.data
            const homeTeamScore = item.Scoreboard && item.Scoreboard.score ? item.Scoreboard.score.split(":")[0] : 0
            const awayTeamScore = item.Scoreboard && item.Scoreboard.score ? item.Scoreboard.score.split(":")[1] : 0
            const time = item.Scoreboard && item.Scoreboard.timer ? parseInt(item.Scoreboard.timer.seconds / 60) : ""
            const date = moment(item.Date).format('MM/DD HH:mm')
            const flagImg = flagsByRegionName[item.RegionName]
            setHeader({ homeTeam: item.HomeTeam, awayTeam: item.AwayTeam, time, homeTeamScore, awayTeamScore, leagueName: item.LeagueName, flagImg, date })

            setSportsData(response.data)
            handleChangeSlipData(response.data)
            const leagueData = response.data
            const results = []
            if (response.data.Markets) {
                const markets = response.data.Markets
                for (let i = 0; i < 45; i++) {
                    if (markets[i]) {
                        const obj = {
                            title: getTextByLanguage(markets[i].name.value)
                        }
                        obj.content = (
                            <Card className="border-0 row flex-row">
                                {markets[i].results.map((item, index) => {
                                    const event = item
                                    let team = ""
                                    if (markets[i].MarketType === "3way") {
                                        if (index === 0) team = "1"
                                        if (index === 1) team = "Draw"
                                        if (index === 2) team = "2"
                                    }

                                    if (markets[i].MarketType === "DoubleChance") {
                                        if (index === 0) team = "1"
                                        if (index === 1) team = "2"
                                        if (index === 2) team = "both"
                                    }

                                    if (markets[i].MarketType === "Over/Under") {
                                        if (index === 0) team = "Over"
                                        if (index === 1) team = "Under"
                                    }

                                    if (markets[i].MarketType === "Odd/Even") {
                                        if (index === 0) team = "Odd"
                                        if (index === 1) team = "Even"
                                    }

                                    if (markets[i].MarketType === "BTTS") {
                                        if (index === 0) team = "Yes"
                                        if (index === 1) team = "No"
                                    }
                                    if (markets[i].MarketType === "BTTSAndEitherTeamToWin") {
                                        if (index === 0) team = "Yes"
                                        if (index === 1) team = "No"
                                    }

                                    if (markets[i].MarketType === "BTTSAndOver/Under") {
                                        if (index === 0) team = "Over"
                                        if (index === 1) team = "Under"
                                    }
                                    return (
                                        <span key={index} id={event.id} className="event-box p-1 col m-1" onClick={(e) => { handleBetSlip(event, leagueData, markets[i], team) }}>
                                            {getTextByLanguage(event.name.value)}
                                            <a>
                                                {event[oddType]}
                                            </a>
                                        </span>
                                    )
                                })
                                }
                            </Card>
                        )
                        results.push(obj)
                    }
                }
            }
            setEventData(results)
            setIsLoading(false)
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
        const request = {
            eventId: id
        }
        const response = await Axios({
            endpoint: "/sports/get-event",
            method: "POST",
            params: request
        })
        if (response.status === 200 && response.data) {
            setSportsData(response.data)
            const item = response.data
            const homeTeamScore = item.Scoreboard && item.Scoreboard.score ? item.Scoreboard.score.split(":")[0] : ""
            const awayTeamScore = item.Scoreboard && item.Scoreboard.score ? item.Scoreboard.score.split(":")[1] : ""
            const time = item.Scoreboard && item.Scoreboard.timer ? parseInt(item.Scoreboard.timer.seconds / 60) : ""
            const flagImg = flagsByRegionName[item.RegionName] ? flagsByRegionName[item.RegionName] : item.RegionName
            const date = moment(item.Date).format('MM/DD HH:mm')
            setHeader({ homeTeam: item.HomeTeam, awayTeam: item.AwayTeam, date, time, homeTeamScore, awayTeamScore, leagueName: item.LeagueName, flagImg })

            setOddType(getOddType())
            const oddType = getOddType()
            const leagueData = response.data
            const results = []
            if (response.data.Markets) {
                const markets = response.data.Markets
                for (let i = 0; i < 45; i++) {
                    if (markets[i]) {
                        const obj = {
                            title: getTextByLanguage(markets[i].name.value)
                        }
                        obj.content = (
                            <Card className="border-0 row flex-row">
                                {markets[i].results.map((item, index) => {
                                    const event = item
                                    let team = ""
                                    if (markets[i].MarketType === "3way") {
                                        if (index === 0) team = "1"
                                        if (index === 1) team = "Draw"
                                        if (index === 2) team = "2"
                                    }

                                    if (markets[i].MarketType === "Over/Under") {
                                        if (index === 0) team = "1"
                                        if (index === 1) team = "2"
                                    }
                                    return (
                                        <span key={index} id={event.id} className="event-box p-1 col m-1" onClick={(e) => { handleBetSlip(event, leagueData, markets[i], team) }}>
                                            {event.name.value === "Asian Handicap" || event.name.value === "Handicap" ? (
                                                <React.Fragment>
                                                    {index === 1 ? (
                                                        <React.Fragment>
                                                            {getTextByLanguage(`${event.name.value} ${event && event.attr ? event.attr * 1 : ""}`)}
                                                            <a>
                                                                {event["odds"] < 100 ? event[oddType] : (<React.Fragment><Lock /></React.Fragment>)}
                                                            </a>
                                                        </React.Fragment>
                                                    ) : index === 2 ? (
                                                        <React.Fragment>
                                                            {getTextByLanguage(`${event.name.value} ${event && event.attr ? event.attr * -1 : ""}`)}
                                                            <a>
                                                                {event["odds"] < 100 ? event[oddType] : (<React.Fragment><Lock /></React.Fragment>)}
                                                            </a>
                                                        </React.Fragment>
                                                    ) : (
                                                        <React.Fragment>
                                                            {getTextByLanguage(`${event.name.value}`)}
                                                            <a>
                                                                {event["odds"] < 100 ? event[oddType] : (<React.Fragment><Lock /></React.Fragment>)}
                                                            </a>
                                                        </React.Fragment>
                                                    )}
                                                </React.Fragment>
                                            ) : (
                                                <React.Fragment>
                                                    {getTextByLanguage(event.name.value)}
                                                    <a>
                                                        {event["odds"] < 100 ? event[oddType] : (<React.Fragment><Lock /></React.Fragment>)}
                                                    </a>
                                                </React.Fragment>
                                            )}
                                        </span>
                                    )
                                })
                                }
                            </Card>
                        )
                        results.push(obj)
                    }
                }
            }
            setEventData(results)
            setIsLoading(false)
        } else {
            setIsLoading(true)
            toast.error(response.data)
        }
    }, [])

    return (
        <React.Fragment>
            <ReactInterval timeout={1000} enabled={true} callback={() => { handleTimer() }} />
            {isLoading ? (
                <Spinner></Spinner>
            ) : (
                <Card className="b-team__list px-0 col h-100 mr-5">
                    <CardHeader >
                        <div className="left d-flex align-items-center">
                            <h3 id="soccer-game" className="soccer mr-1">{getTextByLanguage(sportsData.RegionName)} {getTextByLanguage(sportsData.LeagueName)}</h3>
                            <span onClick={e => { handleRefresh() }} className="timer-number d-flex align-items-center">{timerNumber}</span>
                        </div>
                        <div className="right">
                            <a className="fav-link mr-2" href="/favorite" data-nsfw-filter-status="swf">{getTextByLanguage("Favourite Events")}</a>
                            <a style={{ color: "white", fontSize: "15px" }} href="/home" data-nsfw-filter-status="swf">{getTextByLanguage("Back to League")}</a>
                        </div>
                    </CardHeader>
                    <AppCollapse data={eventData} type='border' />
                </Card>
            )}
        </React.Fragment>
    )
}

export default EventChildren
