import React, { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import {
    TabContent, TabPane, Nav, NavItem, NavLink, Button,
    Card, CardHeader, CardBody, Input, CardFooter
} from 'reactstrap'
import Axios from '../../utility/hooks/Axios'
import HeaderCmp from '../Header'
import { toast } from 'react-toastify'
import Spinner from "@components/spinner/Fallback-spinner"
import { Star, X, CheckCircle } from 'react-feather'
import moment from 'moment'
import { flagsByRegionName } from '../../configs/mainConfig'
import $ from "jquery"
import { useDispatch, useSelector } from 'react-redux'
import { handleSession } from '@store/actions/auth'
import { changeBetSlipType, removeBetSlipData, removeAllBetSlipData, acceptBetSlipData, approvedBetSlipData } from '../../redux/actions/sports'
import { isObjEmpty, getOddType } from '@utils'
import { useTranslator } from '@hooks/useTranslator'

const BetSlipCmp = () => {
    const [active, setActive] = useState('1')
    const userData = useSelector((state) => state.auth.userData)
    const activeEvent = useSelector((state) => state.sports.betSlipData)
    const [betData, setBetData] = useState({})
    const [betId, setBetId] = useState(null)
    const slipType = useSelector(state => { return state.sports.betSlipType })
    const dispatch = useDispatch()
    const maxBetAmount = userData.maxBetLimit
    const minBetAmount = 100
    const [maxAmountError, setMaxAmountError] = useState("")
    const [minAmountError, setMinAmountError] = useState("")
    const [oddType, setOddType] = useState("odds")
    const [clientPlatform, setClientPlatform] = useState("desktop")
    const [mixTotalWinAmount, setMixTotalWinAmount] = useState(0)
    const mixTotalOdds = Object.values(activeEvent).reduce((item, { odds }) => parseFloat(item * odds).toFixed(2), 1)
    const [isAccept, setAccept] = useState(false)
    const [getTextByLanguage] = useTranslator()

    const toggle = (tab) => {
        if (betId) {
            toast.error("You can't change bet type because you placed bets")
            return false
        }
        if (tab === "2") {
            if (Object.keys(activeEvent).length > 1) {
                for (const i in activeEvent) {
                    for (const j in activeEvent) {
                        if (i !== j && activeEvent[i].eventId === activeEvent[j].eventId) {
                            toast.error("You can't make mix with same events")
                            return false
                        }
                    }
                }
            } else {
                toast.error("You can't make mix with one events")
                return false
            }
        }
        dispatch(changeBetSlipType(tab === "2" ? "mix" : "single"))
        if (active !== tab) {
            setActive(tab)
        }
    }

    const handleInputAmount = (e, data) => {
        const temp = betData
        console.log(oddType)
        if (active === "1") {
            temp[data.id].amount = e.target.value
            if (e.target.value > 0) {
                // temp[data.id].winAmount = parseFloat((parseInt(e.target.value) * temp[data.id].odds) - ((e.target.value))).toFixed(1)
                if (oddType === "americanOdds") {
                    temp[data.id].winAmount = parseFloat((parseInt(e.target.value) * temp[data.id].odds) / 100).toFixed(2)
                } else {
                    temp[data.id].winAmount = parseFloat((parseInt(e.target.value) * temp[data.id].odds)).toFixed(2)
                }
            } else {
                temp[data.id].winAmount = 0
            }
        } else {
            for (const i in temp) {
                temp[i].amount = e.target.value
            }
            setMixTotalWinAmount(parseInt(e.target.value * mixTotalOdds))
        }
        setBetData({ ...temp })
    }

    const handleRemoveAllSlip = () => {
        const checkValue = dispatch(removeAllBetSlipData(activeEvent))
        if (checkValue) {
            for (const i in activeEvent) {
                $(`#${activeEvent[i].id}`).removeClass("active")
            }
        }
        setBetId(null)
        setActive("1")
    }

    const handleRemoveSlip = (data) => {
        const checkValue = dispatch(removeBetSlipData(activeEvent, data.id))
        if (checkValue) {
            $(`#${data.id}`).removeClass("active")
        }
    }

    const handleAccept = async () => {
        const isCheck = await dispatch(acceptBetSlipData(activeEvent))
        if (isCheck) {
            setAccept(false)
        }
    }

    const handleBet = async () => {
        // let cnt = 0
        const ErrorID = []
        let totalAmount = 0
        const slipData = {}
        for (const i in betData) {
            if (!betData[i].betId) {
                if (betData[i].amount < minBetAmount) {
                    ErrorID.push(betData[i].id)
                    // setMinAmountError(ErrorID)
                    // if (cnt === 0) {
                    // toast.error("Invalid Amount")
                    //     cnt++
                    // }
                } else if (betData[i].amount > maxBetAmount) {
                    setMaxAmountError("error")
                    toast.error("Invalid Amount")
                } else {
                    if (active === "1") {
                        totalAmount += parseInt(betData[i].amount)
                    } else {
                        totalAmount = parseInt(betData[i].amount)
                    }
                    if (userData.balance < totalAmount) {
                        toast.error("Empty Balance")
                        return false
                    }
                    slipData[i] = betData[i]
                    slipData[i].oddsId = i
                    slipData[i].matchId = betData[i].eventId
                    slipData[i].winAmount = active === "1" ? betData[i].winAmount : mixTotalWinAmount
                    slipData[i].amount = betData[i].amount ? betData[i].amount : 0
                    slipData[i].sport = betData[i].SportName
                    slipData[i].desc = `${betData[i].HomeTeam} : ${betData[i].AwayTeam} - ${betData[i].LeagueName}`
                    slipData[i].created = Date.now()
                    slipData[i].type = slipType
                }
            }
        }
        setMinAmountError(ErrorID)
        // if (ErrorID.length === 0) {
        if (!isObjEmpty(slipData)) {
            const request = {
                ...slipData,
                // userId: userData.userId,
                _id: userData._id,
                agentId: userData.agentId,
                totalAmount,
                slipType
            }
            const response = await Axios({
                endpoint: "/sports/user-bet",
                method: "POST",
                params: request
            })
            console.log(response)
            if (response.status === 200 && response.data) {
                dispatch(handleSession(response.data.userData))
                dispatch(approvedBetSlipData(betData, response.data.result))
                setBetId(response.data.result[0].betId)
                toast.success("success")
                return true
            } else {
                toast.error("failed")
                return false
            }
        }
        setTimeout(() => {
            setMinAmountError([])
        }, 1000)
        // }
    }

    useEffect(() => {
        console.log("--- activeEvent ---")
        for (const i in activeEvent) {
            if (activeEvent[i].isOddChanged) {
                setAccept(true)
            }
        }
        if (Object.keys(activeEvent).length === 0) {
            setBetId(null)
        }
        setBetData(activeEvent)
        setMinAmountError([])
    }, [activeEvent])

    useEffect(() => {
        console.log("--- slipType ---")
        if (window.innerWidth < 1184) {
            setClientPlatform("mobile")
        } else {
            setClientPlatform("desktop")
        }
        setMinAmountError([])
        setOddType(getOddType())
    }, [slipType])

    return (
        <div className="my-divx" style={{ width: `${clientPlatform === "desktop" ? "25%" : "27%"}` }}>
            {
                isObjEmpty(activeEvent) ? "" : (
                    <Card>
                        <CardHeader className="py-1">
                            <h5>{getTextByLanguage("Bet Slip")}</h5>
                            <Button.Ripple className='btn-icon' color='danger' style={{ padding: "3px", borderRadius: "0px" }} onClick={e => { handleRemoveAllSlip() }}>
                                <X size={16} />
                            </Button.Ripple>
                        </CardHeader>
                        <Nav tabs className="mt-1 mb-0 mx-2 my-nav">
                            <NavItem className="bet-tabs px-1 my-tab">
                                <NavLink
                                    active={active === '1'}
                                    onClick={() => {
                                        toggle('1')
                                    }}
                                >
                                    {getTextByLanguage("Single")}
                                </NavLink>
                            </NavItem>
                            <NavItem className="bet-tabs m-0 px-1 my-tab">
                                <NavLink
                                    active={active === '2'}
                                    onClick={() => {
                                        toggle('2')
                                    }}
                                >
                                    {getTextByLanguage("Mix")}
                                </NavLink>
                            </NavItem>
                        </Nav>
                        <TabContent className='category-content' activeTab={active}>
                            <TabPane tabId='1'>
                                {Object.keys(betData).map((key, index) => {
                                    const slip = betData[key]
                                    let isCheck = false
                                    if (slip.betId) {
                                        isCheck = true
                                    } else {
                                        isCheck = false
                                    }
                                    return (
                                        <Card className="b-team__list my-list" key={index}>
                                            <div className="line1">
                                                {getTextByLanguage(slip.SportName)}
                                                <Button.Ripple className='btn-icon' color='danger' onClick={e => { handleRemoveSlip(slip) }} style={{ padding: "3px", borderRadius: "0px", display: "inline-block", float: "right" }}>
                                                    <X size={16} />
                                                </Button.Ripple>
                                            </div>
                                            <div className="line2">{getTextByLanguage(slip.LeagueName)}</div>
                                            <div className="line3">{getTextByLanguage(slip.HomeTeam)}<span className="rspan1">{getTextByLanguage(slip.HomeTeamScore)}</span></div>
                                            <div className="line4">vs</div>
                                            <div className="line5">{getTextByLanguage(slip.AwayTeam)}<span className="rspan2">{getTextByLanguage(slip.AwayTeamScore)}</span></div>
                                            <div className="line6">{slip.live ? "" : "Live"}</div>
                                            <div className="line8">{getTextByLanguage(slip.name)}@{slip.odds}</div>
                                            <div className="line0 mb-1" style={{ lineHeight: "3" }}>
                                                <span className="mr-1" style={{ float: "left" }} >₪</span>
                                                <Input disabled={isCheck} type="number" style={{ float: "right", maxWidth: "170px" }} value={slip.amount} onChange={e => { handleInputAmount(e, slip) }} />
                                            </div>
                                            <div className="line0">{getTextByLanguage("Win")}: {slip.winAmount ? slip.winAmount : 0}</div>
                                            {slip.betId ? <div className="line9">{getTextByLanguage("BetId")}<span className="rspan3">{slip.betId}</span></div> : (
                                                <React.Fragment>
                                                    <div className="line9">{getTextByLanguage("Min")}<span className={`rspan3 ${minAmountError.indexOf(slip.id) !== -1 ? "error" : ""}`}>₪{minBetAmount}</span></div>
                                                    <div className="line0">{getTextByLanguage("Max")}<span className={`rspan4 ${maxAmountError}`}>₪{maxBetAmount}</span></div>
                                                </React.Fragment>
                                            )}
                                            {slip.betId ? <div className="approved p-1 text-center mt-1" ><CheckCircle />{getTextByLanguage("Approved")}</div> : ""}
                                        </Card>
                                    )
                                })
                                }
                                {userData.role === "user" ? (
                                    <CardFooter className="d-flex flex-column justify-content-center">
                                        {isAccept ? <div className="approved p-1 text-center mb-1" onClick={e => { handleAccept() }}>{getTextByLanguage("Accept")}</div> : ""}
                                        <Button disabled={isAccept} className="place-bet-btn px-3" color="dark" onClick={e => { handleBet() }} >{getTextByLanguage("Place Bet")}</Button>
                                        {/* <Button disabled={isAccept || (betId)} className="place-bet-btn px-3" color="dark" onClick={e => { handleBet() }} >{getTextByLanguage("Place Bet")}</Button> */}
                                    </CardFooter>
                                ) : ""}
                            </TabPane>
                            <TabPane tabId='2'>
                                {Object.keys(activeEvent).map((key, index) => {
                                    const slip = activeEvent[key]
                                    return (
                                        <Card className="b-team__list my-list" key={index}>
                                            <div className="line1">
                                                {getTextByLanguage(slip.SportName)}
                                                <Button.Ripple className='btn-icon' color='danger' onClick={e => { handleRemoveSlip(slip) }} style={{ padding: "3px", borderRadius: "0px", display: "inline-block", float: "right" }}>
                                                    <X size={16} />
                                                </Button.Ripple>
                                            </div>
                                            <div className="line2">{getTextByLanguage(slip.LeagueName)}</div>
                                            <div className="line3">{getTextByLanguage(slip.HomeTeam)}<span className="rspan1">{getTextByLanguage(slip.HomeTeamScore)}</span></div>
                                            <div className="line4">vs</div>
                                            <div className="line5">{getTextByLanguage(slip.AwayTeam)}<span className="rspan2">{getTextByLanguage(slip.AwayTeamScore)}</span></div>
                                            <div className="line6">{slip.live ? "" : "Live"}</div>
                                            <div className="line8">{getTextByLanguage(slip.name)}@{slip.odds}</div>
                                            {/* {betId ? <div className="line9">{getTextByLanguage("BetId")}<span className="rspan3">{betId}</span></div> : ""} */}
                                        </Card>
                                    )
                                })
                                }
                                <Card className="b-team__list my-list mb-0">
                                    <div className="line9">{getTextByLanguage("Odds")}<span className="rspan3">@{mixTotalOdds}</span></div>
                                    <div className="line9">{getTextByLanguage("Min")}<span className="rspan3">₪{minBetAmount}</span></div>
                                    <div className="line0">{getTextByLanguage("Max")}<span className="rspan4">₪{maxBetAmount}</span></div>
                                    <div className="line0 mb-1">{getTextByLanguage("Win")} : {mixTotalWinAmount}</div>
                                    <div className="line0 mb-1" style={{ lineHeight: "3" }}>
                                        <Input type="number" onChange={e => { handleInputAmount(e) }} style={{ float: "left", maxWidth: "170px" }} />
                                    </div>
                                </Card>
                                {userData.role === "user" ? (
                                    <CardFooter className="d-flex flex-column justify-content-center">
                                        {betId ? <div className="line9 mb-1">{getTextByLanguage("BetId")}<span className="rspan3">{betId}</span></div> : ""}
                                        {betId ? <div className="approved p-1 text-center mb-1" ><CheckCircle />{getTextByLanguage("Approved")}</div> : ""}
                                        <Button disabled={isAccept} className="place-bet-btn px-3" color="dark" onClick={e => { handleBet() }} >{getTextByLanguage("Place Bet")}</Button>
                                    </CardFooter>
                                ) : ""}
                            </TabPane>
                        </TabContent>
                    </Card>
                )
            }
        </div>
    )
}

export default BetSlipCmp
