import React, { useEffect, useState } from 'react'
import { useTranslator } from '@hooks/useTranslator'
import { Card, CardBody, CardHeader, NavItem, NavLink } from 'reactstrap'
import { Lock, Star } from 'react-feather'
import { flagsByRegionName, mainMarketResultBySportId } from '../../configs/mainConfig'
import { addBetSlipData } from '../../redux/actions/sports'
import { useDispatch, useSelector } from 'react-redux'
import $ from "jquery"

const handleFavor = async (data, favorId) => {
    const request = data
    const response = await Axios({
        endpoint: "/sports/save-favorite",
        method: "POST",
        params: request
    })
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

export const LeagueGames = (props) => {
    const { data } = props
    return (
        <React.Fragment>
            {
                Object.keys(data).map((item, ind) => (
                    <League data={data[item]} key={ind} />
                ))
            }
        </React.Fragment>
    )
}

export const SportTab = (props) => {
    const {
        index,
        item,
        active,
        selectSport
    } = props

    const [getTextByLanguage] = useTranslator()

    return (
        <NavItem className="sport-tab">
            <NavLink active={active === index} onClick={() => selectSport(index, item.sportsId)}>
                {getTextByLanguage(item.name)}
            </NavLink>
        </NavItem>
    )
}

export const SportHeader = (props) => {
    const {
        data,
        timer,
        isTime,
        refresh
    } = props
    const [getTextByLanguage] = useTranslator()

    return (
        <CardHeader >
            <div className="left d-flex align-items-center">
                <h2 id={`sport-title-${data.sportsId}`} className="m-auto pl-3 p-1">{getTextByLanguage(data.name)}</h2>
                <span onClick={e => refresh()} className={`timer-number d-flex align-items-center ${isTime ? "refresh-loading" : ""}`}>{timer}</span>
            </div>
            <div className="right">
                <a className="fav-link mr-2" href="/favorite" data-nsfw-filter-status="swf">{getTextByLanguage("Favourite Events")}</a>
            </div>
        </CardHeader >
    )
}

export const League = (props) => {
    const { data } = props
    const [getTextByLanguage] = useTranslator()
    const [League, setLeague] = useState({ RegionName: "", LeagueName: "", flagImg: "" })

    useEffect(() => {
        const RegionName = data[0].RegionName
        const LeagueName = data[0].LeagueName
        if (flagsByRegionName[RegionName]) {
            setLeague({ ...League, RegionName, LeagueName, flagImg: flagsByRegionName[RegionName] })
        } else {
            setLeague({ ...League, RegionName, LeagueName, flagImg: RegionName })
        }
    }, [data])

    return (
        <>
            <div className="title">
                <div className="left">
                    <h3>
                        <img src={`https://getbet77.com/files/flags1/${League.flagImg}.png`} alt="" />
                        <span data-nsfw-filter-status="swf">{getTextByLanguage(League.RegionName)} {getTextByLanguage(League.LeagueName)}</span>
                    </h3>
                </div>
            </div>
            <div className="table-wrapper b-team pt-0 pb-0">
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
                            data.map((item, ind) => (
                                <Match data={item} key={ind} />
                            ))
                        }
                    </tbody>
                </table>
            </div>
        </>
    )
}

