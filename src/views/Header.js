import React, { useEffect, useState } from 'react'
import {
    Carousel,
    CarouselItem,
    CarouselControl,
    CarouselIndicators,
    Card, CardHeader, CardBody, CardTitle, CardText, CardLink
} from 'reactstrap'
import { useTranslator } from '@hooks/useTranslator'
import { useSelector } from 'react-redux'
import Axios from '../utility/hooks/Axios'
import { mainConfig } from '../configs/mainConfig'

import sliderImage1 from '@src/assets/images/slider/01.jpg'
import sliderImage2 from '@src/assets/images/slider/02.jpg'
import sliderImage3 from '@src/assets/images/slider/03.jpg'

const HeaderCmp = () => {
    const siteId = mainConfig.siteId
    const image_prefix = mainConfig.server.url
    const [getTextByLanguage] = useTranslator()
    const [activeIndex, setActiveIndex] = useState(0)
    const [animating, setAnimating] = useState(0)
    const userData = useSelector((state) => state.auth.userData)
    const logoImage = require("@src/assets/images/logo/logo.svg").default

    const [images, setImages] = useState([
        {
            src: sliderImage1,
            id: 1
        },
        {
            src: sliderImage2,
            id: 2
        },
        {
            src: sliderImage3,
            id: 3
        }
    ])

    const onExiting = () => {
        setAnimating(true)
    }

    const onExited = () => {
        setAnimating(false)
    }

    const next = () => {
        if (animating) return
        const nextIndex = activeIndex === images.length - 1 ? 0 : activeIndex + 1
        setActiveIndex(nextIndex)
    }

    const previous = () => {
        if (animating) return
        const nextIndex = activeIndex === 0 ? images.length - 1 : activeIndex - 1
        setActiveIndex(nextIndex)
    }

    const goToIndex = newIndex => {
        if (animating) return
        setActiveIndex(newIndex)
    }

    const slides = images.map(item => {
        return (
            <CarouselItem onExiting={onExiting} onExited={onExited} key={item.id} className="h-100">
                <img src={item.src} style={{ maxHeight: "260px", width: "100%" }} className='img-fluid' alt={item.id} />
            </CarouselItem>
        )
    })

    useEffect(async () => {
        const request = {
            siteId
        }
        const response = await Axios({
            endpoint: "/auth/get-site-setting",
            method: "POST",
            params: request
        })
        const result = []
        if (response.status === 200) {
            if (response.data.sliderImages && response.data.sliderImages.length > 0) {
                const sliderImages = response.data.sliderImages
                for (const i in sliderImages) {
                    result.push({
                        src: `${image_prefix}${sliderImages[i].src}`,
                        id: i
                    })
                }
                setImages(result)
            }
            //     setIsLoading(false)
        }
        console.log(response)

    }, [])

    return (
        <div className="content-header row mx-0 mb-2">
            <Card className="b-video mb-0">
                <Carousel activeIndex={activeIndex} next={next} previous={previous} className="h-100">
                    <CarouselIndicators
                        items={images}
                        activeIndex={activeIndex}
                        onClickHandler={goToIndex}
                    />
                    {slides}
                    <CarouselControl
                        direction='prev'
                        directionText='Previous'
                        onClickHandler={previous}
                    />
                    <CarouselControl
                        direction='next'
                        directionText='Next'
                        onClickHandler={next}
                    />
                </Carousel>
            </Card>
            <Card className="b-menu mb-0">
                <CardHeader className="p-1 d-block">
                    <a href="/" data-nsfw-filter-status="swf">
                        <img src={logoImage} className="img-fluid" alt="" data-nsfw-filter-status="sfw" style={{ maxWidth: "60%" }} />
                    </a>
                </CardHeader>
                <CardBody className="p-0">
                    <ul className="p-0 m-0" style={{ listStyle: "none" }}>
                        <li><a href="/home" className="" data-nsfw-filter-status="swf">{getTextByLanguage("Home")}</a></li>
                        <li><a href="/live" data-nsfw-filter-status="swf">{getTextByLanguage("Live")}</a></li>
                        <li><a href="/casino" data-nsfw-filter-status="swf">{getTextByLanguage("Casino")}</a></li>
                        {
                            userData.role !== "user" ? (
                                <>
                                    {
                                        userData.role === "reporter" ? (
                                            <li><a href="/admin/pre-result" data-nsfw-filter-status="swf">{getTextByLanguage("Admin")}</a></li>
                                        ) : (
                                            <li><a href="/admin/bet-list" data-nsfw-filter-status="swf">{getTextByLanguage("Admin")}</a></li>
                                        )
                                    }
                                </>
                            ) : (
                                <li><a href="/betlist" data-nsfw-filter-status="swf">{getTextByLanguage("Bet List")}</a></li>
                            )
                        }
                    </ul>
                </CardBody>
            </Card>
        </div>
    )
}

export default HeaderCmp


/*
                <CardHeader className="p-1">
                    <a href="/" data-nsfw-filter-status="swf">
                        <img src={logoImage} className="img-fluid" alt="" data-nsfw-filter-status="sfw" style={{ maxWidth: "70%" }} />
                    </a>
                </CardHeader>

*/