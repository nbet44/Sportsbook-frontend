// ** React Imports
import { useEffect, useState } from 'react'
import { Link, useHistory } from 'react-router-dom'

// ** Custom Components
import Avatar from '@components/avatar'

// ** Utils
import { isUserLoggedIn } from '@utils'

// ** Store & Actions
import { useDispatch, useSelector } from 'react-redux'
import { handleLogout } from '@store/actions/auth'

// ** Third Party Components
import { Col, Modal, ModalBody, ModalFooter, ModalHeader, Input, Button, FormGroup, Label, UncontrolledDropdown, DropdownMenu, DropdownToggle, DropdownItem } from 'reactstrap'

// ** Default Avatar Image
import defaultAvatar from '@src/assets/images/portrait/small/avatar-s-11.jpg'
import Axios from '../../../../utility/hooks/Axios'
import { toast } from 'react-toastify'
import { useTranslator } from '@hooks/useTranslator'

const UserDropdown = () => {
  // ** Store Vars
  const dispatch = useDispatch()
  const history = useHistory()
  const [isPasswordModal, setPasswordModal] = useState(false)
  const [password, setPassword] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [getTextByLanguage] = useTranslator()

  // ** State
  const userData = useSelector((state) => state.auth.userData)

  const handleChangePassword = async () => {
    if (newPassword !== confirmPassword) {
      toast.error("Please enter same value again")
      return false
    }
    const request = {
      user_id: userData._id,
      userId: userData.userId,
      password,
      newPassword,
      confirmPassword
    }
    const response = await Axios({
      endpoint: "/auth/change-password",
      method: "POST",
      params: request
    })
    if (response.status === 200) {
      localStorage.clear()
      history.push("/login")
    }
  }

  //** Vars
  const userAvatar = (userData && userData.avatar) || defaultAvatar

  return (
    <UncontrolledDropdown tag='li' className='dropdown-user nav-item mr-1' style={{ padding: "0.8rem 1rem " }}>
      <DropdownToggle href='/' tag='a' className='nav-link dropdown-user-link' onClick={e => e.preventDefault()}>
        <Avatar img={userAvatar} imgHeight='40' imgWidth='40' status='online' />
        <div className='user-nav d-sm-flex d-none'>
          <span className='user-name font-weight-bold m-auto' style={{ fontSize: "16px" }}>{(userData && userData['userId']) || 'John Doe'}</span>
          {/* <span className='user-status'>{(userData && userData.role) || 'Admin'}</span> */}
        </div>
      </DropdownToggle>
      <DropdownMenu right>
        <DropdownItem tag={Link} to='#' onClick={e => { setPasswordModal(!isPasswordModal) }}>
          <span className='align-middle'>{getTextByLanguage("Change password")}</span>
        </DropdownItem>
        <DropdownItem tag={Link} to='/transaction'>
          <span className='align-middle'>{getTextByLanguage("Transaction")}</span>
        </DropdownItem>
        <DropdownItem tag={Link} to='/login-history'>
          <span className='align-middle'>{getTextByLanguage("Login History")}</span>
        </DropdownItem>
        <DropdownItem tag={Link} to='/login' onClick={() => dispatch(handleLogout())}>
          <span className='align-middle'>{getTextByLanguage("Logout")}</span>
        </DropdownItem>
      </DropdownMenu>
      <Modal isOpen={isPasswordModal} toggle={() => setPasswordModal(!isPasswordModal)} className="changepassword modal-lg modal-dialog-centered">
        <ModalHeader toggle={() => setPasswordModal(!isPasswordModal)}>
          <div className="left">
            <div className="logo-user">
              <h6>{getTextByLanguage("Change password")}</h6>
            </div>
          </div>
        </ModalHeader>
        <ModalBody className="useredit-form">
          <FormGroup row>
            <Label sm='6'>
              {getTextByLanguage("Password")}
            </Label>
            <Col sm='6'>
              <Input type='password' placeholder='' required onChange={e => { setPassword(e.target.value) }} />
            </Col>
          </FormGroup>
          <FormGroup row>
            <Label sm='6'>
              {getTextByLanguage("New Password")}
            </Label>
            <Col sm='6'>
              <Input type='password' placeholder='' required onChange={e => { setNewPassword(e.target.value) }} />
            </Col>
          </FormGroup>
          <FormGroup row>
            <Label sm='6'>
              {getTextByLanguage("Confirm new password")}
            </Label>
            <Col sm='6'>
              <Input type='password' placeholder='' required onChange={e => { setConfirmPassword(e.target.value) }} />
            </Col>
          </FormGroup>
        </ModalBody>
        <ModalFooter className="m-auto">
          <Button color='primary' className="save mr-1" onClick={e => { handleChangePassword() }}>
            {getTextByLanguage("Save")}
          </Button>
          <Button color='primary' className="cancel" onClick={e => { setPasswordModal(!isPasswordModal) }}>
            {getTextByLanguage("Cancel")}
          </Button>
        </ModalFooter>
      </Modal>
    </UncontrolledDropdown>
  )
}

export default UserDropdown
