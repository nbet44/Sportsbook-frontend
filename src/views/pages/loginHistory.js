import React, { useEffect, useState } from 'react'
import { useSelector } from 'react-redux'
import {
    Card, CardHeader, CardBody, CardTitle, CardText, CardLink
} from 'reactstrap'
import Spinner from "@components/spinner/Fallback-spinner"
import HeaderCmp from '../Header'
import Axios from '../../utility/hooks/Axios'
import moment from 'moment'
import { useTranslator } from '@hooks/useTranslator'

const LoginHistoryCmp = () => {
    const [isLoading, setIsLoading] = useState(true)
    const userData = useSelector((state) => state.auth.userData)
    const [tableData, setTableData] = useState([])
    const [getTextByLanguage] = useTranslator()

    useEffect(async () => {
        const request = {
            userId: userData._id
        }
        const response = await Axios({
            endpoint: "/user/get-login",
            method: "POST",
            params: request
        })
        console.log(response)
        if (response.status === 200) {
            setTableData(response.data)
            setIsLoading(false)
        } else {
            setIsLoading(true)
            toast.error(response.data)
        }
    }, [])

    if (isLoading) {
        return (
            <Spinner></Spinner>
        )
    }

    return (
        <div>
            <HeaderCmp />
            <div className="content-body">
                <Card className="b-team__list">
                    <CardHeader >
                        <div className="left">
                            <h2 className="b-list m-auto">{getTextByLanguage("Login History")}</h2>
                        </div>
                    </CardHeader>
                    <div className="title bet-list-t">
                    </div>
                    <CardBody className="b-team pt-0">
                        <div className="table-wrapper">
                            <table className="table bet-list-tab text-center">
                                <thead>
                                    <tr>
                                        <th>{getTextByLanguage("Time")}</th>
                                        <th>{getTextByLanguage("Ip")}</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {
                                        tableData.map((item, index) => {
                                            return (
                                                <React.Fragment key={index}>
                                                    <tr>
                                                        <td>{moment(item.created).format('HH:mm MM/DD/YYYY')}</td>
                                                        <td>{item.ip}</td>
                                                    </tr>
                                                </React.Fragment>
                                            )
                                        })
                                    }
                                </tbody>
                            </table>
                        </div>
                    </CardBody>
                </Card>
            </div>
        </div>
    )
}

export default LoginHistoryCmp
