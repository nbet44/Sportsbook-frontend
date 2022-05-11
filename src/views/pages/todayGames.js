import React from 'react'
import HeaderCmp from '../Header'
import BetSlipCmp from './betslip'
import TodayGamesChildrenCmp from './todayGamesChildren'

const TodayGamesCmp = () => {
    return (
        <React.Fragment>
            <HeaderCmp />
            <div className="content-body row mx-0">
                <TodayGamesChildrenCmp />
                <BetSlipCmp />
            </div>
        </React.Fragment>
    )
}

export default TodayGamesCmp
