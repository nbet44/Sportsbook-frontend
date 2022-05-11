import React, { useEffect, useState } from 'react'
import {
    Col, Modal, ModalBody, ModalFooter, ModalHeader, Button, FormGroup, Label,
    Input, Card, CardHeader, CardBody, CardTitle, CardText, CardLink
} from 'reactstrap'
import Select from 'react-select'
import { selectThemeColors } from '@utils'
import { ChevronDown, Edit } from 'react-feather'
import DataTable from 'react-data-table-component'
import ReactPaginate from 'react-paginate'
import '@styles/react/libs/tables/react-dataTable-component.scss'
import CategoriesCmp from '../admin/Categories'
import { useSelector } from 'react-redux'
import Axios from '../../../utility/hooks/Axios'
import Spinner from "@components/spinner/Fallback-spinner"
import { toast } from 'react-toastify'
import moment from 'moment'
import { useTranslator } from '@hooks/useTranslator'
import { useParams } from 'react-router'

// const options1 = [
//   { value: 'all', label: 'All' },
//   { value: 'played', label: 'Played' },
//   { value: 'show_hidden', label: 'Show Hidden' }
// ]


const MarketCmp = () => {
    const { id } = useParams()
    const [tableData, setTableData] = useState([])
    const [historyData, setHistoryData] = useState([])
    const [isLoading, setIsLoading] = useState(true)
    const userData = useSelector((state) => state.auth.userData)
    const [getTextByLanguage] = useTranslator()
    const [matchResult, setMatchResult] = useState("")
    const [selectedResult, setSelectedResult] = useState({})

    const handleChangeResult = (e) => {
        setMatchResult(e.target.value)
    }

    const handleChangeCheck = (item, subItem) => {
        const temp = selectedResult
        if (temp[subItem.id]) {
            temp[subItem.id].isWin = !temp[subItem.id].isWin
            delete temp[subItem.id]
            setSelectedResult(temp)
        } else {
            temp[subItem.id] = {
                leagueId: tableData.LeagueId,
                matchId: tableData.Id,
                marketId: item.id,
                oddsId: subItem.id,
                isWin: true
            }
            setSelectedResult(temp)
        }
    }

    const handleSubmit = async () => {
        const request = {
            selectedResult,
            result: matchResult,
            matchId: id
        }
        const response = await Axios({
            endpoint: "/sports/set-result",
            method: "POST",
            params: request
        })
        console.log(response)
        if (response.status === 200) {
            toast.success("success")
            window.location.href = `/admin/pre-result/league/${tableData.LeagueId}`
            setIsLoading(false)
        } else {
            toast.error(getTextByLanguage(response.data))
            setIsLoading(true)
        }
    }

    useEffect(async () => {
        const request = {
            MatchId: id,
            type: "pre"
        }
        const response = await Axios({
            endpoint: "/sports/get-all-markets",
            method: "POST",
            params: request
        })
        console.log(response)
        if (response.status === 200) {
            setTableData(response.data.market)
            setSelectedResult(response.data.history)
            if (response.data.history[Object.keys(response.data.history)[0]]) {
                setMatchResult(response.data.history[Object.keys(response.data.history)[0]]["result"])
            }
            setIsLoading(false)
        } else {
            toast.error(getTextByLanguage(response.data))
            setIsLoading(true)
        }
    }, [])

    if (isLoading) {
        return <Spinner />
    }

    return (
        <div>
            <CategoriesCmp />
            <div className="content-body">
                <Card className="b-team__list">
                    <CardHeader >
                        <div className="left">
                            <h2 className="b-list m-auto px-5 py-1 transaction-title">
                                {getTextByLanguage(tableData.HomeTeam)}
                                &nbsp;-&nbsp;
                                {getTextByLanguage(tableData.AwayTeam)}
                            </h2>
                        </div>
                    </CardHeader>
                    <CardBody className="b-team pt-0">
                        <div className="m-1">
                            <h3>Result</h3>
                            <input type="text" value={matchResult} onChange={e => { handleChangeResult(e) }} />
                        </div>
                        {
                            tableData.Markets.length > 0 ? (
                                <React.Fragment>
                                    {tableData.Markets.map((item, index) => {
                                        return (
                                            <React.Fragment key={index}>
                                                <div className="m-1 mb-2">
                                                    <h3>{item.name.value}</h3>
                                                    <hr />
                                                    <h5 className="ml-1">Pick</h5>
                                                    <hr />
                                                    {item.results.map((subItem, subIndex) => {
                                                        let isWin = false
                                                        if (selectedResult[subItem.id]) {
                                                            isWin = selectedResult[subItem.id].isWin
                                                        }
                                                        return (
                                                            <React.Fragment key={subIndex}>
                                                                <div className="ml-1">
                                                                    <span>
                                                                        {subItem.name.value}
                                                                    </span>
                                                                    <span className="ml-3">
                                                                        <input defaultChecked={isWin} onChange={e => { handleChangeCheck(item, subItem) }} type="checkbox" />
                                                                    </span>
                                                                </div>
                                                                <hr />
                                                            </React.Fragment>
                                                        )
                                                    })}
                                                </div>
                                            </React.Fragment>
                                        )
                                    })}
                                </React.Fragment>
                            ) : ""
                        }
                        <div className="m-1">
                            <Button className="text-uppercase" style={{ borderRadius: "0px" }} onClick={e => { handleSubmit() }}>Submit</Button>
                        </div>
                    </CardBody>
                </Card>
            </div>
        </div>
    )
}

export default MarketCmp
