import React, { useEffect, useState } from 'react'
import {
    Card, CardBody, FormGroup, Label, Col, Input, CardHeader, ModalBody, ModalFooter, Button, CustomInput, Row
} from 'reactstrap'
import axios from 'axios'
import Uppy from '@uppy/core'
import thumbnailGenerator from '@uppy/thumbnail-generator'
import { Dashboard, DragDrop } from "@uppy/react"
import { selectThemeColors } from '@utils'
import Select, { components } from 'react-select'
import CategoriesCmp from "./Categories"
import { useHistory } from 'react-router'
import { toast } from 'react-toastify'
import makeAnimated from 'react-select/animated'
import CreatableSelect from 'react-select/creatable'
import AsyncSelect from 'react-select/async'
import Axios from '../../../utility/hooks/Axios'
import { useSelector } from 'react-redux'
import { useTranslator } from '@hooks/useTranslator'
import Spinner from "@components/spinner/Fallback-spinner"
import { mainConfig } from '../../../configs/mainConfig'

import 'uppy/dist/uppy.css'
import '@uppy/status-bar/dist/style.css'
import '@styles/react/libs/file-uploader/file-uploader.scss'
import { X, XCircle } from 'react-feather'

// import "@uppy/core/dist/style.css";
// import "@uppy/dashboard/dist/style.css";

