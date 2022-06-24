import React, { useState } from 'react'
import HeaderCmp from '../MatchHeader'
import BetSlipCmp from './betslip'
import EventChildren from './eventChildren'

const EventCmp = () => {
    const [header, setHeader] = useState({ date: "2022/07/07", time: 0, homeTeamScore: 0, awayTeamScore: 0, homeTeam: "", awayTeam: "", leagueName: "", flagImg: "" })

    return (
        <React.Fragment>
            <HeaderCmp header={header} />
            <div className="content-body row mx-0">
                <EventChildren setHeader={setHeader} />
                <BetSlipCmp />
            </div>
        </React.Fragment>
    )
}

export default EventCmp
