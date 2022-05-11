import React, { useEffect, useState } from 'react'
import {
    Card, CardBody, FormGroup, Label, Col, Input, CardHeader, ModalBody, ModalFooter, Button, CustomInput
} from 'reactstrap'
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

const NewAgentCmp = () => {
    const [username, setUserName] = useState("")
    const [userId, setUserId] = useState("")
    const [password, setPassword] = useState("")
    const [confirmPassword, setConfirmPassword] = useState("")
    const [permission, setPermission] = useState({ player: true, agent: true })
    const [agentShare, setAgentShare] = useState("85")
    const history = useHistory()
    const userData = useSelector((state) => state.auth.userData)
    const [getTextByLanguage] = useTranslator()

    const permissionOptions = [
        { value: 'player', label: getTextByLanguage('Player'), isFixed: true },
        { value: 'agent', label: getTextByLanguage('Agent'), isFixed: true }
    ]


    const handleCreateAgent = async () => {
        const pid = userData._id
        if (password !== confirmPassword) {
            toast.error(getTextByLanguage("Please enter same password"))
            return false
        }
        const request = {
            agentShare,
            username,
            userId,
            password,
            role: "agent",
            permission,
            pid,
            created: Date.now()
        }
        const response = await Axios({
            endpoint: "/auth/create-agent",
            method: "POST",
            params: request
        })
        if (response.status === 200) {
            toast.success(getTextByLanguage("success"))
        } else {
            toast.error(getTextByLanguage(response.data))
        }
    }

    const handlePermission = async (options) => {
        const newPermission = permission
        for (const i in newPermission) {
            newPermission[i] = false
        }
        for (const i in options) {
            if (newPermission[options[i]["value"]] !== undefined) {
                newPermission[options[i]["value"]] = true
            }
        }
        setPermission({ ...newPermission })
    }

    return (
        <div>
            <CategoriesCmp />
            <div className="content-body">
                <Card>
                    <CardHeader className="py-0">
                        <h2 className="new-player">{getTextByLanguage("Create New Agent")}</h2>
                    </CardHeader>
                    <CardBody>
                        <ModalBody className="useredit-form">
                            <FormGroup row>
                                <Label sm='6'>
                                    {getTextByLanguage("Agent Share")}
                                </Label>
                                <Col sm='6'>
                                    <Input
                                        onChange={e => { setAgentShare(e.target.value) }}
                                        type='number'
                                        placeholder=''
                                        required
                                    />
                                </Col>
                            </FormGroup>
                            <FormGroup row>
                                <Label sm='6'>
                                    {getTextByLanguage("Login")}
                                </Label>
                                <Col sm='6'>
                                    <Input
                                        onChange={e => { setUserId(e.target.value) }}
                                        type='text'
                                        placeholder=''
                                        required
                                    />
                                </Col>
                            </FormGroup>
                            <FormGroup row>
                                <Label sm='6'>
                                    {getTextByLanguage("Name")}
                                </Label>
                                <Col sm='6'>
                                    <Input
                                        onChange={e => { setUserName(e.target.value) }}
                                        type='text'
                                        placeholder=''
                                        required
                                    />
                                </Col>
                            </FormGroup>
                            <FormGroup row>
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
                            </FormGroup>
                            <FormGroup row>
                                <Label sm='6'>
                                    {getTextByLanguage("Permission")}
                                </Label>
                                <Col sm='6'>
                                    <Select
                                        isClearable={false}
                                        theme={selectThemeColors}
                                        defaultValue={permissionOptions}
                                        isMulti
                                        options={permissionOptions}
                                        className='react-select'
                                        classNamePrefix='select'
                                        onChange={e => { handlePermission(e) }}
                                    />
                                </Col>
                            </FormGroup>
                        </ModalBody>
                    </CardBody>
                    <ModalFooter className="m-auto">
                        <Button color='primary' className="save" onClick={e => { handleCreateAgent() }}>
                            {getTextByLanguage("Create Agent")}
                        </Button>
                        <Button color='primary' className="cancel" onClick={e => { history.push("/admin") }}>
                            {getTextByLanguage("Cancel")}
                        </Button>
                    </ModalFooter>
                </Card>
            </div>
        </div>
    )
}

export default NewAgentCmp
