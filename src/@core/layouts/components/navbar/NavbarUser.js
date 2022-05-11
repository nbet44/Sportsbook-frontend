// ** Dropdowns Imports
import { useEffect, useState, Fragment } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import moment from 'moment'
import { getOddType, isUserLoggedIn, selectThemeColors } from '@utils'
import { handleLogout } from '@store/actions/auth'
import Select from 'react-select'
import UserDropdown from './UserDropdown'
import Language from './Language'
import ReactInterval from 'react-interval'
import { useTranslator } from '@hooks/useTranslator'

// ** Third Party Components
import { Sun, Moon, Menu, CreditCard, LogOut, Link } from 'react-feather'
import { NavItem, NavLink, Col, Modal, ModalBody, ModalFooter, ModalHeader, Input, Button, FormGroup, Label, UncontrolledDropdown, DropdownMenu, DropdownToggle, DropdownItem } from 'reactstrap'
import Axios from '../../../../utility/hooks/Axios'

const NavbarUser = props => {
  const dispatch = useDispatch()

  // ** Props
  const { skin, setSkin, setMenuVisibility } = props
  const userData = useSelector((state) => state.auth.userData)
  const [subData, setSubData] = useState(null)
  const [isBalanceModal, setBalanceModal] = useState(false)
  const [getTextByLanguage] = useTranslator()
  const [siteTime, setSiteTime] = useState(moment(new Date()).format('DD.MM.YYYY HH:mm'))
  const [oddType, setOddType] = useState("odds")
  const [modalData, setModalData] = useState(null)
  const [selectedWeek, setSelectedWeek] = useState({ value: '1', label: getTextByLanguage('Current week') })

  //const logoImage = require("@src/assets/images/logo.png").default

  const options = [
    { value: '1', label: getTextByLanguage('Current week') },
    { value: '2', label: getTextByLanguage('Last week') },
    { value: '3', label: getTextByLanguage('Two weeks ago') },
    { value: '4', label: getTextByLanguage('Three weeks ago') },
    { value: '5', label: getTextByLanguage('Four weeks ago') }
  ]

  const onClickLogout = () => {
    dispatch(handleLogout())
  }

  const handleTimer = () => {
    setSiteTime(moment(new Date()).format('DD/MM/YYYY/ HH:mm'))
  }

  const handleChangeUser = (data) => {
    if (data !== "userData") {
      const temp = JSON.stringify(subData)
      const temp1 = JSON.stringify(userData)
      localStorage.setItem("userData", temp)
      localStorage.setItem("subData", temp1)
      window.location.reload()
    }
  }

  const handleChangeOddType = (data) => {
    localStorage.setItem("oddType", data)
    window.location.reload()
  }

  const ThemeToggler = () => {
    if (skin === 'dark') {
      return <Sun className='ficon' onClick={() => setSkin('light')} />
    } else {
      return <Moon className='ficon' onClick={() => setSkin('dark')} />
    }
  }

  const handleChangeWeek = async (e) => {
    const request = {
      userId: userData._id,
      week: e
    }
    const response = await Axios({
      endpoint: "/user/get-balance",
      method: "POST",
      params: request
    })
    console.log(response)
    if (response.status === 200) {
      setModalData(response.data)
    }
    setSelectedWeek(e)
  }

  const handleBalance = async () => {
    const request = {
      userId: userData._id,
      week: selectedWeek
    }
    const response = await Axios({
      endpoint: "/user/get-balance",
      method: "POST",
      params: request
    })
    console.log(response)
    if (response.status === 200) {
      setModalData(response.data)
    }
    setBalanceModal(!isBalanceModal)
  }


  useEffect(() => {
    setSubData(JSON.parse(localStorage.getItem("subData")))
    setOddType(getOddType())
  }, [])

  return (
    <Fragment>
      <ReactInterval timeout={60000} enabled={true} callback={e => { handleTimer() }} />
      {/* <ul className='navbar-nav d-xl-none d-flex align-items-center'>
        <NavItem className='mobile-menu mr-auto'>
          <NavLink className='nav-menu-main menu-toggle hidden-xs is-active' onClick={() => setMenuVisibility(true)}>
            <Menu className='ficon' />
          </NavLink>
        </NavItem>
      </ul> */}
      {/* <div className='bookmark-wrapper d-flex align-items-center'>
        <NavItem className='d-none d-lg-block'>
          <NavLink className='nav-link-style'>
            <ThemeToggler />
          </NavLink>
        </NavItem>
      </div> */}
      <ul className='nav navbar-nav align-items-center justify-content-between' style={{ width: "100%" }}>
        <UserDropdown />
        <li className="d-flex align-items-center mr-1" onClick={e => { handleBalance() }} style={{ cursor: "pointer" }}>
          {/* <li className="d-flex align-items-center mr-1" style={{ cursor: "pointer" }}> */}
          <CreditCard className='ficon' />
          <span className='font-weight-bold ml-1' style={{ fontSize: "16px", color: "lightgreen" }}>{(userData && userData['balance']) || '0'}</span>
        </li>
        <Language />
        <li>
          <UncontrolledDropdown>
            <DropdownToggle color='flat-secondary'>
              {oddType === "odds" ? "Decimal" : "American"}
            </DropdownToggle>
            <DropdownMenu right>
              <DropdownItem onClick={e => { handleChangeOddType("americanOdds") }} tag='a'>American</DropdownItem>
              <DropdownItem onClick={e => { handleChangeOddType("odds") }} tag='a'>Decimal</DropdownItem>
            </DropdownMenu>
          </UncontrolledDropdown>
        </li>
        {/*<li className="d-flex align-items-center mr-1">
          <span className='brand-logo' onClick={e => { window.location.href = "/" }} style={{ cursor: "pointer" }}>
            <img src={logoImage} className="img-fluid" alt="" data-nsfw-filter-status="sfw" style={{ maxWidth: "200px" }} />
          </span>
    </li>*/}
        {subData ? (
          <li>
            <UncontrolledDropdown>
              <DropdownToggle color='flat-secondary'>
                {(userData && userData['userId']) || 'John Doe'}
              </DropdownToggle>
              <DropdownMenu right>
                <DropdownItem onClick={e => { handleChangeUser("userData") }} tag='a'>{(userData && userData['userId']) || 'John Doe'}</DropdownItem>
                <DropdownItem onClick={e => { handleChangeUser("subData") }} tag='a'>{(subData && subData['userId']) || 'John Doe'}</DropdownItem>
              </DropdownMenu>
            </UncontrolledDropdown>
            {/* <UncontrolledDropdown tag='li' className='dropdown-user nav-item mr-1' style={{ padding: "0.8rem 1rem " }}>
              <DropdownToggle color='flat-primary' href='/' tag='a' className='nav-link dropdown-user-link' onClick={e => e.preventDefault()}>
                <div className='user-nav d-sm-flex d-none'>
                  <span className='user-status'>Admin</span>
                </div>
              </DropdownToggle>
              <DropdownMenu right>
                <DropdownItem tag={Link} to='#'>
                  <span className='align-middle'>User</span>
                </DropdownItem>
              </DropdownMenu>
            </UncontrolledDropdown> */}
          </li>
        ) : ""}
        <li className="d-flex align-items-center mr-1">
          <span className='font-weight-bold ml-1' style={{ fontSize: "15px" }} >{siteTime}</span>
        </li>
        <li className="d-flex align-items-center mr-1" onClick={() => dispatch(onClickLogout)} style={{ cursor: "pointer" }}>
          <LogOut size={20} />
          <span className='font-weight-bold ml-1' style={{ fontSize: "16px" }}>{getTextByLanguage("Logout")}</span>
        </li>
      </ul>
      <Modal isOpen={isBalanceModal} toggle={() => setBalanceModal(!isBalanceModal)} className="balanceedit modal-dialog-centered">
        <ModalHeader toggle={() => setBalanceModal(!isBalanceModal)}>
          <div className="left">
            <div className="logo-user">
              <h6>{getTextByLanguage("Balance")}</h6>
            </div>
          </div>
        </ModalHeader>
        <ModalBody className="useredit-form" style={{ fontSize: "13px" }}>
          <FormGroup row>
            <Label sm='6'>
              {getTextByLanguage("Week")}
            </Label>
            <Col sm='6'>
              <Select
                options={options}
                defaultValue={options[0]}
                onChange={e => { handleChangeWeek(e) }}
                className="react-select sbHolder"
                theme={selectThemeColors}
                classNamePrefix='select'
              />
            </Col>
          </FormGroup>
          <FormGroup row>
            <Label sm='6'>
              {getTextByLanguage("Open Week")}
            </Label>
            <Col sm='6'>
              <p>{modalData ? modalData.openWeek : 0}</p>
            </Col>
          </FormGroup>
          <FormGroup row>
            <Label sm='6'>
              {getTextByLanguage("Credit")}
            </Label>
            <Col sm='6'>
              <p>{modalData ? modalData.credit : 0}</p>
            </Col>
          </FormGroup>
          <FormGroup row>
            <Label sm='6'>
              {getTextByLanguage("Risk")}
            </Label>
            <Col sm='6'>
              <p>{modalData ? modalData.risk : 0}</p>
            </Col>
          </FormGroup>
          <FormGroup row>
            <Label sm='6'>
              {getTextByLanguage("Balance")}
            </Label>
            <Col sm='6'>
              <p>{modalData ? modalData.balance : 0}</p>
            </Col>
          </FormGroup>
          <hr className="row" style={{ borderTop: "2px solid #fff" }}></hr>
          <FormGroup row>
            <Label sm='6'>
              {getTextByLanguage("Toto Open Week")}
            </Label>
            <Col sm='6'>
              <p>0</p>
            </Col>
          </FormGroup>
          <FormGroup row>
            <Label sm='6'>
              {getTextByLanguage("Toto Credit")}
            </Label>
            <Col sm='6'>
              <p>0</p>
            </Col>
          </FormGroup>
          <FormGroup row>
            <Label sm='6'>
              {getTextByLanguage("Toto Risk")}
            </Label>
            <Col sm='6'>
              <p>0</p>
            </Col>
          </FormGroup>
          <FormGroup row>
            <Label sm='6'>
              {getTextByLanguage("Toto Balance")}
            </Label>
            <Col sm='6'>
              <p>0</p>
            </Col>
          </FormGroup>
        </ModalBody>
        <ModalFooter className="m-auto">
          <Button color='primary' className="cancel" onClick={e => { setBalanceModal(!isBalanceModal) }}>
            {getTextByLanguage("Cancel")}
          </Button>
        </ModalFooter>
      </Modal>
    </Fragment>
  )
}
export default NavbarUser
