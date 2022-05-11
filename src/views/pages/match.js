import React from 'react'
import HeaderCmp from '../Header'
import BetSlipCmp from './betslip'
import MatchChildren from './matchChildren'

const MatchCmp = () => {
    return (
        <React.Fragment>
            <HeaderCmp />
            <div className="content-body row mx-0">
                <MatchChildren />
                <BetSlipCmp />
            </div>
        </React.Fragment>
    )
}

export default MatchCmp