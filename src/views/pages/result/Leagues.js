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


const LeagueCmp = () => {
    const { id } = useParams()
    const [tableData, setTableData] = useState([])
    const [isLoading, setIsLoading] = useState(true)
    const userData = useSelector((state) => state.auth.userData)
    const [getTextByLanguage] = useTranslator()

    useEffect(async () => {
        const request = {
            SportId: id,
            type: "pre"
        }
        const response = await Axios({
            endpoint: "/sports/get-all-league",
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
        return (
            <Spinner></Spinner>
        )
    }

    return (
        <div>
            <CategoriesCmp />
            <div className="content-body">
                <Card className="b-team__list">
                    <CardHeader >
                        <div className="left">
                            <h2 className="b-list m-auto px-5 py-1 transaction-title">{getTextByLanguage(tableData[0] ? tableData[0].SportName : "")}</h2>
                        </div>
                    </CardHeader>
                    <CardBody className="b-team pt-0">
                        <div className="m-2">
                            <div className="row col-12 pb-1" style={{ borderBottom: "1px solid #82868b" }}>
                                <span className="col-3">Id</span>
                                <span className="col-9">Name</span>
                            </div>
                            {tableData.map((item, index) => {
                                return (
                                    <React.Fragment key={index}>
                                        <div className="row col-12 py-1" style={{ borderBottom: "1px solid #82868b" }}>
                                            <span className="col-3">{item.LeagueId}</span>
                                            <span className="col-9"><a style={{ color: "white" }} href={`/admin/pre-result/league/${item.LeagueId}`}>{item.RegionName} - {item.LeagueName}</a></span>
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

export default LeagueCmp
