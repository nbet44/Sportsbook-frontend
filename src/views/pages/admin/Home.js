import React, { useState } from 'react'
import {
    Carousel,
    CarouselItem,
    CarouselControl,
    CarouselIndicators,
    Card, CardHeader, CardBody, CardTitle, CardText, CardLink
} from 'reactstrap'
import BetListCmp from './BetList'
import CategoriesCmp from "./Categories"

const Home = () => {
    return (
        <div>
            <BetListCmp />
        </div>
    )
}

export default Home
