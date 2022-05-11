import React, { useEffect, useState } from 'react'
import { Card, CardHeader, CardBody, Col, Modal, ModalBody, ModalFooter, ModalHeader, Input, Button, FormGroup, Label, CustomInput } from 'reactstrap'
import Select from 'react-select'
import { selectThemeColors } from '@utils'
import { ChevronDown, LogIn, Lock } from 'react-feather'
import DataTable from 'react-data-table-component'
import ReactPaginate from 'react-paginate'
import CategoriesCmp from './Categories'
import Axios from '../../../utility/hooks/Axios'
import '@styles/react/libs/tables/react-dataTable-component.scss'
import { toast } from 'react-toastify'
import { useDispatch, useSelector } from 'react-redux'
import Spinner from "@components/spinner/Fallback-spinner"
import { handleSession } from '@store/actions/auth'
import moment from 'moment'
import { useTranslator } from '@hooks/useTranslator'
import BetList from "./BetList"

const UserListCmp = () => {

  const [currentPage, setCurrentPage] = useState(0)
  const [tableData, setTableData] = useState([])
  const [filterData, setFilterData] = useState([])
  const [isBalanceModal, setBalanceModal] = useState(false)
  const [isUserInfoModal, setUserInfoModal] = useState(false)
  const [isAccountDelete, setAccountDelete] = useState(false)
  const [accountLevel, setAccountLevel] = useState({ value: "normal", label: "Normal" })
  const userData = useSelector((state) => state.auth.userData)
  const [modalData, setModalData] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isMoveState, setMoveState] = useState(false)
  const [betStatus, setBetStatus] = useState("open")
  const [selectedWeek, setSelectedWeek] = useState(1)
  const [selectedUser, setSelectedUser] = useState(null)
  const [extraCredit, setExtraCredit] = useState(0)
  const [autoWeeklyCredit, setAutoWeeklyCredit] = useState(0)
  const [withdrawalCredit, setWithdrawalCredit] = useState(0)
  const dispatch = useDispatch()
  const [getTextByLanguage] = useTranslator()

  const levelOptions = [
    { value: 'normal', label: getTextByLanguage('Normal') },
    { value: 'dangerous', label: getTextByLanguage('Dangerous') },
    { value: 'very_dangerous', label: getTextByLanguage('Very Dangerous') },
    { value: 'extra_dangerous', label: getTextByLanguage('Extra Dangerous') }
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
      breakClassName='page-item'
      breakLinkClassName='page-link'
      containerClassName='pagination react-paginate separated-pagination pagination-sm justify-content-end pr-1 mt-1'
    />
  )

  const showBalanceModal = (data) => {
    setModalData(data)
    setAutoWeeklyCredit(data.autoWeeklyCredit ? data.autoWeeklyCredit : 0)
    setWithdrawalCredit(data.withdrawalCredit ? data.withdrawalCredit : 0)
    setBalanceModal(!isBalanceModal)
  }

  const showUserInfoModal = (data) => {
    console.log(data)
    setModalData(data)
    setUserInfoModal(!isUserInfoModal)
  }

  const handleLoginUser = (data) => {
    localStorage.setItem("subData", JSON.stringify(userData))
    localStorage.setItem("userData", JSON.stringify(data))
    window.location.href = "/home"
  }

  const goToOpenBets = (data) => {
    setBetStatus("pending")
    setSelectedUser(data)
    setMoveState(true)
  }

  const goToCloseBets = (data) => {
    setBetStatus("close")
    setSelectedUser(data)
    setMoveState(true)
  }

  const tableColumns = [
    {
      name: getTextByLanguage('ID'),
      selector: 'userId',
      sortable: true,
      cell: row => {
        return (
          <React.Fragment>
            <span className={row.level !== "normal" ? "dangerous-user" : "normal-user"} >{row.userId}</span>
          </React.Fragment>
        )
      }
    },
    {
      name: getTextByLanguage('Name'),
      selector: 'username',
      sortable: true,
      cell: row => {
        return (
          <React.Fragment>
            <span onClick={e => { showUserInfoModal(row) }} style={{ cursor: "pointer" }}>{row.username}</span>
          </React.Fragment>
        )
      }
    },
    {
      name: getTextByLanguage('Credit'),
      selector: 'balance',
      sortable: true,
      cell: row => {
        return (
          <React.Fragment>
            <span style={{ cursor: "pointer" }} onClick={e => { showBalanceModal(row) }}>{row.balance}</span>
          </React.Fragment>
        )
      }
    },
    {
      name: getTextByLanguage('Open bets'),
      selector: 'openBets',
      sortable: true,
      cell: row => {
        return (
          <React.Fragment>
            <span style={{ cursor: "pointer" }} onClick={e => { goToOpenBets(row) }}>{row.openBets}</span>
          </React.Fragment>
        )
      }
    },
    {
      name: getTextByLanguage('Closed bets'),
      selector: 'closeBets',
      sortable: true,
      cell: row => {
        return (
          <React.Fragment>
            <span style={{ cursor: "pointer" }} onClick={e => { goToCloseBets(row) }}>{row.closeBets}</span>
          </React.Fragment>
        )
      }
    },
    {
      name: getTextByLanguage(''),
      selector: 'agentShare',
      sortable: true,
      cell: row => {
        return (
          <React.Fragment>
            <span>{row.agentShare}%</span>
          </React.Fragment>
        )
      }
    },
    {
      name: getTextByLanguage('Company share'),
      selector: 'companyShare',
      sortable: true,
      cell: row => {
        return (
          <React.Fragment>
            <span>0</span>
          </React.Fragment>
        )
      }
    },
    {
      name: getTextByLanguage('Agent share'),
      selector: 'agentShare',
      sortable: true,
      cell: row => {
        return (
          <React.Fragment>
            <span>0</span>
          </React.Fragment>
        )
      }
    },
    {
      name: getTextByLanguage('Date'),
      selector: 'created',
      sortable: true,
      cell: row => {
        return (
          <span>{moment(row.created).format('HH:mm MM/DD/YYYY')}</span>
        )
      }
    },
    {
      name: 'Enter',
      allowOverflow: true,
      cell: row => {
        return (
          <div className='d-flex' style={{ cursor: "pointer" }} >
            <LogIn size={20} onClick={e => handleLoginUser(row)} />
          </div>
        )
      }
    }
  ]

  useEffect(async () => {
    const request = {
      _id: userData._id
    }
    const response = await Axios({
      endpoint: "/agent/get-users",
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
  }, [])

  const handleSaveBalance = async () => {
    // if (parseInt(modalData.amount) > parseInt(userData.balance) && userData.pid !== "0") {
    if ((parseInt(extraCredit) + parseInt(autoWeeklyCredit)) > parseInt(userData.balance)) {
      toast.error(getTextByLanguage("Invalid amount"))
      return false
    }
    // if (parseInt(modalData.extraCredit) + parseInt(modalData.balance) < 0) {
    if (parseInt(extraCredit) < 0) {
      toast.error(getTextByLanguage("Invalid amount"))
      return false
    }
    const request = {
      ...modalData,
      autoWeeklyCredit,
      extraCredit,
      withdrawalCredit,
      userId: modalData._id,
      created: Date.now()
    }
    const response = await Axios({
      endpoint: "/agent/update-balance",
      method: "POST",
      params: request
    })
    console.log(response)
    if (response.status === 200) {
      setTableData(response.data.tableData)
      setBalanceModal(!isBalanceModal)
      dispatch(handleSession(response.data.userData))
      toast.success(getTextByLanguage("success"))
    } else {
      toast.error(getTextByLanguage(response.data))
    }
  }

  const handleCancelBalance = () => {
    setBalanceModal(!isBalanceModal)
    setModalData(null)
  }

  const handleSave = async () => {
    if ((modalData.newPassword && modalData.confirmPassword) && modalData.newPassword !== modalData.confirmPassword) {
      toast.error(getTextByLanguage("Confirm new password"))
      return false
    } else if ((modalData.newPassword && modalData.confirmPassword) && modalData.newPassword === modalData.confirmPassword) {
      modalData.password = modalData.confirmPassword
    }
    const request = {
      agentId: userData._id,
      userId: modalData._id,
      username: modalData.username,
      password: modalData.password,
      maxBetLimit: modalData.maxBetLimit,
      delete: isAccountDelete,
      level: accountLevel.value,
      updated: Date.now()
    }
    const response = await Axios({
      endpoint: "/agent/update-user",
      method: "POST",
      params: request
    })
    console.log(response)
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

  const handleCancel = () => {
    setUserInfoModal(!isUserInfoModal)
    setModalData(null)
  }

  const handleSearch = (value) => {
    const result = []
    for (const i in tableData) {
      if (tableData[i].userId.indexOf(value) !== -1) {
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

  if (isMoveState) {
    return (
      <BetList week={selectedWeek} user={selectedUser} status={betStatus} />
    )
  }

  return (
    <div>
      <Modal isOpen={isUserInfoModal} toggle={() => setUserInfoModal(!isUserInfoModal)} className="balanceedit modal-lg modal-dialog-centered">
        <ModalHeader toggle={() => setUserInfoModal(!isUserInfoModal)}>
          <div className="left">
            <h2 className="new-player m-auto">{getTextByLanguage("Edit User ")}{modalData ? modalData.userId : ""}</h2>
          </div>
        </ModalHeader>
        <ModalBody className="useredit-form">
          <FormGroup row>
            <Label sm='6'>
              {getTextByLanguage("UserID")}
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
            <Label sm='6'>
              {getTextByLanguage("Delete")}
            </Label>
            <Col sm='6 align-items-center d-flex'>
              <CustomInput
                id="account_delete_id"
                type="switch"
                checked={isAccountDelete}
                onChange={() => { setAccountDelete(!isAccountDelete) }}
              />
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
          <Button color='primary' className="save" onClick={e => { handleSave() }}>
            {getTextByLanguage("Save")}
          </Button>
          <Button color='primary' className="cancel" onClick={e => { handleCancel() }}>
            {getTextByLanguage("Cancel")}
          </Button>
        </ModalFooter>
      </Modal>
      <Modal isOpen={isBalanceModal} toggle={() => setBalanceModal(!isBalanceModal)} className="balanceedit modal-lg modal-dialog-centered">
        <ModalHeader toggle={() => setBalanceModal(!isBalanceModal)}>
          <div className="left">
            <div className="logo-user">
              <h6>{getTextByLanguage("Edit credit")} - {modalData ? modalData.userId : ""}</h6>
            </div>
          </div>
        </ModalHeader>
        <ModalBody className="useredit-form">
          {/* <FormGroup row>
            <Label sm='6'>
              {getTextByLanguage("User Id")}
            </Label>
            <Col sm='6 align-items-center d-flex'>
              <span>{modalData ? modalData.userId : ""}</span>
            </Col>
          </FormGroup>
          <FormGroup row>
            <Label sm='6 align-items-center d-flex'>
              {getTextByLanguage("User Name")}
            </Label>
            <Col sm='6 align-items-center d-flex'>
              <span>{modalData ? modalData.username : ""}</span>
            </Col>
          </FormGroup> 
          <FormGroup row>
            <Label sm='6 align-items-center d-flex'>
              {getTextByLanguage("Amount")}
            </Label>
            <Col sm='6 align-items-center d-flex'>
              <Input type="number" value={modalData ? modalData.amount : 0} onChange={e => { setModalData({ ...modalData, ["amount"]: e.target.value }) }} />
            </Col>
          </FormGroup>
          <FormGroup row>
            <Label sm='6 align-items-center d-flex'>
              {getTextByLanguage("Currency")}
            </Label>
            <Col sm='6 align-items-center d-flex'>
              <span>{modalData ? modalData.currency : "TRY"}</span>
            </Col>
          </FormGroup>
          <FormGroup row>
            <Label sm='6 align-items-center d-flex'>
              {getTextByLanguage("Balance")}
            </Label>
            <Col sm='6 align-items-center d-flex'>
              <span>{modalData ? modalData.balance : 0}</span>
            </Col>
          </FormGroup>*/}
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
          <Button color='primary' className="save" onClick={e => { handleSaveBalance() }}>
            {getTextByLanguage("Save")}
          </Button>
          <Button color='primary' className="cancel" onClick={e => { handleCancelBalance() }}>
            {getTextByLanguage("Cancel")}
          </Button>
        </ModalFooter>
      </Modal>
      <CategoriesCmp />
      <div className="content-body">
        <Card className="b-team__list">
          <CardHeader >
            <div className="left">
              <h2 className="b-list m-auto px-5 py-1 transaction-title">{getTextByLanguage("User List")}</h2>
            </div>
            <div className="right">
              <Input
                onChange={e => { handleSearch(e.target.value) }}
                type='text'
                placeholder={getTextByLanguage("Search")}
              />
            </div>
          </CardHeader>
          <CardBody className="b-team pt-0">
            {filterData.length > 0 ? (
              <DataTable
                noHeader
                pagination
                columns={tableColumns}
                paginationPerPage={10}
                className='react-dataTable'
                sortIcon={<ChevronDown size={10} />}
                paginationDefaultPage={currentPage + 1}
                paginationComponent={CustomPagination}
                data={filterData}
              />
            ) : ""}
          </CardBody>
        </Card>
      </div>
    </div>
  )
}

export default UserListCmp
