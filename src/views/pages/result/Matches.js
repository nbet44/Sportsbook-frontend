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


const MatchesCmp = () => {
    const { id } = useParams()
    const [tableData, setTableData] = useState([])
    const [isLoading, setIsLoading] = useState(true)
    const userData = useSelector((state) => state.auth.userData)
    const [getTextByLanguage] = useTranslator()

    useEffect(async () => {
        const request = {
            LeagueId: id,
            type: "pre"
        }
        const response = await Axios({
            endpoint: "/sports/get-all-matches",
            method: "POST",
            params: request
        })
        console.log(response)
        if (response.status === 200) {
            setTableData(response.data)
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
                                {getTextByLanguage(tableData[0] ? tableData[0].RegionName : "")}
                                &nbsp;-&nbsp;
                                {getTextByLanguage(tableData[0] ? tableData[0].LeagueName : "")}
                            </h2>
                        </div>
                    </CardHeader>
                    <CardBody className="b-team pt-0">
                        <div className="m-2">
                            <div className="row col-12 pb-1" style={{ borderBottom: "1px solid #82868b" }}>
                                <span className="col-2">Id</span>
                                <span className="col-5">Name</span>
                                <span className="col-1">Result</span>
                                <span className="col-3">Date</span>
                                <span className="col-1">Action</span>
                            </div>
                            {tableData.map((item, index) => {
                                return (
                                    <React.Fragment key={index}>
                                        <div className="row col-12 py-1" style={{ borderBottom: "1px solid #82868b" }}>
                                            <span className="col-2">{item.Id}</span>
                                            <span className="col-5"><a style={{ color: "white" }} href={`/admin/pre-result/match/${item.Id}`}>{item.HomeTeam} - {item.AwayTeam}</a></span>
                                            <span className="col-1">{item.result}</span>
                                            <span className="col-3">{moment(item.Date).format("YYYY-MM-DD hh:mm:ss")}</span>
                                            <span className="col-1">Cancel</span>
                                        </div>
                                    </React.Fragment>
                                )
                            })}
                        </div>
                    </CardBody>
                </Card>
            </div>
        </div>
    )
}

export default MatchesCmp
