import React, { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useParams } from 'react-router-dom'
import { toast } from 'react-toastify'
import moment from 'moment'
import { Card, CardHeader } from 'reactstrap'
import Axios from '../../utility/hooks/Axios'
import Spinner from "@components/spinner/Fallback-spinner"
import { changeOdds } from '../../redux/actions/sports'
import ReactInterval from 'react-interval'
import { useTranslator } from '@hooks/useTranslator'
import { getOddType } from '@utils'
import { flagsByRegionName } from '../../configs/mainConfig'
import { EventBasketball, EventFootball, EventIceHokey, EventTableTennis, EventTennis, EventVolleyball } from './eventCmp'

const EventChildren = ({ setHeader }) => {
    const { id } = useParams()
    const [sportsData, setSportsData] = useState({})
    const [isLoading, setIsLoading] = useState(true)
    const [timerNumber, setTimerNumber] = useState(30)
    const dispatch = useDispatch()
    const betSlipData = useSelector(state => { return state.sports.betSlipData })
    const [getTextByLanguage] = useTranslator()
    const [oddType, setOddType] = useState("odds")


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
            const homeTeamScore = item.Scoreboard && item.Scoreboard.score ? item.Scoreboard.score.split(":")[0] : ""
            const awayTeamScore = item.Scoreboard && item.Scoreboard.score ? item.Scoreboard.score.split(":")[1] : ""
            const time = item.Scoreboard && item.Scoreboard.timer ? parseInt(item.Scoreboard.timer.seconds / 60) : ""
            const flagImg = flagsByRegionName[item.RegionName] ? flagsByRegionName[item.RegionName] : item.RegionName
            const date = moment(item.Date).format('MM/DD HH:mm')
            setHeader({ homeTeam: item.HomeTeam, awayTeam: item.AwayTeam, date, time, homeTeamScore, awayTeamScore, leagueName: item.LeagueName, flagImg })
            setSportsData(response.data)
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
            setIsLoading(false)
            setOddType(getOddType())
        } else {
            setIsLoading(true)
            toast.error(response.data)
        }
    }, [])

    return (
        <>
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
                    {
                        (() => {
                            switch (String(sportsData.SportId)) {
                                case '4':
                                    return <EventFootball data={sportsData} />
                                case '56':
                                    return <EventTableTennis data={sportsData} />
                                case '7':
                                    return <EventBasketball data={sportsData} />
                                case '5':
                                    return <EventTennis data={sportsData} />
                                case '12':
                                    return <EventIceHokey data={sportsData} />
                                case '18':
                                    return <EventVolleyball data={sportsData} />
                            }
                        })()
                    }
                </Card>
            )}
        </>
    )
}

export default EventChildren
