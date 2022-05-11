import React from 'react'
import HeaderCmp from '../Header'
import BetSlipCmp from './betslip'
import EventChildren from './eventChildren'

const EventCmp = () => {
    return (
        <React.Fragment>
            <HeaderCmp />
            <div className="content-body row mx-0">
                <EventChildren />
                <BetSlipCmp />
            </div>
        </React.Fragment>
    )
}

export default EventCmp
