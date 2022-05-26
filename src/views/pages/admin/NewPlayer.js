import React, { useEffect, useState } from 'react'
import {
    Card, CardBody, FormGroup, Label, Col, Input, CardHeader, ModalBody, ModalFooter, Button
} from 'reactstrap'
import { isUserLoggedIn, selectThemeColors } from '@utils'
import Select from 'react-select'
import CategoriesCmp from "./Categories"
import { useHistory } from 'react-router'
import { toast } from 'react-toastify'
import Axios from '../../../utility/hooks/Axios'
import { useDispatch, useSelector } from 'react-redux'
import { handleSession } from '@store/actions/auth'
import { useTranslator } from '@hooks/useTranslator'

const NewPlayerCmp = () => {
    const userData = useSelector((state) => state.auth.userData)

    // creat user
    const [username, setUserName] = useState("")
    const [userId, setUserId] = useState("")
    const [password, setPassword] = useState("")
    const [confirmPassword, setConfirmPassword] = useState("")
    const [credit, setCredit] = useState(0)
    const [language, setLanguage] = useState({ value: "english" })
    const [currency, setCurrency] = useState("TRY")
    const [role, setRole] = useState({ value: "user" })
    const [switchUser, setSwitchUser] = useState("U")
    const history = useHistory()
    const dispatch = useDispatch()
    const [getTextByLanguage] = useTranslator()

    const currencyOptions = [{ value: 'TRY', label: 'TRY' }]

    const languageOptions = [
        { value: 'hebrew', label: getTextByLanguage('Hebrew') },
        { value: 'english', label: getTextByLanguage('English') }
    ]

    const userOptions = [
        { value: 'user', label: getTextByLanguage('User') },
        { value: 'reporter', label: getTextByLanguage('Reporter') }
    ]

    const handleCreatePlayer = async () => {
        if (password !== confirmPassword) {
            toast.error(getTextByLanguage("Please enter same password"))
            return false
        }
        if (parseInt(credit) > parseInt(userData.balance)) {
            toast.error(getTextByLanguage("Invalid amount"))
            return false
        }
        if (parseInt(credit) + parseInt(userData.balance) < 0) {
            toast.error(getTextByLanguage("Invalid amount"))
            return false
        }
        if (role.value === "reporter") {
            setCredit(0)
        }
        const request = {
            username,
            userId,
            password,
            balance: parseInt(credit),
            language: language.value,
            currency: currency.value,
            role: role.value,
            agentId: userData._id,
            created: Date.now()
        }
        const response = await Axios({
            endpoint: "/auth/create-player",
            method: "POST",
            params: request
        })
        console.log(response)
        if (response.status === 200) {
            toast.success(getTextByLanguage("success"))
            dispatch(handleSession(response.userData))
        } else {
            toast.error(getTextByLanguage(response.data))
        }
    }

    // careate agent
    const [permission, setPermission] = useState({})
    const [agentShare, setAgentShare] = useState("85")
    const [roleValue, setRoleValue] = useState({ value: 'agent', label: getTextByLanguage('Agent'), isFixed: true })

    const permissionOptions = [
        // { value: 'player', label: getTextByLanguage('Player'), isFixed: true },
        { value: 'agent', label: getTextByLanguage('Agent'), isFixed: true },
        { value: 'superAgent', label: getTextByLanguage('Super Agent'), isFixed: true }
    ]

    const handleCreateAgent = async () => {
        console.log(permission)
        const pid = userData._id
        if (agentShare > 100) {
            toast.error(getTextByLanguage("Agent Profit maximum value is 100%"))
            return false
        }
        if (username === "") {
            toast.error(getTextByLanguage("Please enter username"))
            return false
        }
        if (password === "") {
            toast.error(getTextByLanguage("Please enter password"))
            return false
        }
        if (password !== confirmPassword) {
            toast.error(getTextByLanguage("Please enter same password"))
            return false
        }
        const request = {
            agentShare,
            username,
            userId,
            password,
            role: roleValue.value,
            pid,
            created: Date.now()
        }
        console.log(request)
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
        setRoleValue(options)
    }

    const handleSwitch = async (key) => {
        setSwitchUser(key)

        setUserName('')
        setUserId('')
        setPassword('')
        setConfirmPassword('')
        setCredit(0)
        setLanguage("english")
        setCurrency('TRY')
        setRole({ value: "user" })
        setAgentShare("85")
    }

    return (
        <div>
            <CategoriesCmp />
            <div className="content-body">
                <Card className="b-team__list">
                    <CardHeader className="main-title p-0">
                        <div className="left w-50">
                            <h2 className={switchUser === 'U' ? (userData.role === 'agent' ? "m-auto new-player pl-6" : "m-auto new-player text-center") : "m-auto new-player text-center new-player-active1"} onClick={() => handleSwitch('U')}>{getTextByLanguage("Create New Player")}</h2>
                        </div>
                        {
                            userData.role === 'admin' ? (
                                <div className="right w-50">
                                    <h2 className={switchUser === 'A' ? "m-auto new-player text-center" : "m-auto new-player text-center new-player-active2"} onClick={() => handleSwitch('A')}>{getTextByLanguage("Create New Agent")}</h2>
                                </div>
                            ) : null
                        }
                    </CardHeader>
                    {
                        switchUser === 'U' ? (
                            <CardBody className="b-team py-0">
                                <ModalBody className="useredit-form mt-1">
                                    <FormGroup row>
                                        <Label sm='6 modal-boder'>
                                            {getTextByLanguage("Username")}
                                        </Label>
                                        <Col sm='6'>
                                            <Input
                                                onChange={e => { setUserId(e.target.value) }}
                                                type='text'
                                                placeholder=''
                                                required
                                                value={userId}
                                            />
                                        </Col>
                                    </FormGroup>
                                    <FormGroup row>
                                        <Label sm='6 modal-boder'>
                                            {getTextByLanguage("Name")}
                                        </Label>
                                        <Col sm='6'>
                                            <Input
                                                onChange={e => { setUserName(e.target.value) }}
                                                type='text'
                                                placeholder=''
                                                required
                                                value={username}
                                            />
                                        </Col>
                                    </FormGroup>
                                    <FormGroup row>
                                        <Label sm='6 modal-boder'>
                                            {getTextByLanguage("Password")}
                                        </Label>
                                        <Col sm='6'>
                                            <Input
                                                onChange={e => { setPassword(e.target.value) }}
                                                type='password'
                                                placeholder=''
                                                required
                                                value={password}
                                            />
                                        </Col>
                                    </FormGroup>
                                    <FormGroup row>
                                        <Label sm='6 modal-boder'>
                                            {getTextByLanguage("Confirm password")}
                                        </Label>
                                        <Col sm='6'>
                                            <Input
                                                onChange={e => { setConfirmPassword(e.target.value) }}
                                                type='password'
                                                placeholder=''
                                                required
                                                value={confirmPassword}
                                            />
                                        </Col>
                                    </FormGroup>
                                    <FormGroup row>
                                        <Label sm='6 modal-boder'>
                                            {getTextByLanguage("Credit")}
                                        </Label>
                                        <Col sm='6'>
                                            <Input
                                                onChange={e => { setCredit(e.target.value) }}
                                                type='number'
                                                placeholder=''
                                                value={credit}
                                            />
                                        </Col>
                                    </FormGroup>
                                    <FormGroup row>
                                        <Label sm='6 modal-boder'>
                                            {getTextByLanguage("Language")}
                                        </Label>
                                        <Col sm='6'>
                                            <Select
                                                onChange={e => { setLanguage(e) }}
                                                options={languageOptions}
                                                className="react-select sbHolder"
                                                theme={selectThemeColors}
                                                classNamePrefix='select'
                                                value={language}
                                            />
                                        </Col>
                                    </FormGroup>
                                    {userData.role === "admin" ? (
                                        <FormGroup row>
                                            <Label sm='6 modal-boder'>
                                                {getTextByLanguage("Role")}
                                            </Label>
                                            <Col sm='6'>
                                                <Select
                                                    onChange={e => { setRole(e) }}
                                                    options={userOptions}
                                                    className="react-select sbHolder"
                                                    theme={selectThemeColors}
                                                    classNamePrefix='select'
                                                    value={role}
                                                />
                                            </Col>
                                        </FormGroup>
                                    ) : ""}
                                    {/* <hr className="row" style={{ borderTop: "2px solid #fff" }}></hr> */}
                                </ModalBody>
                                <ModalFooter className="m-auto">
                                    <Button color='primary' className="save" onClick={e => { handleCreatePlayer() }}>
                                        {getTextByLanguage("Create Player")}
                                    </Button>
                                    <Button color='primary' className="cancel" onClick={e => { history.push("/admin") }}>
                                        {getTextByLanguage("Cancel")}
                                    </Button>
                                </ModalFooter>
                            </CardBody>
                        ) : (
                            <CardBody>
                                <ModalBody className="useredit-form mt-1">
                                    <FormGroup row>
                                        <Label sm='6 modal-boder'>
                                            {getTextByLanguage("Permission")}
                                        </Label>
                                        <Col sm='6'>
                                            <Select
                                                isClearable={false}
                                                theme={selectThemeColors}
                                                defaultValue={permissionOptions[0]}
                                                options={permissionOptions}
                                                className='react-select'
                                                classNamePrefix='select'
                                                onChange={e => { handlePermission(e) }}
                                                value={roleValue}
                                            />
                                        </Col>
                                    </FormGroup>
                                    <FormGroup row>
                                        <Label sm='6 modal-boder'>
                                            {getTextByLanguage("Agent Share")}
                                        </Label>
                                        <Col sm='6'>
                                            <Input
                                                onChange={e => { setAgentShare(e.target.value) }}
                                                type='number'
                                                placeholder=''
                                                maxlimit={100}
                                                required
                                                value={agentShare}
                                            />
                                        </Col>
                                    </FormGroup>
                                    <FormGroup row>
                                        <Label sm='6 modal-boder'>
                                            {getTextByLanguage("Username")}
                                        </Label>
                                        <Col sm='6'>
                                            <Input
                                                onChange={e => { setUserId(e.target.value) }}
                                                type='text'
                                                placeholder=''
                                                required
                                                value={userId}
                                            />
                                        </Col>
                                    </FormGroup>
                                    <FormGroup row>
                                        <Label sm='6 modal-boder'>
                                            {getTextByLanguage("Name")}
                                        </Label>
                                        <Col sm='6'>
                                            <Input
                                                onChange={e => { setUserName(e.target.value) }}
                                                type='text'
                                                placeholder=''
                                                required
                                                value={username}
                                            />
                                        </Col>
                                    </FormGroup>
                                    <FormGroup row>
                                        <Label sm='6 modal-boder'>
                                            {getTextByLanguage("Password")}
                                        </Label>
                                        <Col sm='6'>
                                            <Input
                                                onChange={e => { setPassword(e.target.value) }}
                                                type='password'
                                                placeholder=''
                                                required
                                                value={password}
                                            />
                                        </Col>
                                    </FormGroup>
                                    <FormGroup row>
                                        <Label sm='6 modal-boder'>
                                            {getTextByLanguage("Confirm password")}
                                        </Label>
                                        <Col sm='6'>
                                            <Input
                                                onChange={e => { setConfirmPassword(e.target.value) }}
                                                type='password'
                                                placeholder=''
                                                required
                                                value={confirmPassword}
                                            />
                                        </Col>
                                    </FormGroup>
                                </ModalBody>
                                <ModalFooter className="m-auto">
                                    <Button color='primary' className="save" onClick={e => { handleCreateAgent() }}>
                                        {getTextByLanguage("Create Agent")}
                                    </Button>
                                    <Button color='primary' className="cancel" onClick={e => { history.push("/admin") }}>
                                        {getTextByLanguage("Cancel")}
                                    </Button>
                                </ModalFooter>
                            </CardBody>
                        )
                    }
                </Card>
            </div>
        </div>
    )
}

export default NewPlayerCmp
