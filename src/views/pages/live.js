import React from 'react'
import HeaderCmp from '../Header'
import BetSlipCmp from './betslip'
import LiveChildren from './liveChildren'

const LiveCmp = () => {
    return (
        <React.Fragment>
            <HeaderCmp />
            <div className="content-body row mx-0">
                <LiveChildren />
                <BetSlipCmp />
            </div>
        </React.Fragment>
    )
}

export default LiveCmp
