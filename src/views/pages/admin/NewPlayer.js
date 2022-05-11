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
    const [username, setUserName] = useState("")
    const [userId, setUserId] = useState("")
    const [password, setPassword] = useState("")
    const [confirmPassword, setConfirmPassword] = useState("")
    const [credit, setCredit] = useState(0)
    const [language, setLanguage] = useState("english")
    const [currency, setCurrency] = useState("TRY")
    const [role, setRole] = useState("user")
    const history = useHistory()
    const userData = useSelector((state) => state.auth.userData)
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
        if (role === "reporter") {
            setCredit(0)
        }
        const request = {
            username,
            userId,
            password,
            balance: parseInt(credit),
            language: language.value,
            currency: currency.value,
            role,
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

    return (
        <div>
            <CategoriesCmp />
            <div className="content-body">
                <Card className="b-team__list">
                    <CardHeader className="main-title py-0">
                        <div className="left">
                            <h2 className="new-player m-auto">{getTextByLanguage("Create New Player")}</h2>
                        </div>
                    </CardHeader>
                    <CardBody className="b-team py-0">
                        <ModalBody className="useredit-form">
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
                                <Label sm='6'>
                                    {getTextByLanguage("Language")}
                                </Label>
                                <Col sm='6'>
                                    <Select
                                        onChange={e => { setLanguage(e) }}
                                        options={languageOptions}
                                        className="react-select sbHolder"
                                        theme={selectThemeColors}
                                        classNamePrefix='select'
                                    />
                                </Col>
                            </FormGroup>
                            {userData.role === "admin" ? (
                                <FormGroup row>
                                    <Label sm='6'>
                                        {getTextByLanguage("Role")}
                                    </Label>
                                    <Col sm='6'>
                                        <Select
                                            onChange={e => { setRole(e.value) }}
                                            options={userOptions}
                                            className="react-select sbHolder"
                                            theme={selectThemeColors}
                                            classNamePrefix='select'
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
                </Card>
            </div>
        </div>
    )
}

export default NewPlayerCmp
