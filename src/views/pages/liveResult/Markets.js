import React, { useEffect, useState } from 'react'
import {
    Col, Modal, ModalBody, ModalFooter, ModalHeader, Button, FormGroup, Label,
    Input, Card, CardHeader, CardBody, CardTitle, CardText, Table
} from 'reactstrap'
import Select from 'react-select'
import { selectThemeColors } from '@utils'
import { ChevronDown, Delete, Edit, PlusCircle } from 'react-feather'
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
    const [selectedResult, setSelectedResult] = useState({})

    const handleSuspend = (item, subItem, index) => {
        if (tableData.Markets[index]) {
            const temp = selectedResult
            if (temp[subItem.id]) {
                temp[subItem.id].isSuspend = !temp[subItem.id].isSuspend
                setSelectedResult(temp)
            } else {
                temp[subItem.id] = {
                    leagueId: tableData.LeagueId,
                    matchId: tableData.Id,
                    marketId: item.id,
                    oddsId: subItem.id,
                    index,
                    odds: 0,
                    isSuspend: true,
                    isRemove: false,
                    isWin: false
                }
                setSelectedResult(temp)
            }
        }
    }

    const handleAdd = async () => {
        console.log("handleAdd")
    }

    const handleChangeOdd = async (item, subItem, value, index) => {
        if (tableData.Markets[index]) {
            const temp = selectedResult
            if (temp[subItem.id]) {
                temp[subItem.id].odds = value
                setSelectedResult(temp)
            } else {
                temp[subItem.id] = {
                    leagueId: tableData.LeagueId,
                    matchId: tableData.Id,
                    marketId: item.id,
                    oddsId: subItem.id,
                    index,
                    odds: value,
                    isSuspend: false,
                    isRemove: false,
                    isWin: false
                }
                setSelectedResult(temp)
            }
        }
    }

    const handleRemoveOdd = async (item, subItem, index) => {
        if (tableData.Markets[index]) {
            const temp = selectedResult
            if (temp[subItem.id]) {
                temp[subItem.id].isRemove = !temp[subItem.id].isRemove
                setSelectedResult(temp)
            } else {
                temp[subItem.id] = {
                    leagueId: tableData.LeagueId,
                    matchId: tableData.Id,
                    marketId: item.id,
                    oddsId: subItem.id,
                    index,
                    odds: 0,
                    isSuspend: false,
                    isRemove: true,
                    isWin: false
                }
                setSelectedResult(temp)
            }
        }
    }

    const handleWin = async (item, subItem, index) => {
        if (tableData.Markets[index]) {
            const temp = selectedResult
            if (temp[subItem.id]) {
                temp[subItem.id].isWin = !temp[subItem.id].isWin
                setSelectedResult(temp)
            } else {
                temp[subItem.id] = {
                    leagueId: tableData.LeagueId,
                    matchId: tableData.Id,
                    marketId: item.id,
                    oddsId: subItem.id,
                    index,
                    odds: 0,
                    isSuspend: false,
                    isRemove: false,
                    isWin: true
                }
                setSelectedResult(temp)
            }
        }
    }

    const handleSubmit = async () => {
        const tempTable = tableData
        for (const i in selectedResult) {
            if (tempTable.Markets[selectedResult[i].index]) {
                for (const j in tempTable.Markets[selectedResult[i].index].results) {
                    if (tempTable.Markets[selectedResult[i].index].results[j].id === selectedResult[i].oddsId) {
                        tempTable.Markets[selectedResult[i].index].results[j].odds = parseFloat(selectedResult[i].odds)
                        if (selectedResult[i].isSuspend) {
                            tempTable.Markets[selectedResult[i].index].results[j].isSuspend = true
                        }
                        console.log(selectedResult[i].isRemove)
                        if (selectedResult[i].isRemove) {
                            delete tempTable.Markets[selectedResult[i].index].results[j]
                        }
                    }
                }
            }
        }
        const request = {
            market: tempTable.Markets,
            selectedResult,
            matchId: id,
            result: ""
        }
        console.log(request)
        const response = await Axios({
            endpoint: "/sports/set-live-result",
            method: "POST",
            params: request
        })
        console.log(response)
        if (response.status === 200) {
            toast.success("success")
            window.location.href = `/admin/live-result/league/${tableData.LeagueId}`
            setIsLoading(false)
        } else {
            toast.error(getTextByLanguage(response.data))
            setIsLoading(true)
        }
    }

    useEffect(async () => {
        const request = {
            MatchId: id,
            type: "live"
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
                        {
                            tableData.Markets.length > 0 ? (
                                <React.Fragment>
                                    {tableData.Markets.map((item, index) => {
                                        return (
                                            <React.Fragment key={index}>
                                                <div className="m-1 mb-2">
                                                    <span style={{ fontSize: "20px", color: "white" }} className="mr-3">{item.name.value}</span>
                                                    <PlusCircle onClick={e => { handleAdd(item) }} style={{ cursor: "pointer" }} />
                                                    {/* <hr />
                                                    <hr /> */}
                                                    <Table responsive>
                                                        <thead className='thead-dark'>
                                                            <td>Name</td>
                                                            <td>Odd</td>
                                                            <td>Remove</td>
                                                            <td>Suspend</td>
                                                            <td>Win</td>
                                                        </thead>
                                                        <tbody>
                                                            {item.results.map((subItem, subIndex) => {
                                                                let isSuspend = false
                                                                let isRemove = false
                                                                let isWin = false
                                                                if (selectedResult[subItem.id]) {
                                                                    isRemove = selectedResult[subItem.id].isRemove
                                                                    isSuspend = selectedResult[subItem.id].isSuspend
                                                                    isWin = selectedResult[subItem.id].isWin
                                                                }
                                                                return (
                                                                    <React.Fragment key={subIndex}>
                                                                        <tr>
                                                                            <td>{subItem.name.value}</td>
                                                                            <td>
                                                                                <Input type="number" onChange={e => { handleChangeOdd(item, subItem, e.target.value, index) }} style={{ float: "left", maxWidth: "150px" }} defaultValue={subItem.odds} />
                                                                            </td>
                                                                            <td>
                                                                                <input onClick={e => { handleRemoveOdd(item, subItem, index) }} defaultChecked={isRemove} className="ml-1" type="checkbox" />
                                                                            </td>
                                                                            <td>
                                                                                <input onClick={e => { handleSuspend(item, subItem, index) }} className="ml-1" defaultChecked={isSuspend} type="checkbox" />
                                                                            </td>
                                                                            <td>
                                                                                <input onClick={e => { handleWin(item, subItem, index) }} className="ml-1" defaultChecked={isWin} type="checkbox" />
                                                                            </td>
                                                                        </tr>
                                                                        {/* <hr /> */}
                                                                    </React.Fragment>
                                                                )
                                                            })}
                                                        </tbody>
                                                    </Table>
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
