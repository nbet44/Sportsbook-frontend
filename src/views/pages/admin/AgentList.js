import React, { useEffect, useState } from 'react'
import {
  Card, CardHeader, CardBody, Col, Modal, ModalBody, ModalFooter, ModalHeader, Input, Button, FormGroup, Label, CustomInput
} from 'reactstrap'
import { ChevronDown, LogIn } from 'react-feather'
import Select from 'react-select'
import { selectThemeColors } from '@utils'
import DataTable from 'react-data-table-component'
import ReactPaginate from 'react-paginate'
import '@styles/react/libs/tables/react-dataTable-component.scss'
import CategoriesCmp from './Categories'
import Axios from '../../../utility/hooks/Axios'
import { toast } from 'react-toastify'
import Swal from 'sweetalert2'
import withReactContent from 'sweetalert2-react-content'
import { handleSession } from '@store/actions/auth'
const MySwal = withReactContent(Swal)
import moment from 'moment'
import { useTranslator } from '@hooks/useTranslator'

import 'animate.css/animate.css'
import '@styles/base/plugins/extensions/ext-component-sweet-alerts.scss'
import { useDispatch, useSelector } from 'react-redux'

const AgentListCmp = () => {

  const [currentPage, setCurrentPage] = useState(0)
  const [tableData, setTableData] = useState([])
  const [isBalanceModal, setBalanceModal] = useState(false)
  const [isAgentInfoModal, setAgentInfoModal] = useState(false)
  const [modalData, setModalData] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isAccountDelete, setAccountDelete] = useState(false)
  const [accountLevel, setAccountLevel] = useState({ value: "normal", label: "Normal" })
  const userData = useSelector((state) => state.auth.userData)
  const [extraCredit, setExtraCredit] = useState(0)
  const [autoWeeklyCredit, setAutoWeeklyCredit] = useState(0)
  const [withdrawalCredit, setWithdrawalCredit] = useState(0)
  const dispatch = useDispatch()
  const [getTextByLanguage] = useTranslator()
  const [weeklyCreditResetState, setWeeklyCreditResetState] = useState({ value: 'false', label: getTextByLanguage('No') })
  const [weeklyCreditResetDay, setWeeklyCreditResetDay] = useState({ value: '2', label: getTextByLanguage('Tuesday') })

  const levelOptions = [
    { value: 'normal', label: getTextByLanguage('Normal') },
    { value: 'dangerous', label: getTextByLanguage('Dangerous') },
    { value: 'very_dangerous', label: getTextByLanguage('Very Dangerous') },
    { value: 'extra_dangerous', label: getTextByLanguage('Extra Dangerous') }
  ]

  const weekOptions = [
    { value: '1', label: getTextByLanguage('Current week') },
    { value: '2', label: getTextByLanguage('Last week') },
    { value: '3', label: getTextByLanguage('Two weeks ago') },
    { value: '4', label: getTextByLanguage('Three weeks ago') },
    { value: '5', label: getTextByLanguage('Four weeks ago') },
    { value: '6', label: getTextByLanguage('Five weeks ago') },
    { value: '7', label: getTextByLanguage('Six weeks ago') },
    { value: '8', label: getTextByLanguage('Seven weeks ago') },
    { value: '9', label: getTextByLanguage('Eight weeks ago') }
  ]

  const resetStateOptions = [
    { value: 'true', label: getTextByLanguage('Yes') },
    { value: 'false', label: getTextByLanguage('No') }
  ]

  const resetDayOptions = [
    { value: '1', label: getTextByLanguage('Monday') },
    { value: '2', label: getTextByLanguage('Tuesday') },
    { value: '3', label: getTextByLanguage('Wednesday') },
    { value: '4', label: getTextByLanguage('Thursday') },
    { value: '5', label: getTextByLanguage('Friday') },
    { value: '6', label: getTextByLanguage('Saturday') },
    { value: '7', label: getTextByLanguage('Sunday') }
  ]

  const handleConfirmText = (row) => {
    return MySwal.fire({
      title: 'Are you sure?',
      text: "You won't be able to revert this!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, delete it!',
      customClass: {
        confirmButton: 'btn btn-primary',
        cancelButton: 'btn btn-outline-danger ml-1'
      },
      buttonsStyling: false
    }).then(async function (result) {
      if (result.value) {
        const request = {
          pid: userData._id,
          _id: row._id
        }
        const response = await Axios({
          endpoint: "/agent/remove",
          method: "POST",
          params: request
        })
        if (response.status === 200) {
          setTableData(response.data)
          MySwal.fire({
            icon: 'success',
            title: 'Deleted!',
            text: 'Your file has been deleted.',
            customClass: {
              confirmButton: 'btn btn-success'
            }
          })
        } else {
          toast.error(getTextByLanguage(response.data))
        }
      }
    })
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
      breakClassName='page-item'
      breakLinkClassName='page-link'
      containerClassName='pagination react-paginate separated-pagination pagination-sm justify-content-end pr-1 mt-1'
    />
  )

  const showBalanceModal = (data) => {
    setWeeklyCreditResetDay(data.weeklyCreditResetDay ? data.weeklyCreditResetDay : { value: '2', label: getTextByLanguage('Tuesday') })
    setWeeklyCreditResetState(data.weeklyCreditResetState ? data.weeklyCreditResetState : { value: 'false', label: getTextByLanguage('No') })
    setAutoWeeklyCredit(data.autoWeeklyCredit ? data.autoWeeklyCredit : 0)
    setWithdrawalCredit(data.withdrawalCredit ? data.withdrawalCredit : 0)
    setModalData(data)
    setBalanceModal(!isBalanceModal)
  }

  const showAgentInfoModal = (data) => {
    console.log(data)
    setModalData(data)
    // setAccountLevel(data.level)
    setAgentInfoModal(!isAgentInfoModal)
  }

  const handleLoginUser = (data) => {
    localStorage.setItem("subData", JSON.stringify(userData))
    localStorage.setItem("userData", JSON.stringify(data))
    window.location.href = "/home"
  }

  const handleSaveBalance = async () => {
    // if (parseInt(modalData.amount) > parseInt(userData.balance) && userData.pid !== "0") {
    // if (parseInt(modalData.amount) > parseInt(userData.balance)) {
    if (parseInt(extraCredit) > parseInt(userData.balance)) {
      toast.error(getTextByLanguage("Invalid amount"))
      return false
    }
    // if (parseInt(modalData.amount) + parseInt(modalData.balance) < 0) {
    if (parseInt(extraCredit) < 0) {
      toast.error(getTextByLanguage("Invalid amount"))
      return false
    }
    const request = {
      ...modalData,
      weeklyCreditResetDay,
      weeklyCreditResetState,
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
    if (response.status === 200) {
      setTableData(response.data.tableData)
      setBalanceModal(!isBalanceModal)
      dispatch(handleSession(response.data.userData))
      toast.success(getTextByLanguage("success"))
    } else {
      toast.error(getTextByLanguage(response.data))
    }
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
      userId: modalData.userId,
      username: modalData.username,
      password: modalData.password,
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
      setAgentInfoModal(!isAgentInfoModal)
      setTableData(response.data)
      setFilterData(response.data)
      toast.success(getTextByLanguage("success"))
      setIsLoading(false)
    } else {
      toast.error(getTextByLanguage(response.data))
      setIsLoading(true)
    }
  }

  const handleCancelBalance = () => {
    setBalanceModal(!isBalanceModal)
    setModalData(null)
  }

  const handleCancel = () => {
    setAgentInfoModal(!isAgentInfoModal)
    setModalData(null)
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
            <span onClick={e => { showAgentInfoModal(row) }} style={{ cursor: "pointer" }}>{row.username}</span>
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
    // {
    //   name: 'Actions',
    //   allowOverflow: true,
    //   cell: row => {
    //     return (
    //       <div className='d-flex' onClick={e => handleConfirmText(row)} style={{ cursor: "pointer" }} >
    //         <Trash size={20} />
    //       </div>
    //     )
    //   }
    // }
  ]

  useEffect(async () => {
    const request = {
      userId: userData.userId,
      _id: userData._id
    }
    const response = await Axios({
      endpoint: "/agent/get",
      method: "POST",
      params: request
    })
    console.log(response)
    if (response.status === 200) {
      setTableData(response.data)
    } else {
      toast.error(getTextByLanguage(response.data))
    }
  }, [])

  return (
    <div>
      <CategoriesCmp />
      <Modal isOpen={isAgentInfoModal} toggle={() => setAgentInfoModal(!isAgentInfoModal)} className="balanceedit modal-lg modal-dialog-centered">
        <ModalHeader toggle={() => setAgentInfoModal(!isAgentInfoModal)}>
          <div className="left">
            <h2 className="new-player m-auto">{getTextByLanguage("Edit ")}{modalData ? modalData.userId : ""}</h2>
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
          {/* <FormGroup row>
            <Label sm='6'>
              {getTextByLanguage("Max per match limit")}
            </Label>
            <Col sm='6 align-items-center d-flex'>
              <Input type="number" value={modalData ? modalData.maxBetLimit : ""} onChange={e => { setModalData({ ...modalData, ["maxBetLimit"]: e.target.value }) }} />
            </Col>
          </FormGroup> */}
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
              <h6>{getTextByLanguage("Balance")}</h6>
            </div>
          </div>
        </ModalHeader>
        <ModalBody className="useredit-form">
          {/* <FormGroup row>
            <Label sm='6'>
              {getTextByLanguage("Agent Id")}
            </Label>
            <Col sm='6 align-items-center d-flex'>
              <span>{modalData ? modalData.userId : ""}</span>
            </Col>
          </FormGroup>
          <FormGroup row>
            <Label sm='6 align-items-center d-flex'>
              {getTextByLanguage("Agent Name")}
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
          </FormGroup>*/}
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
          <FormGroup row>
            <Label sm='6 align-items-center d-flex'>
              {getTextByLanguage("Weekly balance reset")}
            </Label>
            <Col sm='6 align-items-center'>
              <Select
                options={resetStateOptions}
                className="react-select sbHolder"
                theme={selectThemeColors}
                classNamePrefix='select'
                defaultValue={weeklyCreditResetState}
                onChange={e => { setWeeklyCreditResetState(e) }}
              />
            </Col>
          </FormGroup>
          <FormGroup row>
            <Label sm='6 align-items-center d-flex'>
              {getTextByLanguage("Weekly balance reset day")}
            </Label>
            <Col sm='6 align-items-center'>
              <Select
                options={resetDayOptions}
                className="react-select sbHolder"
                theme={selectThemeColors}
                classNamePrefix='select'
                defaultValue={weeklyCreditResetDay}
                onChange={e => { setWeeklyCreditResetDay(e) }}
              />
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
      <div className="content-body">
        <Card className="b-team__list">
          <CardHeader >
            <div className="left">
              <h2 className="b-list m-auto px-5 py-1 transaction-title">{getTextByLanguage("Agent List")}</h2>
            </div>
          </CardHeader>
          {/* <div className="title bet-list-t">
            <div className="left">
              <div className="gray-sel third">
                <Select
                  options={options}
                  className="react-select sbHolder"
                  theme={selectThemeColors}
                  classNamePrefix='select'
                />
              </div>
              <div className="gray-sel third">
                <Select
                  options={options1}
                  className="react-select sbHolder"
                  theme={selectThemeColors}
                  classNamePrefix='select'
                />
              </div>
            </div>
          </div> */}
          <CardBody className="b-team pt-0">
            {tableData.length > 0 ? (
              <DataTable
                noHeader
                pagination
                columns={tableColumns}
                paginationPerPage={10}
                className='react-dataTable'
                sortIcon={<ChevronDown size={10} />}
                paginationDefaultPage={currentPage + 1}
                paginationComponent={CustomPagination}
                data={tableData}
              />
            ) : ""}
          </CardBody>
        </Card>
      </div>
    </div>
  )
}

export default AgentListCmp
