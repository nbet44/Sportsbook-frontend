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

import { LeagueGames, SportTab, SportHeader } from "./baseSport"

const LiveChildren = () => {
    const [SportId, setSportId] = useState(4)
    const [sportsData, setSportsData] = useState(null)
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

    const [allLeague, setAllLeague] = useState({})
    const [active, setActive] = useState(0)
    const [isLoading, setIsLoading] = useState(false)
    const sportTab = [
        {
            name: "Football",
            sportsId: 4
        },
        {
            name: "Table Tennis",
            sportsId: 56
        },
        {
            name: "Basketball",
            sportsId: 7
        },
        {
            name: "Tennis",
            sportsId: 5
        },
        {
            name: "Ice Hockey",
            sportsId: 12
        },
        {
            name: "Volleyball",
            sportsId: 18
        }
    ]

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
        setIsLoading(true)
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
            setAllLeague(response.data)
            setIsLoading(false)
            setTimerNumber(30)
        } else {
            setIsLoading(false)
            toast.error(response.data)
        }
    }

    const selectSport = (tab, id) => {
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
            <Nav tabs className="m-0">
                {
                    sportTab.map((item, ind) => (
                        <SportTab item={item} selectSport={selectSport} index={ind} active={active} key={ind} />
                    ))
                }
            </Nav>

            <Card className="b-team__list" style={{ width: "70%" }}>
                <SportHeader data={sportTab[active]} timer={timerNumber} refresh={handleRefresh} isTime={isRefreshing} />
                <LeagueGames data={allLeague} />
            </Card>
        </React.Fragment>
    )

}

export default LiveChildren
