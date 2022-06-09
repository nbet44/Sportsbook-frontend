import React, { useState } from 'react'
import { useTranslator } from '@hooks/useTranslator'
import Axios from '../../../../utility/hooks/Axios'
import { toast } from 'react-toastify'
import { useSelector } from 'react-redux'
import {
  Button, Modal,
  ModalHeader,
  ModalBody,
  ModalFooter,
  FormGroup,
  Label,
  Col,
  Input
} from 'reactstrap'
import { Heart } from 'react-feather'

const Footer = () => {
  const logoImage = require("@src/assets/images/logo.png").default
  const [getTextByLanguage] = useTranslator()
  const userData = useSelector((state) => state.auth.userData)
  const [clear, setClear] = useState(false)
  const [password, setPassword] = useState("")
  const clearDB = () => {
    setClear(true)
  }
  const clearData = async () => {
    const request = {
      id: userData._id,
      password
    }
    const response = await Axios({
      endpoint: "/agent/remove-users",
      method: "POST",
      params: request
    })
    if (response.status === 200) {
      setClear(false)
      toast.success(getTextByLanguage("success"))
    } else {
      toast.error(getTextByLanguage(response.data))
    }
  }
  return (
    <p className='clearfix mb-0 bt-0 d-flex' style={{ justifyContent: "space-between", alignItems: "center" }}>
      <span className='float-md-left d-block d-md-inline-block'>
        <img className="img-fluid mr-1" src={logoImage} style={{ maxWidth: "200px" }} />
        { }

        <a href="/rules" className='text-white'>
          <span className='d-none d-sm-inline-block'>חוקים</span>
        </a>
      </span>
      {
        userData && userData.role === "admin" ? (
          <Button size="sm" color="default" style={{ color: "#22242a" }} onClick={() => clearDB()}>Initialize system</Button>
        ) : null
      }

      <Modal isOpen={clear} toggle={() => setClear(!clear)} className="changepassword modal-lg modal-dialog-centered">
        <ModalHeader toggle={() => setClear(!clear)}>
          <div className="left">
            <div className="logo-user">
              <h6>{getTextByLanguage("Initialize Platform")}</h6>
            </div>
          </div>
        </ModalHeader>
        <ModalBody className="useredit-form">
          <h2>
            {getTextByLanguage("Are you sure?")}
          </h2>
          <p>
            If yes, users data will be deleted without admin information.
          </p>
          <FormGroup row>
            <Label sm='6'>
              {getTextByLanguage("Password")}
            </Label>
            <Col sm='6'>
              <Input type='password' placeholder='Admin password + Admin password' required onChange={e => { setPassword(e.target.value) }} />
              <Label>Please enter the password twice in succession</Label>
            </Col>
          </FormGroup>
        </ModalBody>
        <ModalFooter className="m-auto">
          <Button color='primary' className="save mr-1" onClick={e => { clearData() }}>
            {getTextByLanguage("Yes")}
          </Button>
          <Button color='primary' className="cancel" onClick={e => { setClear(!clear) }}>
            {getTextByLanguage("Cancel")}
          </Button>
        </ModalFooter>
      </Modal>
    </p>
  )
}

export default Footer

//         <span className='d-none d-sm-inline-block'>Rules</span>