const SiteSettingCmp = () => {
    const siteId = mainConfig.siteId
    const history = useHistory()
    const userData = useSelector((state) => state.auth.userData)
    const [getTextByLanguage] = useTranslator()
    const [isLoading, setIsLoading] = useState(true)
    const [sliderImg, setSliderImg] = useState([])
    const [previewArr, setPreviewArr] = useState([])
    const [NewsVal, setNewsVal] = useState("")

    const leagueSortOptions = [
        { value: 'RegionName', label: getTextByLanguage('A~Z') },
        { value: 'playCount', label: getTextByLanguage('Played Count') },
        { value: 'clickCount', label: getTextByLanguage('Clicked Count') }
    ]

    const [leagueSort, setLeagueSort] = useState(leagueSortOptions[0])

    const NewsChange = (e) => {
        setNewsVal(e.target.value)
    }

    const handleSubmit = async () => {
        const request = {
            siteId,
            leagueSort,
            userId: userData._id,
            created: Date.now(),
            news: NewsVal
        }
        const response = await Axios({
            endpoint: "/auth/site-setting",
            method: "POST",
            params: request
        })
        console.log(response)
        if (response.status === 200) {
            setIsLoading(false)
            toast.success(getTextByLanguage("success"))
        } else {
            setIsLoading(true)
            toast.error(getTextByLanguage(response.data))
        }
    }

    const sliderFileSave = async (file) => {
        const temp = JSON.parse(JSON.stringify(file))
        temp.data = {
            lastModified: file.data.lastModified,
            lastModifiedDate: file.data.lastModifiedDate,
            name: file.data.name,
            size: file.data.size,
            type: file.data.type,
            webkitRelativePath: file.data.webkitRelativePath
        }
        const request = {
            siteId,
            file: temp
        }
        const response = await Axios({
            endpoint: "/auth/save-site-slider-file",
            method: "POST",
            params: request
        })
    }

    const sliderImgSave = async (file) => {
        const formData = new FormData()
        formData.append(`file`, file.data)
        formData.append('siteId', siteId)
        formData.append("data", JSON.stringify(file))
        const response = await Axios({
            endpoint: "/auth/save-site-slider",
            method: "POST",
            params: formData
        })
    }

    const sliderFileRemove = async (file) => {
        const request = {
            siteId,
            file
        }
        const response = await Axios({
            endpoint: "/auth/remove-site-slider",
            method: "POST",
            params: request
        })
        console.log(response)
        return true
    }

    const uppy = new Uppy({
        meta: { type: 'avatar' },
        autoProceed: true
    })

    uppy.use(thumbnailGenerator)

    uppy.on('thumbnail:generated', (file, preview) => {
        const arr = previewArr
        arr.push(file)
        setPreviewArr([...arr])
        setSliderImg([...arr])
        sliderImgSave(file)
    })

    const handleRemove = async (file) => {
        const temp = sliderImg.filter(function (item) {
            return item.name !== file.name
        })
        setSliderImg([...temp])
        sliderFileRemove(file)
    }

    const renderPreview = () => {
        if (sliderImg.length) {
            return sliderImg.map((item, index) => {
                return (
                    <React.Fragment key={index}>
                        <div className="mr-1" style={{ position: "relative" }}>
                            <img className='rounded' src={item.preview} alt='avatar' />
                            <Button.Ripple className='btn-icon rounded-circle' outline color='secondary' style={{ padding: "2px", position: "absolute", right: "-10px", top: "-10px" }} >
                                <X size={18} onClick={e => { handleRemove(item) }} />
                            </Button.Ripple>
                        </div>
                    </React.Fragment>
                )
            })
        } else {
            return null
        }
    }

    // uppy.on("file-added", (file) => {
    //     const temp = sliderImg
    //     for (const i in temp) {
    //         if (file.name === temp[i].name) {
    //             return true
    //         }
    //     }
    //     temp.push(file)
    //     setSliderImg([...temp])
    //     sliderImgSave(file)
    //     sliderFileSave(file)
    // })

    // uppy.on("file-removed", (file) => {
    //     const temp = sliderImg.filter(function (item) {
    //         return item.name !== file.name
    //     })
    //     setSliderImg([...temp])
    //     sliderFileRemove(file)
    // })

    // useEffect(async () => {
    //     console.log(sliderImg)
    //     for (const i in sliderImg) {
    //         if (sliderImg[i]) {
    //             uppy.addFile(sliderImg[i])
    //         }
    //     }
    // }, [sliderImg])

    useEffect(async () => {
        const request = {
            siteId
        }
        const response = await Axios({
            endpoint: "/auth/get-site-setting",
            method: "POST",
            params: request
        })
        if (response.status === 200) {
            setIsLoading(false)
            setLeagueSort(response.data.leagueSort)
            setNewsVal(response.data.news)
            if (response.data.file && response.data.file.length > 0) {
                const sliderData = response.data.file
                for (const i in sliderData) {
                    sliderData[i].src = mainConfig.server.url + sliderData[i].src
                }
                setSliderImg(sliderData)
            }
        } else {
            setIsLoading(true)
            toast.error(getTextByLanguage(response.data))
        }
    }, [])

    return (
        <div>
            {/* {isLoading ? (
                <Spinner></Spinner>
            ) : ( */}
            <React.Fragment>
                <CategoriesCmp />
                <div className="content-body">
                    <Card>
                        <CardHeader className="py-0">
                            <h2 className="new-player">{getTextByLanguage("Site Setting")}</h2>
                        </CardHeader>
                        <CardBody>
                            {/* <FormGroup row>
                                <Label sm='6'>
                                    {getTextByLanguage("Password")}
                                </Label>
                                <Col sm='6'>
                                    <Input
                                        onChange={e => { setPassword(e.target.value) }}
                                        type='password'
                                        placeholder=''
                                        required
                                    />
                                </Col>
                            </FormGroup>
                            <FormGroup row>
                                <Label sm='6'>
                                    {getTextByLanguage("Confirm password")}
                                </Label>
                                <Col sm='6'>
                                    <Input
                                        onChange={e => { setConfirmPassword(e.target.value) }}
                                        type='password'
                                        placeholder=''
                                        required
                                    />
                                </Col>
                            </FormGroup> */}
                            <Row>
                                <Col sm="6">
                                    <FormGroup>
                                        <Label sm='6'>
                                            {getTextByLanguage("League Sort")}
                                        </Label>
                                        <Col sm='6'>
                                            <Select
                                                isClearable={false}
                                                theme={selectThemeColors}
                                                value={leagueSort}
                                                options={leagueSortOptions}
                                                className='react-select'
                                                classNamePrefix='select'
                                                onChange={e => { setLeagueSort(e) }}
                                            />
                                        </Col>
                                    </FormGroup>
                                </Col>
                                <Col sm="6">
                                    <FormGroup>
                                        <Label sm="6">
                                            {getTextByLanguage("News")}
                                        </Label>
                                        <Col sm="12">
                                            <div className="text">
                                                <textarea name="text" value={NewsVal} onChange={NewsChange} rows="3" placeholder="Textarea" className="form-control"></textarea>
                                            </div>
                                        </Col>
                                    </FormGroup>
                                </Col>
                            </Row>
                            <Row>
                                <Col sm="12">
                                    <DragDrop uppy={uppy} />
                                    <div className='mt-2 d-flex'>
                                        {renderPreview()}
                                    </div>
                                    {/* <Dashboard
                                        uppy={uppy}
                                        width={"100%"}
                                        height={350}
                                        proudlyDisplayPoweredByUppy={false}
                                        showProgressDetails={true}
                                    /> */}
                                </Col>
                            </Row>
                        </CardBody>
                        <ModalFooter className="m-auto">
                            <Button color='primary' className="save" onClick={e => { handleSubmit() }}>
                                {getTextByLanguage("Submit")}
                            </Button>
                        </ModalFooter>
                    </Card>
                </div>
            </React.Fragment >
            {/* )} */}
        </div >
    )
}

export default SiteSettingCmp
