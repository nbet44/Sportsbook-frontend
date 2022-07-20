import React from 'react'
import {
    Card, CardBody, Col, Row
} from 'reactstrap'
import { useTranslator } from '@hooks/useTranslator'
import teamImg from "../assets/images/team.png"

const HeaderCmp = ({ header }) => {
    const [getTextByLanguage] = useTranslator()
    console.log(header)
    return (
        <Card className="match-header">
            <CardBody className="match-header-b pl-5 pr-5">
                <Card className="h-leaguename">
                    <CardBody className="b-leaguename">
                        <h4 className='mb-0 mr-1'>{getTextByLanguage(header.leagueName)}</h4>
                        {
                            header.flagImg && <img src={`https://getbet77.com/files/flags1/${header.flagImg}.png`} />
                        }
                    </CardBody >
                </Card >
                <Row className="m-0">
                    <Col md="4 pl-0">
                        <Card className="mb-0 team-mark">
                            <CardBody className="team-mark-b">
                                <img src={teamImg} />
                                <h5>{header.homeTeam}</h5>
                            </CardBody>
                        </Card>
                    </Col>
                    <Col md="4">
                        <Card className="mb-0 match-mark">
                            <CardBody className="match-mark-b">
                                <h1>{`${header.homeTeamScore ? header.homeTeamScore : 0} : ${header.awayTeamScore ? header.awayTeamScore : 0}`}</h1>
                                <span>{header.time === "" ? header.date : `'${header.time}`}</span>
                            </CardBody>
                        </Card>
                    </Col>
                    <Col md="4 pr-0">
                        <Card className="mb-0 team-mark">
                            <CardBody className="team-mark-b">
                                <h5>{header.awayTeam}</h5>
                                <img src={teamImg} />
                            </CardBody>
                        </Card>
                    </Col>
                </Row>
            </CardBody>
        </Card>
    )
}

export default HeaderCmp