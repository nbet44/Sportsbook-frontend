import React, { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import AppCollapse from '@components/app-collapse'
import $ from "jquery"
import { getOddType } from '@utils'
import { addBetSlipData } from '../../redux/actions/sports'
import { useTranslator } from '@hooks/useTranslator'
import { Card } from 'reactstrap'
import { Lock } from 'react-feather'
import { useParams } from 'react-router-dom'

export const EventFootball = (props) => {
    const { id } = useParams()
    const { data } = props
    const dispatch = useDispatch()
    const { slipType, betSlipData } = useSelector(state => { return state.sports })
    const [getTextByLanguage] = useTranslator()
    const [eventData, setEventData] = useState([])
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

    useEffect(() => {
        setOddType(getOddType())
        const oddType = getOddType()
        const leagueData = data
        const results = []
        if (data.Markets) {
            const markets = data.Markets
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

                                if (markets[i].MarketType === "CorrectScore") {
                                    team = event.name.value
                                }
                                const actived = Object.keys(betSlipData)
                                return (
                                    <span key={index} id={event.id} className={actived.indexOf(String(event.id)) === -1 ? "event-box p-1 col m-1" : "event-box p-1 col m-1 active"} onClick={(e) => { handleBetSlip(event, leagueData, markets[i], team) }}>
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
    }, [data])

    return (
        <AppCollapse data={eventData} type='border' />
    )
}

export const EventTableTennis = (props) => {
    const { id } = useParams()
    const { data } = props
    const dispatch = useDispatch()
    const { slipType, betSlipData } = useSelector(state => { return state.sports })
    const [eventData, setEventData] = useState([])
    const [getTextByLanguage] = useTranslator()
    const [oddType, setOddType] = useState("odds")

    const handleBetSlip = (data, event, market, team, period) => {
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
                    period,
                    marketType: market.name.value,
                    team
                }
                console.log(result)
                const checkValue = dispatch(addBetSlipData(betSlipData, result, slipType))
                if (checkValue) {
                    $(`#${data.id}`).addClass("active")
                } else {
                    $(`#${data.id}`).removeClass("active")
                }
            }
        }
    }

    useEffect(() => {
        setOddType(getOddType())
        const oddType = getOddType()
        const leagueData = data
        const results = []
        if (data.Markets) {
            const markets = data.Markets
            for (let i = 0; i < 45; i++) {
                if (markets[i]) {
                    const obj = {
                        title: getTextByLanguage(markets[i].name.value)
                    }
                    obj.content = (
                        <Card className="border-0 row flex-row">
                            {markets[i].results.map((item, index) => {
                                const event = item
                                let team = "", period = ""

                                if (markets[i].name.value === "2Way - Who will win?") {
                                    if (index === 0) team = "1"
                                    if (index === 1) team = "2"
                                    period = 'RegularTime'
                                } else if (markets[i].name.value === "Set Bet") {
                                    team = event.name.value
                                    period = 'RegularTime'
                                } else if (markets[i].name.value === "Total Points Handicap") {
                                    if (index === 0) team = "1"
                                    if (index === 1) team = "2"
                                    period = 'RegularTime'
                                } else if (markets[i].name.value === "Who will win second set?") {
                                    if (index === 0) team = "1"
                                    if (index === 1) team = "2"
                                    period = '2'
                                } else if (markets[i].name.value.startsWith("How many points will player/team 1 score in the")) {
                                    team = event.name.value
                                    let round = markets[i].name.value.split('How many points will player/team 1 score in the ')[1]
                                    if (round === 'match?') {
                                        period = 'RegularTime'
                                    } else {
                                        round = round.slice(0, 2)
                                        if (Number(round)) {
                                            period = String(Number(round))
                                        } else {
                                            period = round.slice(0, 1)
                                        }
                                    }
                                } else if (markets[i].name.value.startsWith("How many points will player/team 2 score in the")) {
                                    team = event.name.value
                                    let round = markets[i].name.value.split('How many points will player/team 2 score in the ')[1]
                                    if (round === 'match?') {
                                        period = 'RegularTime'
                                    } else {
                                        round = round.slice(0, 2)
                                        if (Number(round)) {
                                            period = String(Number(round))
                                        } else {
                                            period = round.slice(0, 1)
                                        }
                                    }
                                } else if (markets[i].name.value.startsWith('Which Team/Player will score the ') && markets[i].name.value.search('point in the')) {
                                    if (index === 0) team = "1"
                                    if (index === 1) team = "2"

                                    let round = markets[i].name.value.slice(-9).split(' Set?')[0].trim()
                                    if (round.length > 3) {
                                        round = round.slice(0, 2)
                                    } else {
                                        round = round.slice(0, 1)
                                    }
                                    period = round
                                } else if (markets[i].name.value.startsWith('First team/player to reach ') && markets[i].name.value.search('points')) {
                                    if (index === 0) team = "1"
                                    if (index === 1) team = "2"

                                    const round = markets[i].name.value.split('(')[1].slice(0, 2)
                                    if (Number(round)) {
                                        period = String(Number(round))
                                    } else {
                                        period = round.slice(0, 1)
                                    }
                                } else if (markets[i].name.value.startsWith('Correct Score')) {
                                    team = event.name.value

                                    const round = markets[i].name.value.slice(-3)
                                    period = String(Number(round.slice(0, 2)))
                                } else if (markets[i].name.value.startsWith("How many points will be scored in the")) {
                                    team = event.name.value

                                    let round = markets[i].name.value.split('How many points will be scored in the ')[1]
                                    if (round === 'match?') {
                                        period = 'RegularTime'
                                    } else {
                                        round = round.slice(0, 2)
                                        if (Number(round)) {
                                            period = String(Number(round))
                                        } else {
                                            period = round.slice(0, 1)
                                        }
                                    }
                                } else if (markets[i].name.value.startsWith("Number of points scored in")) {
                                    team = event.name.value
                                    let round = markets[i].name.value.split('Number of points scored in ')[1]
                                    if (round === 'match?') {
                                        period = 'RegularTime'
                                    } else {
                                        round = round.slice(0, 2)
                                        if (Number(round)) {
                                            period = String(Number(round))
                                        } else {
                                            period = round.slice(0, 1)
                                        }
                                    }
                                } else if (markets[i].name.value.startsWith('Winning Margin Set ')) {
                                    team = event.name.value

                                    const round = markets[i].name.value.slice(-2)
                                    if (Number(round)) {
                                        period = String(Number(round))
                                    } else {
                                        period = round.slice(0, 1)
                                    }
                                } else if ((markets[i].name.value.startsWith('Set') && markets[i].name.value.search('Winner') >= 6)) {
                                    if (index === 0) team = "1"
                                    if (index === 1) team = "2"

                                    const round = markets[i].name.value.slice(4, 6)
                                    period = String(Number(round))
                                } else if (markets[i].name.value.startsWith('Which team/player will be the first to reach ')) {
                                    if (index === 0) team = "1"
                                    if (index === 1) team = "2"

                                    const round = markets[i].name.value.split('(')[1].slice(0, 2)
                                    if (Number(round)) {
                                        period = String(Number(round))
                                    } else {
                                        period = round.slice(0, 1)
                                    }
                                } else if (markets[i].name.value.startsWith('Who will be the first team/player to reach ')) {
                                    if (index === 0) team = "1"
                                    if (index === 1) team = "2"

                                    const round = markets[i].name.value.split('(')[1].slice(0, 2)
                                    if (Number(round)) {
                                        period = String(Number(round))
                                    } else {
                                        period = round.slice(0, 1)
                                    }
                                } else if (markets[i].name.value.indexOf('set handicap')) {
                                    if (index === 0) team = "1"
                                    if (index === 1) team = "2"

                                    const round = markets[i].name.value.slice(0, 2)
                                    if (Number(round)) {
                                        period = String(Number(round))
                                    } else {
                                        period = round.slice(0, 1)
                                    }
                                }
                                const actived = Object.keys(betSlipData)
                                return (
                                    <span className={actived.indexOf(String(event.id)) === -1 ? "event-box p-1 col m-1" : "event-box p-1 col m-1 active"} key={index} id={event.id} onClick={(e) => { handleBetSlip(event, leagueData, markets[i], team, period) }}>
                                        {getTextByLanguage(event.name.value)}
                                        <a>
                                            {event["odds"] < 100 ? event[oddType] : <Lock />}
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
    }, [data])

    return <AppCollapse data={eventData} type='border' />
}

export const EventBasketball = (props) => {
    const { id } = useParams()
    const { data } = props
    const dispatch = useDispatch()
    const { slipType, betSlipData } = useSelector(state => { return state.sports })
    const [eventData, setEventData] = useState([])
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
                    marketType: market.name.value,
                    team
                }
                console.log(result)
                const checkValue = dispatch(addBetSlipData(betSlipData, result, slipType))
                if (checkValue) {
                    $(`#${data.id}`).addClass("active")
                } else {
                    $(`#${data.id}`).removeClass("active")
                }
            }
        }
    }

    useEffect(() => {
        setOddType(getOddType())
        const oddType = getOddType()
        const leagueData = data
        const results = []
        if (data.Markets) {
            const markets = data.Markets
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
                                if (markets[i].name.value === "Winning Margin" ||
                                    markets[i].name.value === "1st Half Totals" ||
                                    markets[i].name.value === "2nd Half Totals" ||
                                    markets[i].name.value === "Totals" ||
                                    markets[i].name.value.startsWith("How many points will ")
                                ) {
                                    team = markets[i].name.value
                                }

                                if (markets[i].name.value === "Will the 2nd half total be odd or even?") {
                                    if (index === 0) team = "Odd"
                                    if (index === 1) team = "Even"
                                }

                                if (markets[i].name.value === "2nd Half Money Line") {
                                    if (index === 0) team = "1"
                                    if (index === 1) team = "2"
                                }

                                return (
                                    <span className="event-box p-1 col m-1" key={index} id={event.id} onClick={(e) => { handleBetSlip(event, leagueData, markets[i], team) }}>
                                        {getTextByLanguage(event.name.value)}
                                        <a>
                                            {event["odds"] < 100 ? event[oddType] : <Lock />}
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
    }, [data])

    return <AppCollapse data={eventData} type='border' />
}
export const EventTennis = (props) => {
    const { id } = useParams()
    const { data } = props
    const dispatch = useDispatch()
    const { slipType, betSlipData } = useSelector(state => { return state.sports })
    const [eventData, setEventData] = useState([])
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
                    marketType: market.name.value,
                    team
                }
                console.log(result)
                const checkValue = dispatch(addBetSlipData(betSlipData, result, slipType))
                if (checkValue) {
                    $(`#${data.id}`).addClass("active")
                } else {
                    $(`#${data.id}`).removeClass("active")
                }
            }
        }
    }

    useEffect(() => {
        setOddType(getOddType())
        const oddType = getOddType()
        const leagueData = data
        const results = []
        if (data.Markets) {
            const markets = data.Markets
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
                                if (markets[i].name.value === "Winning Margin" ||
                                    markets[i].name.value === "1st Half Totals" ||
                                    markets[i].name.value === "2nd Half Totals" ||
                                    markets[i].name.value === "Totals" ||
                                    markets[i].name.value.startsWith("How many points will ")
                                ) {
                                    team = markets[i].name.value
                                }

                                if (markets[i].name.value === "Will the 2nd half total be odd or even?") {
                                    if (index === 0) team = "Odd"
                                    if (index === 1) team = "Even"
                                }

                                if (markets[i].name.value === "2nd Half Money Line") {
                                    if (index === 0) team = "1"
                                    if (index === 1) team = "2"
                                }

                                return (
                                    <span className="event-box p-1 col m-1" key={index} id={event.id} onClick={(e) => { handleBetSlip(event, leagueData, markets[i], team) }}>
                                        {getTextByLanguage(event.name.value)}
                                        <a>
                                            {event["odds"] < 100 ? event[oddType] : <Lock />}
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
    }, [data])

    return <AppCollapse data={eventData} type='border' />
}
export const EventIceHokey = (props) => {
    const { id } = useParams()
    const { data } = props
    const dispatch = useDispatch()
    const { slipType, betSlipData } = useSelector(state => { return state.sports })
    const [eventData, setEventData] = useState([])
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
                    marketType: market.name.value,
                    team
                }
                console.log(result)
                const checkValue = dispatch(addBetSlipData(betSlipData, result, slipType))
                if (checkValue) {
                    $(`#${data.id}`).addClass("active")
                } else {
                    $(`#${data.id}`).removeClass("active")
                }
            }
        }
    }

    useEffect(() => {
        setOddType(getOddType())
        const oddType = getOddType()
        const leagueData = data
        const results = []
        if (data.Markets) {
            const markets = data.Markets
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
                                if (markets[i].name.value === "Winning Margin" ||
                                    markets[i].name.value === "1st Half Totals" ||
                                    markets[i].name.value === "2nd Half Totals" ||
                                    markets[i].name.value === "Totals" ||
                                    markets[i].name.value.startsWith("How many points will ")
                                ) {
                                    team = markets[i].name.value
                                }

                                if (markets[i].name.value === "Will the 2nd half total be odd or even?") {
                                    if (index === 0) team = "Odd"
                                    if (index === 1) team = "Even"
                                }

                                if (markets[i].name.value === "2nd Half Money Line") {
                                    if (index === 0) team = "1"
                                    if (index === 1) team = "2"
                                }

                                return (
                                    <span className="event-box p-1 col m-1" key={index} id={event.id} onClick={(e) => { handleBetSlip(event, leagueData, markets[i], team) }}>
                                        {getTextByLanguage(event.name.value)}
                                        <a>
                                            {event["odds"] < 100 ? event[oddType] : <Lock />}
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
    }, [data])

    return <AppCollapse data={eventData} type='border' />
}
export const EventVolleyball = (props) => {
    const { id } = useParams()
    const { data } = props
    const dispatch = useDispatch()
    const { slipType, betSlipData } = useSelector(state => { return state.sports })
    const [eventData, setEventData] = useState([])
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
                    marketType: market.name.value,
                    team
                }
                console.log(result)
                const checkValue = dispatch(addBetSlipData(betSlipData, result, slipType))
                if (checkValue) {
                    $(`#${data.id}`).addClass("active")
                } else {
                    $(`#${data.id}`).removeClass("active")
                }
            }
        }
    }

    useEffect(() => {
        setOddType(getOddType())
        const oddType = getOddType()
        const leagueData = data
        const results = []
        if (data.Markets) {
            const markets = data.Markets
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
                                if (markets[i].name.value === "Winning Margin" ||
                                    markets[i].name.value === "1st Half Totals" ||
                                    markets[i].name.value === "2nd Half Totals" ||
                                    markets[i].name.value === "Totals" ||
                                    markets[i].name.value.startsWith("How many points will ")
                                ) {
                                    team = markets[i].name.value
                                }

                                if (markets[i].name.value === "Will the 2nd half total be odd or even?") {
                                    if (index === 0) team = "Odd"
                                    if (index === 1) team = "Even"
                                }

                                if (markets[i].name.value === "2nd Half Money Line") {
                                    if (index === 0) team = "1"
                                    if (index === 1) team = "2"
                                }

                                return (
                                    <span className="event-box p-1 col m-1" key={index} id={event.id} onClick={(e) => { handleBetSlip(event, leagueData, markets[i], team) }}>
                                        {getTextByLanguage(event.name.value)}
                                        <a>
                                            {event["odds"] < 100 ? event[oddType] : <Lock />}
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
    }, [data])

    return <AppCollapse data={eventData} type='border' />
}