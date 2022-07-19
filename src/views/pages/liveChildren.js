import React, { useEffect, useState } from 'react'
import { Col, Nav, NavItem, NavLink } from 'reactstrap'
import ReactInterval from 'react-interval'
import Axios from '../../utility/hooks/Axios'
import { toast } from 'react-toastify'
import $ from "jquery"
import { changeOdds } from '../../redux/actions/sports'
import { useDispatch, useSelector } from 'react-redux'
import { useTranslator } from '@hooks/useTranslator'
import { getOddType } from '@utils'
import Spinner from "@components/spinner/Fallback-spinner"
import { LiveBasketBall, LiveFootball, LiveHockey, LiveTableTennis, LiveTennis, LiveVolleyball } from './liveCmp'

const LiveChildren = () => {
    const [active, setActive] = useState(0)
    const [SportId, setSportId] = useState(4)
    const [isLoading, setIsLoading] = useState(true)
    const [isRefreshing, setRefreshing] = useState(false)
    const [eventData, setEventData] = useState([])
    const [leagueData, setLeagueData] = useState(null)
    const [timerNumber, setTimerNumber] = useState(30)
    const betSlipData = useSelector(state => { return state.sports.betSlipData })
    const dispatch = useDispatch()
    const [oddType, setOddType] = useState("odds")
    const [clientPlatform, setClientPlatform] = useState("desktop")
    const [getTextByLanguage] = useTranslator()

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
            $(`#${betSlipData[i].id}`).addClass("active")
        }
    }

    const handleRefresh = async () => {
        setRefreshing(true)
        const request = {
            SportId
        }
        const response = await Axios({
            endpoint: "/sports/get-live",
            method: "POST",
            params: request
        })
        if (response.status === 200) {
            handleOddChange(response.data)
            handleChangeSlipData(response.data.eventData)
            setRefreshing(false)
        } else {
            setRefreshing(true)
            setIsLoading(false)
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
        <>
            <ReactInterval timeout={1000} enabled={true} callback={e => { handleTimer() }} />
            {isLoading ? <Spinner color='white' size='lg' /> : (
                <Col className={`category-content ${clientPlatform === "desktop" ? "mr-5" : "mr-1"}`} style={{ width: "70%" }}>
                    <Nav tabs className="category-links m-0">
                        {
                            sportTab.map((item, idx) => (
                                <NavItem className="sport-tab" key={idx}>
                                    <NavLink
                                        active={active === idx}
                                        onClick={() => {
                                            toggle(idx, item.sportsId)
                                        }}
                                    >
                                        {getTextByLanguage(item.name)}
                                    </NavLink>
                                </NavItem>
                            ))
                        }
                    </Nav>
                    {
                        (() => {
                            switch (active) {
                                case 0:
                                    return <LiveFootball {...{ leagueData, eventData, handleRefresh, isRefreshing, timerNumber, oddType }} />
                                case 1:
                                    return <LiveTableTennis {...{ leagueData, eventData, handleRefresh, isRefreshing, timerNumber, oddType }} />
                                case 2:
                                    return <LiveBasketBall {...{ leagueData, eventData, handleRefresh, isRefreshing, timerNumber, oddType }} />
                                case 3:
                                    return <LiveTennis {...{ leagueData, eventData, handleRefresh, isRefreshing, timerNumber, oddType }} />
                                case 4:
                                    return <LiveHockey {...{ leagueData, eventData, handleRefresh, isRefreshing, timerNumber, oddType }} />
                                case 5:
                                    return <LiveVolleyball {...{ leagueData, eventData, handleRefresh, isRefreshing, timerNumber, oddType }} />
                                default:
                                    return null
                            }
                        })()
                    }
                </Col>
            )
            }
        </ >
    )
}

export default LiveChildren
