import React, { useEffect, useState } from 'react'
import {
  Col, Modal, ModalBody, ModalFooter, ModalHeader, Input, Button, FormGroup, Label,
  Card, CardHeader, CardBody, CustomInput
} from 'reactstrap'
import Select from 'react-select'
import { selectThemeColors } from '@utils'
import { ChevronDown, AlertCircle, Search, Check } from 'react-feather'
import DataTable from 'react-data-table-component'
import ReactPaginate from 'react-paginate'
import '@styles/react/libs/tables/react-dataTable-component.scss'
import CategoriesCmp from './Categories'
import { useDispatch, useSelector } from 'react-redux'
import Axios from '../../../utility/hooks/Axios'
import Spinner from "@components/spinner/Fallback-spinner"
import { toast } from 'react-toastify'
import { handleSession } from '@store/actions/auth'
import moment from 'moment'
import { useTranslator } from '@hooks/useTranslator'

const UserManageByAgent = () => {
  const dispatch = useDispatch()
  const [currentPage, setCurrentPage] = useState(0)
  const [isLoading, setIsLoading] = useState(true)
  const [tableData, setTableData] = useState([])
  const [filterData, setFilterData] = useState([])
  const userData = useSelector((state) => state.auth.userData)
  const [selectedWeek, setSelectedWeek] = useState(1)
  const [searchUserName, setSearchUserName] = useState("")
  const [activeStatus, setActiveStatus] = useState(false)
  const [tableColumns, setTableColumns] = useState([])
  const [getTextByLanguage] = useTranslator()
  const [dataKind, setDataKind] = useState(1)

  const [modalData, setModalData] = useState(null)
  const [isUserInfoModal, setUserInfoModal] = useState(false)
  const [isAccountDelete, setAccountDelete] = useState(false)
  const [showRule, setShowRule] = useState(false)
  const [accountLevel, setAccountLevel] = useState({ value: "normal", label: "Normal" })

  const [autoWeeklyCredit, setAutoWeeklyCredit] = useState(0)
  const [withdrawalCredit, setWithdrawalCredit] = useState(0)
  const [agentCommission, setAgentCommission] = useState(0)
  const [isBalanceModal, setBalanceModal] = useState(false)
  const [extraCredit, setExtraCredit] = useState(0)


  const weekOptions = [
    { value: '1', label: getTextByLanguage('Current week') },
    { value: '2', label: getTextByLanguage('Last week') },
    { value: '3', label: getTextByLanguage('Two weeks ago') },
    { value: '4', label: getTextByLanguage('Three weeks ago') },
    { value: '5', label: getTextByLanguage('Four weeks ago') }
  ]

  const spreadOptions = [
    { value: '36', label: getTextByLanguage('36') },
    { value: '37', label: getTextByLanguage('37') },
    { value: '38', label: getTextByLanguage('38') },
    { value: '39', label: getTextByLanguage('39') },
    { value: '40', label: getTextByLanguage('40') },
    { value: '50', label: getTextByLanguage('50') },
    { value: '60', label: getTextByLanguage('60') },
    { value: '70', label: getTextByLanguage('70') },
    { value: '80', label: getTextByLanguage('80') },
    { value: '90', label: getTextByLanguage('90') },
    { value: '100', label: getTextByLanguage('100') }
  ]

  const levelOptions = [
    { value: 'normal', label: getTextByLanguage('Normal') },
    { value: 'dangerous', label: getTextByLanguage('Dangerous') },
    { value: 'very_dangerous', label: getTextByLanguage('Very Dangerous') },
    { value: 'extra_dangerous', label: getTextByLanguage('Extra Dangerous') }
  ]

  const showUserInfoModal = (data) => {
    setModalData(data)
    if (data.setting && data.setting.showRule) {
      setShowRule(data.setting.showRule)
    } else {
      setShowRule(false)
    }
    setUserInfoModal(!isUserInfoModal)
    setAccountDelete(false)
  }

  const saveUserInfo = async () => {
    if ((modalData.newPassword && modalData.confirmPassword) && modalData.newPassword !== modalData.confirmPassword) {
      toast.error(getTextByLanguage("Confirm new password"))
      return false
    } else if ((modalData.newPassword && modalData.confirmPassword) && modalData.newPassword === modalData.confirmPassword) {
      modalData.password = modalData.confirmPassword
    }
    const request = {
      agentId: modalData.agentId,
      userId: modalData._id,
      username: modalData.username,
      password: modalData.password,
      maxBetLimit: modalData.maxBetLimit,
      delete: isAccountDelete,
      showRule,
      level: accountLevel.value,
      updated: Date.now(),
      role: userData.role,
      filter: {
        status: activeStatus,
        week: selectedWeek
      }
    }
    console.log(request)
    const response = await Axios({
      endpoint: "/agent/update-user",
      method: "POST",
      params: request
    })
    if (response.status === 200) {
      setUserInfoModal(!isUserInfoModal)
      setTableData(response.data)
      setFilterData(response.data)
      toast.success(getTextByLanguage("success"))
      // setIsLoading(false)
    } else {
      toast.error(getTextByLanguage(response.data))
      // setIsLoading(true)
    }
  }

  const cancelUserInfo = () => {
    setUserInfoModal(!isUserInfoModal)
    setModalData(null)
  }

  const showUserBalanceModal = (data) => {
    setModalData(data)
    setAutoWeeklyCredit(data.autoWeeklyCredit ? data.autoWeeklyCredit : 0)
    setWithdrawalCredit(data.withdrawalCredit ? data.withdrawalCredit : 0)
    setAgentCommission(data.agentCommission ? data.agentCommission : 0)
    setBalanceModal(!isBalanceModal)
  }

  const saveUserBalance = async () => {
    if ((parseInt(extraCredit) + parseInt(autoWeeklyCredit)) > parseInt(userData.balance)) {
      toast.error(getTextByLanguage("Invalid amount"))
      return false
    }
    if (parseInt(extraCredit) < 0) {
      toast.error(getTextByLanguage("Invalid amount"))
      return false
    }
    const request = {
      ...modalData,
      autoWeeklyCredit,
      extraCredit,
      withdrawalCredit,
      agentCommission,
      userId: modalData._id,
      created: Date.now(),
      filter: {
        status: activeStatus,
        week: selectedWeek
      }
    }
    const response = await Axios({
      endpoint: "/agent/update-balance",
      method: "POST",
      params: request
    })
    if (response.status === 200) {
      setTableData(response.data.tableData)
      setBalanceModal(!isBalanceModal)
      dispatch(handleSession(response.data.userData))
      toast.success(getTextByLanguage("success"))
    } else {
      toast.error(getTextByLanguage(response.data))
    }
  }

  const cancelUserBalance = () => {
    setBalanceModal(!isBalanceModal)
    setModalData(null)
  }

  const sportsColumns = [
    {
      name: getTextByLanguage('User ID'),
      selector: '_id',
      minWidth: "50px",
      sortable: true
    },
    {
      name: getTextByLanguage('Name'),
      selector: 'name',
      minWidth: "50px",
      sortable: true,
      cell: row => (
        <span onClick={e => { showUserInfoModal(row) }} style={{ cursor: "pointer" }}>{row.username}</span>
      )
    },

    {
      name: getTextByLanguage('Status'),
      selector: 'isOnline',
      minWidth: "50px",
      cell: row => (
        <span className={row.isOnline === 'Online' ? 'btn-success' : 'btn-danger'} style={{ cursor: "pointer", borderRadius: 20 }}>{row.isOnline}</span>
      )
    },
    {
      name: getTextByLanguage('Credit'),
      selector: "credit",
      sortable: true,
      minWidth: "50px",
      cell: row => (
        <span onClick={e => { showUserBalanceModal(row) }} style={{ cursor: "pointer" }}>{row.credit}</span>
      )
    },
    {
      name: getTextByLanguage('Balance in risk'),
      selector: "risk",
      sortable: true,
      minWidth: "50px"
    },
    {
      name: getTextByLanguage('Open Bets'),
      selector: "openBets",
      sortable: true,
      minWidth: "50px"
    },
    {
      name: getTextByLanguage('Close Bets'),
      selector: "closeBets",
      sortable: true,
      minWidth: "50px"
    },
    {
      name: getTextByLanguage('Turnover'),
      selector: "turnover",
      sortable: true,
      minWidth: "50px"
    },
    {
      name: getTextByLanguage('Discount'),
      selector: "discount",
      sortable: true,
      minWidth: "50px"
    },
    {
      name: getTextByLanguage('Total'),
      selector: "total",
      sortable: true,
      minWidth: "50px"
    },
    {
      name: getTextByLanguage('Total Net'),
      selector: "totalNet",
      sortable: true,
      minWidth: "50px"
    },
    {
      name: getTextByLanguage('Agent Commission%'),
      selector: "agentCommiPer",
      sortable: true,
      minWidth: "50px"
    },
    {
      name: getTextByLanguage('Platform Commission'),
      selector: "platformCommi",
      sortable: true,
      minWidth: "50px"
    },
    {
      name: getTextByLanguage('Agent Commission'),
      selector: "agetnCommi",
      sortable: true,
      minWidth: "50px"
    },
    {
      name: getTextByLanguage('Username'),
      selector: 'userId',
      minWidth: "50px",
      sortable: true
    }
  ]

  const casinoColumns = [
    {
      name: getTextByLanguage('User ID'),
      selector: 'userId',
      minWidth: "50px",
      sortable: true
    },
    {
      name: getTextByLanguage('Name'),
      selector: 'name',
      minWidth: "50px",
      sortable: true,
      cell: row => (
        <span onClick={e => { showUserInfoModal(row) }} style={{ cursor: "pointer" }}>{row.username}</span>
      )
    },
    {
      name: getTextByLanguage('Status'),
      selector: 'isOnline',
      minWidth: "50px",
      cell: row => (
        <span className={row.isOnline === 'Online' ? 'btn-success' : 'btn-danger'} style={{ cursor: "pointer", borderRadius: 20 }}>{row.isOnline}</span>
      )
    },
    {
      name: getTextByLanguage('Credit'),
      selector: "credit",
      sortable: true,
      minWidth: "50px"
    },
    {
      name: getTextByLanguage('Total'),
      selector: "total",
      sortable: true,
      minWidth: "50px"
    },
    {
      name: getTextByLanguage('Discount'),
      selector: "discount",
      sortable: true,
      minWidth: "50px"
    },
    {
      name: getTextByLanguage('Total Net'),
      selector: "totalNet",
      sortable: true,
      minWidth: "50px"
    },
    {
      name: getTextByLanguage('Agent Commission%'),
      selector: "agentCommiPer",
      sortable: true,
      minWidth: "50px"
    },
    {
      name: getTextByLanguage('Platform Commission'),
      selector: "platformCommi",
      sortable: true,
      minWidth: "50px"
    },
    {
      name: getTextByLanguage('Agent Commission'),
      selector: "agetnCommi",
      sortable: true,
      minWidth: "50px"
    },
    {
      name: getTextByLanguage('Username'),
      selector: 'userId',
      minWidth: "50px",
      sortable: true
    }
  ]

  const allColumns = [
    {
      name: getTextByLanguage('User ID'),
      selector: 'userId',
      minWidth: "50px",
      sortable: true
    },
    {
      name: getTextByLanguage('Name'),
      selector: 'name',
      minWidth: "50px",
      sortable: true,
      cell: row => (
        <span onClick={e => { showUserInfoModal(row) }} style={{ cursor: "pointer" }}>{row.username}</span>
      )
    },
    {
      name: getTextByLanguage('Status'),
      selector: 'isOnline',
      minWidth: "50px",
      cell: row => (
        <span className={row.isOnline === 'Online' ? 'btn-success' : 'btn-danger'} style={{ cursor: "pointer", borderRadius: 20 }}>{row.isOnline}</span>
      )
    },
    {
      name: getTextByLanguage('Credit'),
      selector: "credit",
      sortable: true,
      minWidth: "50px"
    },
    {
      name: getTextByLanguage('Turnover'),
      selector: "turnover",
      sortable: true,
      minWidth: "50px"
    },
    {
      name: getTextByLanguage('Total'),
      selector: "total",
      sortable: true,
      minWidth: "50px"
    },
    {
      name: getTextByLanguage('Discount'),
      selector: "discount",
      sortable: true,
      minWidth: "50px"
    },
    {
      name: getTextByLanguage('Total Net'),
      selector: "totalNet",
      sortable: true,
      minWidth: "50px"
    },
    {
      name: getTextByLanguage('Agent Commission%'),
      selector: "agentCommiPer",
      sortable: true,
      minWidth: "50px"
    },
    {
      name: getTextByLanguage('Platform Commission'),
      selector: "platformCommi",
      sortable: true,
      minWidth: "50px"
    },
    {
      name: getTextByLanguage('Agent Commission'),
      selector: "agetnCommi",
      sortable: true,
      minWidth: "50px"
    },
    {
      name: getTextByLanguage('Username'),
      selector: 'userId',
      minWidth: "50px",
      sortable: true
    }
  ]

  useEffect(async () => {
    setTableColumns(sportsColumns)
    if (userData) {
      const request = {
        agentId: userData._id,
        role: userData.role,
        filter: {
          status: activeStatus,
          week: selectedWeek
        }
      }
      const response = await Axios({
        endpoint: "/agent/user-manage-angent",
        method: "POST",
        params: request
      })
      console.log(response)
      if (response.status === 200) {
        setTableData(response.data)
        setFilterData(response.data)
        setIsLoading(false)
      } else {
        toast.error(getTextByLanguage(response.data))
        setIsLoading(true)
      }
    }
  }, [])

  const changeKind = (kind) => {
    setDataKind(kind)
    if (kind === 1) {
      setTableColumns(sportsColumns)
    } else if (kind === 2) {
      setTableColumns(casinoColumns)
    } else {
      setTableColumns(allColumns)
    }
  }

  // ** Function to handle Pagination
  const handlePagination = page => {
    setCurrentPage(page.selected)
  }

  // ** Custom Pagination
  const CustomPagination = () => (
    <ReactPaginate
      previousLabel=''
      nextLabel=''
      forcePage={currentPage}
      onPageChange={page => handlePagination(page)}
      pageCount={tableData.length / 7 || 1}
      breakLabel='...'
      pageRangeDisplayed={2}
      marginPagesDisplayed={2}
      activeClassName='active'
      pageClassName='page-item'
      breakClassName='page-item'
      breakLinkClassName='page-link'
      nextLinkClassName='page-link'
      nextClassName='page-item next'
      previousClassName='page-item prev'
      previousLinkClassName='page-link'
      pageLinkClassName='page-link'
      containerClassName='pagination react-paginate separated-pagination pagination-sm justify-content-end pr-1 mt-1'
    />
  )

  useEffect(async () => {
    const request = {
      agentId: userData._id,
      role: userData.role,
      filter: {
        status: activeStatus,
        week: selectedWeek
      }
    }
    const response = await Axios({
      endpoint: "/agent/user-manage-angent",
      method: "POST",
      params: request
    })
    console.log(response)
    if (response.status === 200) {
      setTableData(response.data)
      setFilterData(response.data)
      setIsLoading(false)
    } else {
      toast.error(getTextByLanguage(response.data))
      setIsLoading(true)
    }
  }, [selectedWeek])

  useEffect(async () => {
    const request = {
      agentId: userData._id,
      role: userData.role,
      filter: {
        status: activeStatus,
        week: selectedWeek
      }
    }
    const response = await Axios({
      endpoint: "/agent/user-manage-angent",
      method: "POST",
      params: request
    })
    console.log(response)
    if (response.status === 200) {
      setTableData(response.data)
      setFilterData(response.data)
      setIsLoading(false)
    } else {
      toast.error(getTextByLanguage(response.data))
      setIsLoading(true)
    }
  }, [activeStatus])

  const handleSearch = () => {
    const result = []
    for (const i in tableData) {
      if (tableData[i].username.indexOf(searchUserName) !== -1) {
        result.push(tableData[i])
      }
    }
    setFilterData(result)
  }

  if (isLoading) {
    return (
      <Spinner></Spinner>
    )
  }

  return (
    <div>
      <Modal isOpen={isUserInfoModal} toggle={() => setUserInfoModal(!isUserInfoModal)} className="balanceedit modal-lg modal-dialog-centered">
        <ModalHeader toggle={() => setUserInfoModal(!isUserInfoModal)}>
          <div className="left">
            <h2 className="new-player m-auto pl-6">{getTextByLanguage("Edit User ")}{modalData ? modalData.userId : ""}</h2>
          </div>
        </ModalHeader>
        <ModalBody className="useredit-form">
          <FormGroup row>
            <Label sm='6'>
              {getTextByLanguage("Username")}
            </Label>
            <Col sm='6 align-items-center d-flex'>
              {modalData ? modalData.userId : ""}
            </Col>
          </FormGroup>
          <FormGroup row>
            <Label sm='6'>
              {getTextByLanguage("Name")}
            </Label>
            <Col sm='6 align-items-center d-flex'>
              <Input type="text" value={modalData ? modalData.username : ""} onChange={e => { setModalData({ ...modalData, ["username"]: e.target.value }) }} />
            </Col>
          </FormGroup>
          <FormGroup row>
            <Label sm='6'>
              {getTextByLanguage("New Password")}
            </Label>
            <Col sm='6 align-items-center d-flex'>
              <Input type="password" onChange={e => { setModalData({ ...modalData, ["newPassword"]: e.target.value }) }} />
            </Col>
          </FormGroup>
          <FormGroup row>
            <Label sm='6'>
              {getTextByLanguage("Confirm Password")}
            </Label>
            <Col sm='6 align-items-center d-flex'>
              <Input type="password" onChange={e => { setModalData({ ...modalData, ["confirmPassword"]: e.target.value }) }} />
            </Col>
          </FormGroup>
          <FormGroup row>
            <Label sm='6'>
              {getTextByLanguage("Max per match limit")}
            </Label>
            <Col sm='6 align-items-center d-flex'>
              <Input type="number" value={modalData ? modalData.maxBetLimit : ""} onChange={e => { setModalData({ ...modalData, ["maxBetLimit"]: e.target.value }) }} />
            </Col>
          </FormGroup>
          <FormGroup row>
            <Col sm='6' className='d-flex pl-0'>
              <Label sm='6'>
                {getTextByLanguage("Delete")}
              </Label>
              <Col sm='6 align-items-center d-flex'>
                <CustomInput
                  id="account_delete_id"
                  type="switch"
                  checked={isAccountDelete}
                  onChange={() => { setAccountDelete(true) }}
                />
              </Col>
            </Col>
            <Col sm='6' className='d-flex pl-0'>
              <Label sm='6'>
                {getTextByLanguage("Show Rule")}
              </Label>
              <Col sm='6 align-items-center d-flex'>
                <CustomInput
                  id="show_role"
                  type="switch"
                  checked={showRule}
                  onChange={() => { setShowRule(!showRule) }}
                />
              </Col>
            </Col>
          </FormGroup>
          <FormGroup row>
            <Label sm='6'>
              {getTextByLanguage("Prematch Spread")}
            </Label>
            <Col sm='6 align-items-center'>
              <Select
                options={spreadOptions}
                defaultValue={spreadOptions[0]}
                className="react-select"
                theme={selectThemeColors}
                classNamePrefix='select'
              />
            </Col>
          </FormGroup>
          <FormGroup row>
            <Label sm='6'>
              {getTextByLanguage("Live Spread")}
            </Label>
            <Col sm='6 align-items-center'>
              <Select
                options={spreadOptions}
                defaultValue={spreadOptions[0]}
                className="react-select"
                theme={selectThemeColors}
                classNamePrefix='select'
              />
            </Col>
          </FormGroup>
          <FormGroup row>
            <Label sm='6'>
              {getTextByLanguage("Mix Spread")}
            </Label>
            <Col sm='6 align-items-center'>
              <Select
                options={spreadOptions}
                defaultValue={spreadOptions[0]}
                className="react-select"
                theme={selectThemeColors}
                classNamePrefix='select'
              />
            </Col>
          </FormGroup>
          <FormGroup row>
            <Label sm='6'>
              {getTextByLanguage("Account level")}
            </Label>
            <Col sm='6 align-items-center'>
              <Select
                onChange={e => { setAccountLevel(e) }}
                defaultValue={accountLevel}
                options={levelOptions}
                className="react-select"
                theme={selectThemeColors}
                classNamePrefix='select'
              />
            </Col>
          </FormGroup>
          <hr className="row" style={{ borderTop: "2px solid #fff" }}></hr>
        </ModalBody>
        <ModalFooter className="m-auto border-0">
          <Button color='primary' className="save" onClick={e => { saveUserInfo() }}>
            {getTextByLanguage("Save")}
          </Button>
          <Button color='primary' className="cancel" onClick={e => { cancelUserInfo() }}>
            {getTextByLanguage("Cancel")}
          </Button>
        </ModalFooter>
      </Modal>

      <Modal isOpen={isBalanceModal} toggle={() => setBalanceModal(!isBalanceModal)} className="balanceedit modal-lg modal-dialog-centered">
        <ModalHeader toggle={() => setBalanceModal(!isBalanceModal)}>
          <div className="left">
            <div className="logo-user pl-6">
              <h6>{getTextByLanguage("Edit credit")} {modalData ? modalData.userId : ""}</h6>
            </div>
          </div>
        </ModalHeader>
        <ModalBody className="useredit-form">
          <FormGroup row>
            <Label sm='6 align-items-center d-flex'>
              {getTextByLanguage("Weekly credit")}
            </Label>
            <Col sm='6 align-items-center d-flex'>
              <span>{modalData ? parseInt(modalData.autoWeeklyCredit ? modalData.autoWeeklyCredit : 0) + parseInt(modalData.extraCredit ? modalData.extraCredit : 0) : 0}</span>
            </Col>
          </FormGroup>
          <FormGroup row>
            <Label sm='6 align-items-center d-flex'>
              {getTextByLanguage("Less credit")}
            </Label>
            <Col sm='6 align-items-center d-flex'>
              <span>{modalData ? modalData.balance : 0}</span>
            </Col>
          </FormGroup>
          <FormGroup row>
            <Label sm='6 align-items-center d-flex'>
              {getTextByLanguage("Extra credit")}
            </Label>
            <Col sm='6 align-items-center d-flex'>
              <span>{modalData ? modalData.extraCredit : 0}</span>
            </Col>
          </FormGroup>
          <FormGroup row>
            <Label sm='6'>
              {getTextByLanguage("Platform Commission")}
            </Label>
            <Col sm='6 align-items-center d-flex'>
              <Input type="number" value={modalData ? modalData.platformCommission : 0} disable='true' readOnly={true} />
            </Col>
          </FormGroup>
          <FormGroup row>
            <Label sm='6'>
              {getTextByLanguage("Agent Commission %")}
            </Label>
            <Col sm='6 align-items-center d-flex'>
              <Input type="number" value={agentCommission} onChange={e => { setAgentCommission(e.target.value) }} />
            </Col>
          </FormGroup>
          <FormGroup row>
            <Label sm='6'>
              {getTextByLanguage("Agent Commission")}
            </Label>
            <Col sm='6 align-items-center d-flex'>
              <Input type="number" value={modalData ? (agentCommission * modalData.balance * 0.01) : 0} disable='true' readOnly={true} />
            </Col>
          </FormGroup>
          <FormGroup row>
            <Label sm='6 align-items-center d-flex'>
              {getTextByLanguage("Auto weekly credit")}
            </Label>
            <Col sm='6 align-items-center d-flex'>
              <Input type="number" value={autoWeeklyCredit} onChange={e => { setAutoWeeklyCredit(e.target.value) }} />
            </Col>
          </FormGroup>
          <FormGroup row>
            <Label sm='6 align-items-center d-flex'>
              {getTextByLanguage("Add extra credit")}
            </Label>
            <Col sm='6 align-items-center d-flex'>
              <Input type="number" value={extraCredit} onChange={e => { setExtraCredit(e.target.value) }} />
            </Col>
          </FormGroup>
          <FormGroup row>
            <Label sm='6 align-items-center d-flex'>
              {getTextByLanguage("Withdrawal credit")}
            </Label>
            <Col sm='6 align-items-center d-flex'>
              <Input type="number" value={withdrawalCredit} onChange={e => { setWithdrawalCredit(e.target.value) }} />
            </Col>
          </FormGroup>
          <hr className="row" style={{ borderTop: "2px solid #fff" }}></hr>
        </ModalBody>
        <ModalFooter className="m-auto border-0">
          <Button color='primary' className="save" onClick={e => { saveUserBalance() }}>
            {getTextByLanguage("Save")}
          </Button>
          <Button color='primary' className="cancel" onClick={e => { cancelUserBalance() }}>
            {getTextByLanguage("Cancel")}
          </Button>
        </ModalFooter>
      </Modal>

      <CategoriesCmp />

      <div className="content-body">
        <Card className="b-team__list">
          <CardHeader >
            <div className="left">
              <h2 className="b-list m-auto px-5 py-1 transaction-title">{getTextByLanguage("Bet List")}</h2>
            </div>
          </CardHeader>
          <div className="title bet-list-t row m-0">
            <div className="col-3 d-flex justify-content-between align-items-center bet-list-select-options">
              <div className="gray-sel third">
                <Select
                  options={weekOptions}
                  defaultValue={weekOptions[0]}
                  className="react-select sbHolder"
                  theme={selectThemeColors}
                  classNamePrefix='select'
                  onChange={(e) => { setSelectedWeek(e) }}
                />
              </div>
              <div>
                <CustomInput type='checkbox' className='custom-control-Primary' id='Activem' label='Active Users' onClick={() => setActiveStatus(!activeStatus)} />
              </div>
            </div>
            <div className='col-5 d-flex justify-content-center align-items-center' >
              <div>
                <Button className={dataKind === 1 ? 'agent-history-switch btn-danger' : 'agent-history-switch'} onClick={() => changeKind(1)}>{getTextByLanguage("Sport")}</Button>
              </div>
              <div className='mx-1'>
                <Button className={dataKind === 2 ? 'agent-history-switch btn-danger' : 'agent-history-switch'} onClick={() => changeKind(2)}>{getTextByLanguage("Casino")}</Button>
              </div>
              <div>
                <Button className={dataKind === 3 ? 'agent-history-switch btn-danger' : 'agent-history-switch'} onClick={() => changeKind(3)}>{getTextByLanguage("All")}</Button>
              </div>
            </div>
            <div className="col-4 d-flex justify-content-between align-items-center bet-list-search">
              <div className="mr-1">
                {getTextByLanguage("Search Bet")}
              </div>
              <Input
                style={{ maxWidth: "200px" }}
                className="search-input mr-1"
                onChange={e => { setSearchUserName(e.target.value) }}
                type='text'
                placeholder={getTextByLanguage('User Name')}
              />
              <Button.Ripple className='btn-icon mr-1' style={{ borderRadius: "0px" }} onClick={e => { handleSearch() }}>
                <Search size={16} />
              </Button.Ripple>
            </div>
          </div>
          <CardBody className="b-team pt-0">
            {filterData.length > 0 ? (
              <React.Fragment>
                <DataTable
                  pagination
                  columns={tableColumns}
                  paginationPerPage={10}
                  className='react-dataTable'
                  paginationDefaultPage={currentPage + 1}
                  paginationComponent={CustomPagination}
                  data={filterData}
                  // sortIcon={<ChevronDown size={10} />}
                  expandableRowsHideExpander={true}
                  // expandableRows
                  // expandOnRowClicked
                  noHeader={true}
                />
              </React.Fragment>
            ) : ""}
          </CardBody>
        </Card>
      </div>
    </div>
  )
}

export default UserManageByAgent