export const Match = (props) => {
    const { data } = props
    const [setting, setSetting] = useState({
        sHome: 0,
        sAway: 0,
        time: "--",
        yHome: 0,
        rHome: 0,
        yAway: 0,
        rAway: 0
    })
    const [bet, setBet] = useState({
        full: {
            lx2: { 0: {}, 1: {}, 2: {} },
            hdp: { 0: {}, 1: {}, 2: {} },
            ou: { 0: {}, 1: {} }
        },
        first: {
            lx2: { 0: {}, 1: {}, 2: {} },
            hdp: { 0: {}, 1: {}, 2: {} },
            ou: { 0: {}, 1: {} }
        }
    })

    const [full, setFull] = useState({
        lx2: { 0: {}, 1: {}, 2: {} },
        hdp: { 0: {}, 1: {}, 2: {} },
        ou: { 0: {}, 1: {} }
    })
    const [first, setFirst] = useState({
        lx2: { 0: {}, 1: {}, 2: {} },
        hdp: { 0: {}, 1: {}, 2: {} },
        ou: { 0: {}, 1: {} }
    })
    const handleBetSlip = () => { }
    const handleFavor = () => { }
    useEffect(() => {
        const sHome = data.Scoreboard && data.Scoreboard.score ? data.Scoreboard.score.split(":")[0] : "0"
        const sAway = data.Scoreboard && data.Scoreboard.score ? data.Scoreboard.score.split(":")[1] : "0"
        const time = data.Scoreboard && data.Scoreboard.timer ? parseInt(data.Scoreboard.timer.seconds / 60) : "--"
        const yHome = data.Scoreboard.yellowCards && data.Scoreboard.yellowCards.player1["255"] > 0 ? data.Scoreboard.yellowCards.player1["255"] : 0
        const rHome = data.Scoreboard.redCards && data.Scoreboard.redCards.player1["255"] > 0 ? data.Scoreboard.redCards.player1["255"] : 0
        const yAway = data.Scoreboard.yellowCards && data.Scoreboard.yellowCards.player2["255"] > 0 ? data.Scoreboard.yellowCards.player2["255"] : 0
        const rAway = data.Scoreboard.redCards && data.Scoreboard.redCards.player2["255"] > 0 ? data.Scoreboard.redCards.player2["255"] : 0
        setSetting({ sHome, sAway, time, yHome, rHome, yAway, rAway })

        let Full = {
            lx2: { 0: {}, 1: {}, 2: {} },
            hdp: { 0: {}, 1: {}, 2: {} },
            ou: { 0: {}, 1: {} }
        }
        let First = {
            lx2: { 0: {}, 1: {}, 2: {} },
            hdp: { 0: {}, 1: {}, 2: {} },
            ou: { 0: {}, 1: {} }
        }

        const market = data.market
        for (const i in market) {
            if (market[i].MarketType === "3way") {
                const results = market[i].results, obj = { 0: {}, 1: {}, 2: {} }
                for (const j in results) {
                    obj[j].odd = results[j].odds
                    obj[j].lock = (results[j].visibility !== "Visible" || Number(results[j].odds) > 100)
                    obj[j].change = 0
                }
                if (market[i].Period === "RegularTime" && market[i].isMain) {
                    Full = { ...Full, lx2: obj }
                } else if (market[i].Period === "FirstHalf") {
                    First = { ...First, lx2: obj }
                }
            }
            if (market[i].MarketType === "Handicap") {
                const results = market[i].results, obj = { 0: {}, 1: {}, 2: {} }
                for (const j in results) {
                    obj[j].odd = results[j].odds
                    obj[j].lock = results[j].visibility !== "Visible" || Number(results[j].odds) > 100
                    obj[j].attr = (j < 1) ? `${`+`}${Number(market[i].attr) * 1}` : Number(market[i].attr) * -1
                    obj[j].change = 0
                }
                if (market[i].Period === "RegularTime") {
                    Full = { ...Full, hdp: obj }
                } else if (market[i].Period === "FirstHalf") {
                    First = { ...First, hdp: obj }
                }
            }
            if (market[i].MarketType === "Over/Under") {
                const results = market[i].results, obj = { 0: {}, 1: {} }
                for (const j in results) {
                    obj[j].odd = results[j].odds
                    obj[j].lock = results[j].visibility !== "Visible" || Number(results[j].odds) > 100
                    obj[j].attr = (j < 1) ? `${`O`} ${market[i].attr}` : `${`U`} ${market[i].attr}`
                    obj[j].change = 0
                }
                if (market[i].Period === "RegularTime") {
                    Full = { ...Full, ou: obj }
                } else if (market[i].Period === "FirstHalf") {
                    First = { ...First, ou: obj }
                }
            }
        }
        setFull(Full)
        setFirst(First)
    }, [data])
    return (
        <>
            <tr>
                <td rowSpan="3" className="">
                    <div className="d-flex mb-1 justify-content-center" onClick={() => handleFavor()}><Star className="favor-icon" /></div>
                    <div className="d-flex justify-content-center">{setting.time}"</div>
                </td>
                <td className="match-event">
                    <span className='team-name'>{`${setting.sHome} - ${data.HomeTeam}`}</span>
                    {setting.yHome ? <span className="yellow-card"><sup>{setting.yHome}</sup></span> : null}
                    {setting.rHome ? <span className="red-card"><sup>{setting.rHome}</sup></span> : null}
                </td>

                <td className="odd" onClick={() => { handleBetSlip() }} >
                    {full.lx2[0].lock ? <Lock /> : full.lx2[0].odd}
                </td>
                <td className="odd" onClick={() => { handleBetSlip() }} >
                    {full.lx2[0].lock ? <Lock /> : (<>
                        <span className="left">{full.hdp[0].odd}</span>
                        <span className="right">{full.hdp[0].odd}</span>
                    </>)
                    }
                </td>
                <td className="odd" onClick={() => { handleBetSlip() }} >
                    {full.lx2[0].lock ? <Lock /> : (<>
                        <span className="left">{full.ou[0].attr}</span>
                        <span className="right">{full.ou[0].odd}</span>
                    </>)}
                </td>

                <td className="odd" onClick={() => { handleBetSlip() }} >
                    {first.lx2[0].lock ? <Lock /> : first.lx2[0].odd}
                </td>
                <td className="odd" onClick={() => { handleBetSlip() }} >
                    {first.lx2[0].lock ? <Lock /> : (<>
                        <span className="left">{first.hdp[0].odd}</span>
                        <span className="right">{first.hdp[0].odd}</span>
                    </>)
                    }
                </td>
                <td className="odd" onClick={() => { handleBetSlip() }} >
                    {first.lx2[0].lock ? <Lock /> : (<>
                        <span className="left">{first.ou[0].attr}</span>
                        <span className="right">{first.ou[0].odd}</span>
                    </>)}
                </td>

                <td className="more" rowSpan="3">{data.market && data.market.length < 45 ? data.market.length : '+45'}</td>
            </tr>

            <tr>
                <td className="match-event">
                    <span className='team-name'>{`${setting.sAway} - ${data.AwayTeam}`}</span>
                    {setting.yAway ? <span className="yellow-card"><sup>{setting.yAway}</sup></span> : null}
                    {setting.rAway ? <span className="red-card"><sup>{setting.rAway}</sup></span> : null}
                </td>

                <td className="odd" onClick={() => { handleBetSlip() }} >
                    {full.lx2[2].lock ? <Lock /> : full.lx2[2].odd}
                </td>
                <td className="odd" onClick={() => { handleBetSlip() }} >
                    {full.lx2[1].lock ? <Lock /> : (<>
                        <span className="left">{full.hdp[1].odd}</span>
                        <span className="right">{full.hdp[1].odd}</span>
                    </>)
                    }
                </td>
                <td className="odd" onClick={() => { handleBetSlip() }} >
                    {full.lx2[1].lock ? <Lock /> : (<>
                        <span className="left">{full.ou[1].attr}</span>
                        <span className="right">{full.ou[1].odd}</span>
                    </>)}
                </td>

                <td className="odd" onClick={() => { handleBetSlip() }} >
                    {first.lx2[1].lock ? <Lock /> : first.lx2[1].odd}
                </td>
                <td className="odd" onClick={() => { handleBetSlip() }} >
                    {first.lx2[1].lock ? <Lock /> : (<>
                        <span className="left">{first.hdp[1].odd}</span>
                        <span className="right">{first.hdp[1].odd}</span>
                    </>)
                    }
                </td>
                <td className="odd" onClick={() => { handleBetSlip() }} >
                    {first.lx2[1].lock ? <Lock /> : (<>
                        <span className="left">{first.ou[1].attr}</span>
                        <span className="right">{first.ou[1].odd}</span>
                    </>)}
                </td>
            </tr>

            <tr>
                <td className="match-draft">Draw</td>
                <td className={`match-odds match-draft`} onClick={() => { handleBetSlip() }} >
                    {full.lx2[1].lock ? <Lock /> : full.lx2[1].odd}
                </td>
                <td className={`match-odds match-draft`} ></td>
                <td className={`match-odds match-draft`} ></td>

                <td className={`match-odds match-draft`} onClick={() => { handleBetSlip() }} >
                    {first.lx2[1].lock ? <Lock /> : first.lx2[1].odd}
                </td>
                <td className={`match-odds match-draft`} ></td>
                <td className={`match-odds match-draft`} ></td>
            </tr>
        </>
    )
}