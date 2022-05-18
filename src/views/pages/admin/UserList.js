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
  const userData = useSelector((state) => state.auth.userData)
  const dispatch = useDispatch()
  const [getTextByLanguage] = useTranslator()
  const [switchList, setSwitchList] = useState('U')
  const [currentPage, setCurrentPage] = useState(0)
  const [tableData, setTableData] = useState([])
  const [filterData, setFilterData] = useState([])
  const [isBalanceModal, setBalanceModal] = useState(false)
  const [isUserInfoModal, setUserInfoModal] = useState(false)
  const [isAccountDelete, setAccountDelete] = useState(false)
  const [showRule, setShowRule] = useState(false)
  const [isAgentDelete, setAgentDelete] = useState(false)
  const [accountLevel, setAccountLevel] = useState({ value: "normal", label: "Normal" })
  const [modalData, setModalData] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isMoveState, setMoveState] = useState(false)
  const [betStatus, setBetStatus] = useState("open")
  const [selectedWeek, setSelectedWeek] = useState(1)
  const [selectedUser, setSelectedUser] = useState(null)
  const [extraCredit, setExtraCredit] = useState(0)
  const [autoWeeklyCredit, setAutoWeeklyCredit] = useState(0)
  const [withdrawalCredit, setWithdrawalCredit] = useState(0)
  const [tableColumns, setTableColumns] = useState([])

  const [agentExtraCredit, setAgentExtraCredit] = useState(0)
  const [isAgentInfoModal, setAgentInfoModal] = useState(false)
  const [isAgentBalanceModal, setAgentBalanceModal] = useState(false)
  const [autoWeeklyCreditAgent, setAutoWeeklyCreditAgent] = useState(0)
  const [withdrawalCreditAgent, setWithdrawalCreditAgent] = useState(0)
  const [weeklyCreditResetDay, setWeeklyCreditResetDay] = useState({ value: '2', label: getTextByLanguage('Tuesday') })
  const [weeklyCreditResetState, setWeeklyCreditResetState] = useState({ value: 'false', label: getTextByLanguage('No') })
  const [leftData, setLeftData] = useState({})
  const [rightData, setRightData] = useState({})
  const [leftWeek, setLeftWeek] = useState(1)
  const [rightWeek, setRightWeek] = useState(1)
  const [agentCommission, setAgentCommission] = useState(0)
  const [platformCommission, setPlatformCommission] = useState(0)
  const [sportsCommission, setSportsCommission] = useState(0)
  const [casinoCommission, setCasinoCommission] = useState(0)

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

  const permition = [
    { value: 'Agent', label: getTextByLanguage('Agent') },
    { value: 'User', label: getTextByLanguage('User') }
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
      containerClassName='pagination react-paginate separated-pagination pagination-sm justify-content-end pr-1 mt-1'
    />
  )

  const handleLoginUser = (data) => {
    localStorage.setItem("subData", JSON.stringify(userData))
    localStorage.setItem("userData", JSON.stringify(data))
    window.location.href = "/home"
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

  // functions for user data handl
  const showUserInfoModal = (data) => {
    setModalData(data)
    if (data.setting && data.setting.showRule) {
      setShowRule(data.setting.showRule)
    }
    setUserInfoModal(!isUserInfoModal)
  }

  const showBalanceModal = (data) => {
    setModalData(data)
    setAutoWeeklyCredit(data.autoWeeklyCredit ? data.autoWeeklyCredit : 0)
    setWithdrawalCredit(data.withdrawalCredit ? data.withdrawalCredit : 0)
    setAgentCommission(data.agentCommission ? data.agentCommission : 0)
    setBalanceModal(!isBalanceModal)
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
      showRule,
      level: accountLevel.value,
      updated: Date.now()
    }
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

  const handleCancel = () => {
    setUserInfoModal(!isUserInfoModal)
    setModalData(null)
  }

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
      agentCommission,
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

  const handleCancelBalance = () => {
    setBalanceModal(!isBalanceModal)
    setModalData(null)
  }

  // functions for agent data handl 

  const showAgentInfoModal = (data) => {
    setModalData(data)
    // setAccountLevel(data.level)
    setAgentInfoModal(!isAgentInfoModal)
  }

  const showAgentBalanceModal = (data) => {
    setWeeklyCreditResetDay(data.weeklyCreditResetDay ? data.weeklyCreditResetDay : { value: '2', label: getTextByLanguage('Tuesday') })
    setWeeklyCreditResetState(data.weeklyCreditResetState ? data.weeklyCreditResetState : { value: 'false', label: getTextByLanguage('No') })
    setAutoWeeklyCreditAgent(data.autoWeeklyCredit ? data.autoWeeklyCredit : 0)
    setWithdrawalCreditAgent(data.withdrawalCredit ? data.withdrawalCredit : 0)
    setPlatformCommission(data.platformCommission ? data.platformCommission : 0)
    setSportsCommission(data.sportsCommission ? data.sportsCommission : 0)
    setCasinoCommission(data.casinoCommission ? data.casinoCommission : 0)
    setModalData(data)
    setAgentBalanceModal(!isAgentBalanceModal)
  }

  const handleAgentSave = async () => {
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
      delete: isAgentDelete,
      level: accountLevel.value,
      updated: Date.now()
    }
    const response = await Axios({
      endpoint: "/agent/update-user",
      method: "POST",
      params: request
    })
    if (response.status === 200) {
      setAgentInfoModal(!isAgentInfoModal)
      const response = await Axios({
        endpoint: "/agent/get",
        method: "POST",
        params: {
          userId: userData.userId,
          _id: userData._id
        }
      })
      if (response.status === 200) {
        setTableData(response.data)
        setFilterData(response.data)
        toast.success(getTextByLanguage("success"))
      }
      setIsLoading(false)
    } else {
      toast.error(getTextByLanguage(response.data))
      setIsLoading(true)
    }
  }

  const handleAgentCancel = () => {
    setAgentInfoModal(!isAgentInfoModal)
    setModalData(null)
  }

  const handleSaveAgentBalance = async () => {
    if (parseInt(extraCredit) > parseInt(userData.balance)) {
      toast.error(getTextByLanguage("Invalid amount"))
      return false
    }
    if (parseInt(extraCredit) < 0) {
      toast.error(getTextByLanguage("Invalid amount"))
      return false
    }
    const request = {
      ...modalData,
      weeklyCreditResetDay,
      weeklyCreditResetState,
      autoWeeklyCredit: autoWeeklyCreditAgent,
      extraCredit: agentExtraCredit,
      withdrawalCredit: withdrawalCreditAgent,
      sportsCommission,
      casinoCommission,
      userId: modalData._id,
      created: Date.now()
    }
    request.platformCommission = platformCommission

    const response = await Axios({
      endpoint: "/agent/update-balance",
      method: "POST",
      params: request
    })

    if (response.status === 200) {
      setFilterData(response.data.tableData)
      setAgentBalanceModal(!isAgentBalanceModal)
      dispatch(handleSession(response.data.userData))
      toast.success(getTextByLanguage("success"))
    } else {
      toast.error(getTextByLanguage(response.data))
    }
  }

  const handleCancelAgentBalance = () => {
    setAgentBalanceModal(!isAgentBalanceModal)
    setModalData(null)
  }

  const userTableColumns = [
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

  const agentTableColumns = [
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
            <span style={{ cursor: "pointer" }} onClick={e => { showAgentBalanceModal(row) }}>{row.balance}</span>
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

  const weekOptions = [
    { value: '1', label: getTextByLanguage('Current week') },
    { value: '2', label: getTextByLanguage('Last week') },
    { value: '3', label: getTextByLanguage('Two weeks ago') },
    { value: '4', label: getTextByLanguage('Three weeks ago') },
    { value: '5', label: getTextByLanguage('Four weeks ago') }
  ]

  const handleSelectLeft = async (value) => {
    const responseAgent = await Axios({
      endpoint: "/agent/agent-info-lf",
      method: "POST",
      params: { agentId: userData._id, week: value }
    })
    if (responseAgent.status === 200) {
      setLeftData(responseAgent.data)
      setLeftWeek(value)
    } else {
      toast.error(getTextByLanguage(response.data))
    }
  }

  const handleSelectRight = async (value) => {
    const responseAgent = await Axios({
      endpoint: "/agent/agent-info-rg",
      method: "POST",
      params: { agentId: userData._id, week: value }
    })
    if (responseAgent.status === 200) {
      setRightData(responseAgent.data)
      setRightWeek(value)
    } else {
      toast.error(getTextByLanguage(response.data))
    }
  }

  const switchListHandle = async (s) => {
    setFilterData([])
    setSwitchList(s)
    if (s === 'U') {
      setTableColumns(userTableColumns)
      const request = {
        _id: userData._id
      }
      const response = await Axios({
        endpoint: "/agent/get-users-all",
        method: "POST",
        params: request
      })
      if (response.status === 200) {
        setTableData(response.data)
        setFilterData(response.data)
        setIsLoading(false)
      } else {
        toast.error(getTextByLanguage(response.data))
        setIsLoading(true)
      }
    } else {
      setTableColumns(agentTableColumns)
      const request = {
        userId: userData.userId,
        _id: userData._id
      }
      const response = await Axios({
        endpoint: "/agent/get",
        method: "POST",
        params: request
      })
      if (response.status === 200) {
        setTableData(response.data)
        setFilterData(response.data)
      } else {
        toast.error(getTextByLanguage(response.data))
      }
    }
  }

  useEffect(async () => {
    setTableColumns(userTableColumns)
    setSwitchList('U')

    if (userData.role === 'agent') {
      const request = {
        _id: userData._id
      }
      const response = await Axios({
        endpoint: "/agent/get-users",
        method: "POST",
        params: request
      })
      if (response.status === 200) {
        setTableData(response.data)
        setFilterData(response.data)
        setIsLoading(false)
      } else {
        toast.error(getTextByLanguage(response.data))
        setIsLoading(true)
      }
      const responseLf = await Axios({
        endpoint: "/agent/agent-info-lf",
        method: "POST",
        params: { agentId: userData._id, week: leftWeek }
      })
      console.log(responseLf)
      if (responseLf.status === 200) {
        setLeftData(responseLf.data)
      } else {
        toast.error(getTextByLanguage(responseLf.data))
      }

      const responseRg = await Axios({
        endpoint: "/agent/agent-info-rg",
        method: "POST",
        params: { agentId: userData._id, week: rightWeek }
      })
      console.log(responseRg)
      if (responseRg.status === 200) {
        setRightData(responseRg.data)
      } else {
        toast.error(getTextByLanguage(responseRg.data))
      }
    } else {
      const request = {
        _id: userData._id
      }
      const response = await Axios({
        endpoint: "/agent/get-users-all",
        method: "POST",
        params: request
      })
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
            <Col sm='6' className='d-flex pl-0'>
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
          <Button color='primary' className="save" onClick={e => { handleSaveBalance() }}>
            {getTextByLanguage("Save")}
          </Button>
          <Button color='primary' className="cancel" onClick={e => { handleCancelBalance() }}>
            {getTextByLanguage("Cancel")}
          </Button>
        </ModalFooter>
      </Modal>
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
          <FormGroup row>
            <Label sm='6'>
              {getTextByLanguage("Delete")}
            </Label>
            <Col sm='6 align-items-center d-flex'>
              <CustomInput
                id="account_delete_id"
                type="switch"
                checked={isAgentDelete}
                onChange={() => { setAgentDelete(!isAgentDelete) }}
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
          <Button color='primary' className="save" onClick={e => { handleAgentSave() }}>
            {getTextByLanguage("Save")}
          </Button>
          <Button color='primary' className="cancel" onClick={e => { handleAgentCancel() }}>
            {getTextByLanguage("Cancel")}
          </Button>
        </ModalFooter>
      </Modal>
      <Modal isOpen={isAgentBalanceModal} toggle={() => setAgentBalanceModal(!isAgentBalanceModal)} className="balanceedit modal-lg modal-dialog-centered">
        <ModalHeader toggle={() => setAgentBalanceModal(!isAgentBalanceModal)}>
          <div className="left">
            <div className="logo-user">
              <h6>{getTextByLanguage("Balance")}</h6>
            </div>
          </div>
        </ModalHeader>
        <ModalBody className="useredit-form">
          <FormGroup row>
            <Col sm='6' className='d-flex p-0'>
              <Label sm='6 align-items-center d-flex'>
                {getTextByLanguage("Weekly credit")}
              </Label>
              <Col sm='6 align-items-center d-flex'>
                <span>{modalData ? parseInt(modalData.autoWeeklyCredit ? modalData.autoWeeklyCredit : 0) + parseInt(modalData.extraCredit ? modalData.extraCredit : 0) : 0}</span>
              </Col>
            </Col>
            <Col sm='6' className='d-flex p-0'>
              <Label sm='6 align-items-center d-flex'>
                {getTextByLanguage("Less credit")}
              </Label>
              <Col sm='6 align-items-center d-flex'>
                <span>{modalData ? modalData.balance : 0}</span>
              </Col>
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
          <FormGroup row className='py-1'>
            <Col sm='12' className='p-0'>
              <Label sm='12 wing-name'>
                <hr className='wing' />
                {getTextByLanguage("Credits")}
                <hr className='wing' />
              </Label>
              <Col sm='12 d-flex'>
                <Col sm='4'>
                  <Label>{getTextByLanguage("Auto weekly credit")}</Label>
                  <Input type="number" value={autoWeeklyCreditAgent} onChange={e => { setAutoWeeklyCreditAgent(e.target.value) }} />
                </Col>
                <Col sm='4'>
                  <Label> {getTextByLanguage("Add extra credit")}</Label>
                  <Input type="number" value={agentExtraCredit} onChange={e => { setAgentExtraCredit(e.target.value) }} />
                </Col>
                <Col sm='4'>
                  <Label>{getTextByLanguage("Withdrawal credit")}</Label>
                  <Input type="number" value={withdrawalCreditAgent} onChange={e => { setWithdrawalCreditAgent(e.target.value) }} />
                </Col>
              </Col>
            </Col>
          </FormGroup>

          <FormGroup row className='py-1'>
            <Col sm='12' className='p-0'>
              <Label sm='12 wing-name'>
                <hr className='wing' />
                {getTextByLanguage("Commissions")}
                <hr className='wing' />
              </Label>
              <Col sm='12 d-flex'>
                <Col sm='4'>
                  <Label>{getTextByLanguage("Platform Commission")}</Label>
                  <Input type="number" value={platformCommission} onChange={e => { setPlatformCommission(e.target.value) }} />
                </Col>
                <Col sm='4'>
                  <Label>{getTextByLanguage("Sports Commission")}</Label>
                  <Input type="number" value={sportsCommission} onChange={e => { setSportsCommission(e.target.value) }} />
                </Col>
                <Col sm='4'>
                  <Label>{getTextByLanguage("Casino Commission")}</Label>
                  <Input type="number" value={casinoCommission} onChange={e => { setCasinoCommission(e.target.value) }} />
                </Col>
              </Col>
            </Col>
          </FormGroup>

          <hr className="row" style={{ borderTop: "2px solid #fff" }}></hr>
        </ModalBody>
        <ModalFooter className="m-auto border-0">
          <Button color='primary' className="save" onClick={e => { handleSaveAgentBalance() }}>
            {getTextByLanguage("Save")}
          </Button>
          <Button color='primary' className="cancel" onClick={e => { handleCancelAgentBalance() }}>
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
            {
              userData && userData.role === 'admin' ? (
                <Col sm='4 align-items-center d-flex ch-permitoin-userlist'>
                  <Button className={switchList === 'U' ? 'w-50 ch-permitoin-btn btn-success' : 'w-50 ch-permitoin-btn'} onClick={() => switchListHandle('U')}>{getTextByLanguage("Users")}</Button>
                  <Button className={switchList === 'A' ? 'w-50 ch-permitoin-btn btn-success' : 'w-50 ch-permitoin-btn'} onClick={() => switchListHandle('A')}>{getTextByLanguage("Agents")}</Button>
                </Col>
              ) : null
            }
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
        {
          userData && userData.role === 'agent' ? (
            <Col sm='12' className='row m-0 p-0'>
              <Col sm='6' className='pl-0'>
                <Card >
                  <CardBody>
                    <Col sm='12' className='pb-2 m-0 px-0 row'>
                      <Select
                        options={weekOptions}
                        defaultValue={weekOptions[0]}
                        className="react-select sbHolder w-100"
                        theme={selectThemeColors}
                        classNamePrefix='select'
                        onChange={e => { handleSelectLeft(e) }}
                      />
                    </Col>
                    {
                      Object.keys(leftData).map((key, i) => (
                        <Col sm='12' className='tableRow d-flex' key={i}>
                          <span>{getTextByLanguage(leftData[key].label)}</span>
                          <span>{leftData[key].value}</span>
                        </Col>
                      ))
                    }
                  </CardBody>
                </Card>
              </Col>
              <Col sm='6' className='pr-0'>
                <Card >
                  <CardBody>
                    <Col sm='12' className='pb-2 m-0 px-0 row'>
                      <Select
                        options={weekOptions}
                        defaultValue={weekOptions[0]}
                        className="react-select sbHolder w-100"
                        theme={selectThemeColors}
                        classNamePrefix='select'
                        onChange={e => { handleSelectRight(e) }}
                      />
                    </Col>
                    {
                      Object.keys(rightData).map((key, i) => (
                        <Col sm='12' className='tableRow d-flex' key={i}>
                          <span>{getTextByLanguage(rightData[key].label)}</span>
                          <span>{rightData[key].value}</span>
                        </Col>
                      ))
                    }
                  </CardBody>
                </Card>
              </Col>
            </Col>
          ) : null
        }
      </div>
    </div>
  )
}

export default UserListCmp
