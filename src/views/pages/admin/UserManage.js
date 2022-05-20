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
  const [selectedWeek, setSelectedWeek] = useState({ value: 1 })
  const [searchUserName, setSearchUserName] = useState("")
  const [activeStatus, setActiveStatus] = useState(false)
  const [tableColumns, setTableColumns] = useState([])
  const [getTextByLanguage] = useTranslator()
  const [dataKind, setDataKind] = useState(1)
  const [expandTableData, setExpandTableData] = useState({})
  const [modalData, setModalData] = useState(null)
  const [isUserInfoModal, setUserInfoModal] = useState(false)
  const [isAccountDelete, setAccountDelete] = useState(false)
  const [accountLevel, setAccountLevel] = useState({ value: "normal", label: "Normal" })
  const [setting, setSetting] = useState({
    showRule: false,
    unlimitedMix: false,
    reschedule: false,
    blockLive: false,
    multiSession: false,
    danger: false,
    cashout: false,
    loginNotify: false,
    betNotify: {},
    maxBetPerGame: {},
    betLimitMin: {}
  })

  const [autoWeeklyCredit, setAutoWeeklyCredit] = useState(0)
  const [withdrawalCredit, setWithdrawalCredit] = useState(0)
  const [agentCommission, setAgentCommission] = useState(0)
  const [isBalanceModal, setBalanceModal] = useState(false)
  const [extraCredit, setExtraCredit] = useState(0)

  const [leftData, setLeftData] = useState({})
  const [rightData, setRightData] = useState({})
  const [leftWeek, setLeftWeek] = useState(1)
  const [rightWeek, setRightWeek] = useState(1)

  const weekOptions = [
    { value: '1', label: getTextByLanguage('Current week') },
    { value: '2', label: getTextByLanguage('Last week') },
    { value: '3', label: getTextByLanguage('Two weeks ago') },
    { value: '4', label: getTextByLanguage('Three weeks ago') },
    { value: '5', label: getTextByLanguage('Four weeks ago') }
  ]

  const spreadOptions = [
    { value: '0', label: getTextByLanguage('0') },
    { value: '10', label: getTextByLanguage('10') },
    { value: '12', label: getTextByLanguage('12') },
    { value: '14', label: getTextByLanguage('14') },
    { value: '16', label: getTextByLanguage('16') },
    { value: '18', label: getTextByLanguage('18') },
    { value: '19', label: getTextByLanguage('19') },
    { value: '20', label: getTextByLanguage('20') },
    { value: '21', label: getTextByLanguage('21') },
    { value: '22', label: getTextByLanguage('22') },
    { value: '23', label: getTextByLanguage('23') },
    { value: '24', label: getTextByLanguage('24') },
    { value: '25', label: getTextByLanguage('25') },
    { value: '26', label: getTextByLanguage('26') },
    { value: '27', label: getTextByLanguage('27') },
    { value: '28', label: getTextByLanguage('28') },
    { value: '29', label: getTextByLanguage('29') },
    { value: '30', label: getTextByLanguage('30') },
    { value: '31', label: getTextByLanguage('31') },
    { value: '32', label: getTextByLanguage('32') },
    { value: '33', label: getTextByLanguage('33') },
    { value: '34', label: getTextByLanguage('34') },
    { value: '35', label: getTextByLanguage('35') },
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
    { value: '100', label: getTextByLanguage('100') },
    { value: '110', label: getTextByLanguage('110') },
    { value: '120', label: getTextByLanguage('120') }
  ]

  const levelOptions = [
    { value: 'normal', label: getTextByLanguage('Normal') },
    { value: 'dangerous', label: getTextByLanguage('Dangerous') },
    { value: 'very_dangerous', label: getTextByLanguage('Very Dangerous') },
    { value: 'extra_dangerous', label: getTextByLanguage('Extra Dangerous') }
  ]

  const maxCountOptions = [
    { value: 1, label: 1 },
    { value: 2, label: 2 },
    { value: 3, label: 3 },
    { value: 4, label: 4 },
    { value: 5, label: 5 }
  ]

  const notifycationOptions = [
    { value: 500, label: 500 },
    { value: 1000, label: 1000 },
    { value: 1500, label: 1500 },
    { value: 2000, label: 2000 }
  ]

  const showUserInfoModal = (data) => {
    setModalData(data)
    if (data.setting) {
      setSetting(data.setting)
    }

    if (data.isOnline === "Blocked") {
      setAccountDelete(true)
    } else {
      setAccountDelete(false)
    }
    setUserInfoModal(!isUserInfoModal)
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
      maxBetLimit: modalData.maxBetLimit,
      delete: isAccountDelete,
      level: accountLevel.value,
      setting,
      update: modalData,
      updated: Date.now(),
      role: userData.role,
      filter: {
        status: activeStatus,
        week: selectedWeek
      }
    }
    console.log(request)
    const response = await Axios({
      endpoint: "/agent/update-user-mange",
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
        <span className={row.isOnline === 'Online' ? 'btn-success' : row.isOnline === 'Offline' ? 'btn-warning' : 'btn-danger'} style={{ cursor: "pointer", borderRadius: 20 }}>{row.isOnline}</span>
      )
    },
    {
      name: getTextByLanguage('Credit'),
      selector: "balance",
      sortable: true,
      minWidth: "50px",
      cell: row => (
        <span onClick={e => { showUserBalanceModal(row) }} style={{ cursor: "pointer" }}>{row.balance}</span>
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
      selector: "platformCommission",
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
        <span className={row.isOnline === 'Online' ? 'btn-success' : row.isOnline === 'Offline' ? 'btn-warning' : 'btn-danger'} style={{ cursor: "pointer", borderRadius: 20 }}>{row.isOnline}</span>
      )
    },
    {
      name: getTextByLanguage('Credit'),
      selector: "balance",
      sortable: true,
      minWidth: "50px",
      cell: row => (
        <span onClick={e => { showUserBalanceModal(row) }} style={{ cursor: "pointer" }}>{row.balance}</span>
      )
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
      selector: "platformCommission",
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
        <span className={row.isOnline === 'Online' ? 'btn-success' : row.isOnline === 'Offline' ? 'btn-warning' : 'btn-danger'} style={{ cursor: "pointer", borderRadius: 20 }}>{row.isOnline}</span>
      )
    },
    {
      name: getTextByLanguage('Credit'),
      selector: "balance",
      sortable: true,
      minWidth: "50px",
      cell: row => (
        <span onClick={e => { showUserBalanceModal(row) }} style={{ cursor: "pointer" }}>{row.balance}</span>
      )
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
      selector: "platformCommission",
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
        setTableData(response.data.agent)
        setFilterData(response.data.agent)
        setExpandTableData(response.data.user)
        setIsLoading(false)
      } else {
        toast.error(getTextByLanguage(response.data))
        setIsLoading(true)
      }

      if (userData.role === 'agent') {
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
      setTableData(response.data.agent)
      setFilterData(response.data.agent)
      setExpandTableData(response.data.user)
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
      setTableData(response.data.agent)
      setFilterData(response.data.agent)
      setExpandTableData(response.data.user)
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

  const ExpandableTable = ({ data }) => {
    if (expandTableData[data["_id"]]) {
      const subData = expandTableData[data["_id"]]

      if (dataKind === 1) {
        return (
          <div>
            <div className="expand-table" style={{ width: "100%" }}>
              {subData.map((item, index) => {
                return (
                  <div className="expand-row sc-fzoLsD cPZdFe rdt_TableRow" key={index}>
                    <div className="sc-AxhCb sc-AxhUy sc-AxgMl iNQeVO rdt_TableCell">
                      <div>{item["_id"]}</div>
                    </div>
                    <div className="sc-AxhCb sc-AxhUy sc-AxgMl gbbhfF rdt_TableCell">
                      <div>
                        <span onClick={e => { showUserInfoModal(item) }} style={{ cursor: "pointer" }}>{item.username}</span>
                      </div>
                    </div>
                    <div className="sc-AxhCb sc-AxhUy sc-AxgMl gbbhfF rdt_TableCell">
                      <span className={item.isOnline === 'Online' ? 'btn-success' : item.isOnline === 'Offline' ? 'btn-warning' : 'btn-danger'} style={{ cursor: "pointer", borderRadius: 20 }}>{item.isOnline}</span>
                    </div>
                    <div className="sc-AxhCb sc-AxhUy sc-AxgMl gbbhfF rdt_TableCell">
                      <div>
                        <span onClick={e => { showUserBalanceModal(item) }} style={{ cursor: "pointer" }}>{item.credit}</span>
                      </div>
                    </div>
                    <div className="sc-AxhCb sc-AxhUy sc-AxgMl gbbhfF rdt_TableCell">
                      <div>{item["risk"]}</div>
                    </div>
                    <div className="sc-AxhCb sc-AxhUy sc-AxgMl gbbhfF rdt_TableCell">
                      <div>{item["openBets"]}</div>
                    </div>
                    <div className="sc-AxhCb sc-AxhUy sc-AxgMl gbbhfF rdt_TableCell">
                      <div>{item["closeBets"]}</div>
                    </div>
                    <div className="sc-AxhCb sc-AxhUy sc-AxgMl gbbhfF rdt_TableCell">
                      <div>{item["turnover"]}</div>
                    </div>
                    <div className="sc-AxhCb sc-AxhUy sc-AxgMl gbbhfF rdt_TableCell">
                      <div>{item["discount"]}</div>
                    </div>
                    <div className="sc-AxhCb sc-AxhUy sc-AxgMl gbbhfF rdt_TableCell">
                      <div>{item["total"]}</div>
                    </div>
                    <div className="sc-AxhCb sc-AxhUy sc-AxgMl gbbhfF rdt_TableCell">
                      <div>{item["totalNet"]}</div>
                    </div>
                    <div className="sc-AxhCb sc-AxhUy sc-AxgMl gbbhfF rdt_TableCell">
                      <div>{item["agentCommiPer"]}</div>
                    </div>
                    <div className="sc-AxhCb sc-AxhUy sc-AxgMl gbbhfF rdt_TableCell">
                      <div>{item["platformCommi"]}</div>
                    </div>
                    <div className="sc-AxhCb sc-AxhUy sc-AxgMl gbbhfF rdt_TableCell">
                      <div>{item["agetnCommi"]}</div>
                    </div>
                    <div className="sc-AxhCb sc-AxhUy sc-AxgMl gbbhfF rdt_TableCell">
                      <div>{item["userId"]}</div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )
      } else if (dataKind === 2) {
        return (
          <div>
            <div className="expand-table" style={{ width: "100%" }}>
              {subData.map((item, index) => {
                return (
                  <div className="expand-row sc-fzoLsD cPZdFe rdt_TableRow" key={index}>
                    <div className="sc-AxhCb sc-AxhUy sc-AxgMl iNQeVO rdt_TableCell">
                      <div>{item["_id"]}</div>
                    </div>
                    <div className="sc-AxhCb sc-AxhUy sc-AxgMl gbbhfF rdt_TableCell">
                      <div>
                        <span onClick={e => { showUserInfoModal(item) }} style={{ cursor: "pointer" }}>{item.username}</span>
                      </div>
                    </div>
                    <div className="sc-AxhCb sc-AxhUy sc-AxgMl gbbhfF rdt_TableCell">
                      <span className={item.isOnline === 'Online' ? 'btn-success' : item.isOnline === 'Offline' ? 'btn-warning' : 'btn-danger'} style={{ cursor: "pointer", borderRadius: 20 }}>{item.isOnline}</span>
                    </div>
                    <div className="sc-AxhCb sc-AxhUy sc-AxgMl gbbhfF rdt_TableCell">
                      <div>
                        <span onClick={e => { showUserBalanceModal(item) }} style={{ cursor: "pointer" }}>{item.credit}</span>
                      </div>
                    </div>
                    <div className="sc-AxhCb sc-AxhUy sc-AxgMl gbbhfF rdt_TableCell">
                      <div>{item["total"]}</div>
                    </div>
                    <div className="sc-AxhCb sc-AxhUy sc-AxgMl gbbhfF rdt_TableCell">
                      <div>{item["discount"]}</div>
                    </div>
                    <div className="sc-AxhCb sc-AxhUy sc-AxgMl gbbhfF rdt_TableCell">
                      <div>{item["totalNet"]}</div>
                    </div>
                    <div className="sc-AxhCb sc-AxhUy sc-AxgMl gbbhfF rdt_TableCell">
                      <div>{item["agentCommiPer"]}</div>
                    </div>
                    <div className="sc-AxhCb sc-AxhUy sc-AxgMl gbbhfF rdt_TableCell">
                      <div>{item["platformCommi"]}</div>
                    </div>
                    <div className="sc-AxhCb sc-AxhUy sc-AxgMl gbbhfF rdt_TableCell">
                      <div>{item["agetnCommi"]}</div>
                    </div>
                    <div className="sc-AxhCb sc-AxhUy sc-AxgMl gbbhfF rdt_TableCell">
                      <div>{item["userId"]}</div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )
      } else {
        return (
          <div>
            <div className="expand-table" style={{ width: "100%" }}>
              {subData.map((item, index) => {
                return (
                  <div className="expand-row sc-fzoLsD cPZdFe rdt_TableRow" key={index}>
                    <div className="sc-AxhCb sc-AxhUy sc-AxgMl iNQeVO rdt_TableCell">
                      <div>{item["_id"]}</div>
                    </div>
                    <div className="sc-AxhCb sc-AxhUy sc-AxgMl gbbhfF rdt_TableCell">
                      <div>
                        <span onClick={e => { showUserInfoModal(item) }} style={{ cursor: "pointer" }}>{item.username}</span>
                      </div>
                    </div>
                    <div className="sc-AxhCb sc-AxhUy sc-AxgMl gbbhfF rdt_TableCell">
                      <span className={item.isOnline === 'Online' ? 'btn-success' : item.isOnline === 'Offline' ? 'btn-warning' : 'btn-danger'} style={{ cursor: "pointer", borderRadius: 20 }}>{item.isOnline}</span>
                    </div>
                    <div className="sc-AxhCb sc-AxhUy sc-AxgMl gbbhfF rdt_TableCell">
                      <div>
                        <span onClick={e => { showUserBalanceModal(item) }} style={{ cursor: "pointer" }}>{item.credit}</span>
                      </div>
                    </div>
                    <div className="sc-AxhCb sc-AxhUy sc-AxgMl gbbhfF rdt_TableCell">
                      <div>{item["turnover"]}</div>
                    </div>
                    <div className="sc-AxhCb sc-AxhUy sc-AxgMl gbbhfF rdt_TableCell">
                      <div>{item["total"]}</div>
                    </div>
                    <div className="sc-AxhCb sc-AxhUy sc-AxgMl gbbhfF rdt_TableCell">
                      <div>{item["discount"]}</div>
                    </div>
                    <div className="sc-AxhCb sc-AxhUy sc-AxgMl gbbhfF rdt_TableCell">
                      <div>{item["totalNet"]}</div>
                    </div>
                    <div className="sc-AxhCb sc-AxhUy sc-AxgMl gbbhfF rdt_TableCell">
                      <div>{item["agentCommiPer"]}</div>
                    </div>
                    <div className="sc-AxhCb sc-AxhUy sc-AxgMl gbbhfF rdt_TableCell">
                      <div>{item["platformCommi"]}</div>
                    </div>
                    <div className="sc-AxhCb sc-AxhUy sc-AxgMl gbbhfF rdt_TableCell">
                      <div>{item["agetnCommi"]}</div>
                    </div>
                    <div className="sc-AxhCb sc-AxhUy sc-AxgMl gbbhfF rdt_TableCell">
                      <div>{item["userId"]}</div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )
      }
    } else {
      return (
        <div>
        </div>
      )
    }
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
            <h2 className="new-player m-auto pl-6">{modalData ? modalData.userId : ""}</h2>
          </div>
        </ModalHeader>
        <ModalBody className="useredit-form">

          <FormGroup row>
            <Col sm='12' className='p-0'>
              <Label sm='12 wing-name'>
                <hr className='wing' />
                {getTextByLanguage("General Info")}
                <hr className='wing' />
              </Label>
              <Col sm='12 d-flex'>
                <Col sm='4'>
                  <Label>{getTextByLanguage("Name")}</Label>
                  <Input type="text" value={modalData ? modalData.username : ""} onChange={e => { setModalData({ ...modalData, ["username"]: e.target.value }) }} />
                </Col>
                <Col sm='4'>
                  <Label>{getTextByLanguage("New Password")}</Label>
                  <Input type="password" onChange={e => { setModalData({ ...modalData, ["newPassword"]: e.target.value }) }} />
                </Col>
                <Col sm='4'>
                  <Label>{getTextByLanguage("Confirm Password")}</Label>
                  <Input type="password" onChange={e => { setModalData({ ...modalData, ["confirmPassword"]: e.target.value }) }} />
                </Col>
              </Col>
            </Col>
          </FormGroup>

          <FormGroup row>
            <Col sm='12' className='p-0'>
              <Label sm='12 wing-name'>
                <hr className='wing' />
                {getTextByLanguage("Settings")}
                <hr className='wing' />
              </Label>
              <Col sm='12 row'>
                <Col sm='3 d-flex justify-content-between align-items-center'>
                  <Label sm='pl-0'>
                    {getTextByLanguage("Block")}
                  </Label>
                  <CustomInput
                    id="account_delete_id"
                    type="switch"
                    checked={isAccountDelete}
                    onChange={() => { setAccountDelete(!isAccountDelete) }}
                  />
                </Col>
                <Col sm='3 d-flex justify-content-between align-items-center'>
                  <Label sm='pl-0'>
                    {getTextByLanguage("Show Rule")}
                  </Label>
                  <CustomInput
                    id="show_rule"
                    type="checkbox"
                    checked={setting.showRule}
                    onChange={() => { setSetting({ ...setting, showRule: !setting.showRule }) }}
                  />
                </Col>
                <Col sm='3 d-flex justify-content-between align-items-center'>
                  <Label sm='pl-0'>
                    {getTextByLanguage("Unlimited Mix")}
                  </Label>
                  <CustomInput
                    id="Unlimited"
                    type="checkbox"
                    checked={setting.unlimitedMix}
                    onChange={() => { setSetting({ ...setting, unlimitedMix: !setting.unlimitedMix }) }}
                  />
                </Col>
                <Col sm='3 d-flex justify-content-between align-items-center'>
                  <Label sm='pl-0'>
                    {getTextByLanguage("Include Reschedule")}
                  </Label>
                  <CustomInput
                    id="Reschedule"
                    type="checkbox"
                    checked={setting.reschedule}
                    onChange={() => { setSetting({ ...setting, reschedule: !setting.reschedule }) }}
                  />
                </Col>
                <Col sm='3 d-flex justify-content-between align-items-center'>
                  <Label sm='pl-0'>
                    {getTextByLanguage("Blocked From Live")}
                  </Label>
                  <CustomInput
                    id="Blocked"
                    type="checkbox"
                    checked={setting.blockLive}
                    onChange={() => { setSetting({ ...setting, blockLive: !setting.blockLive }) }}
                  />
                </Col>
                <Col sm='3 d-flex justify-content-between align-items-center'>
                  <Label sm='pl-0'>
                    {getTextByLanguage("Allow multi-session")}
                  </Label>
                  <CustomInput
                    id="multi-session"
                    type="checkbox"
                    checked={setting.multiSession}
                    onChange={() => { setSetting({ ...setting, multiSession: !setting.multiSession }) }}
                  />
                </Col>
                <Col sm='3 d-flex justify-content-between align-items-center'>
                  <Label sm='pl-0'>
                    {getTextByLanguage("User Dangerous")}
                  </Label>
                  <CustomInput
                    id="Dangerous"
                    type="checkbox"
                    checked={setting.dangerous}
                    onChange={() => { setSetting({ ...setting, dangerous: !setting.dangerous }) }}
                  />
                </Col>
                <Col sm='3 d-flex justify-content-between align-items-center'>
                  <Label sm='pl-0'>
                    {getTextByLanguage("Allow Cashout ")}
                  </Label>
                  <CustomInput
                    id="Cashout"
                    type="checkbox"
                    checked={setting.cashout}
                    onChange={() => { setSetting({ ...setting, cashout: !setting.cashout }) }}
                  />
                </Col>
                <Col sm='3 d-flex justify-content-between align-items-center'>
                  <Label sm='pl-0'>
                    {getTextByLanguage("Login Notification ")}
                  </Label>
                  <CustomInput
                    id="Notification"
                    type="checkbox"
                    checked={setting.loginNotify}
                    onChange={() => { setSetting({ ...setting, loginNotify: !setting.loginNotify }) }}
                  />
                </Col>
              </Col>
            </Col>
          </FormGroup>

          <FormGroup row>
            <Col sm='4 d-flex justify-content-between align-items-center'>
              <Label sm='p-0'>
                {getTextByLanguage("Max Bets Per Game")}
              </Label>
              <Select
                options={maxCountOptions}
                defaultValue={setting.maxBetPerGame}
                className="react-select w-40"
                theme={selectThemeColors}
                classNamePrefix='select'
                onChange={e => { setSetting({ ...setting, maxBetPerGame: e }) }}
              />
            </Col>
            <Col sm='4 d-flex justify-content-between align-items-center'>
              <Label sm='p-0'>
                {getTextByLanguage("Bet Limit Minimum")}
              </Label>
              <Select
                options={maxCountOptions}
                defaultValue={setting.betLimitMin}
                className="react-select w-40"
                theme={selectThemeColors}
                classNamePrefix='select'
                onChange={e => { setSetting({ ...setting, betLimitMin: e }) }}
              />
            </Col>
            <Col sm='4 d-flex justify-content-between align-items-center'>
              <Label sm='p-0'>
                {getTextByLanguage("Bet Notification")}
              </Label>
              <Select
                options={notifycationOptions}
                defaultValue={setting.betNotify}
                className="react-select w-50"
                theme={selectThemeColors}
                classNamePrefix='select'
                onChange={e => { setSetting({ ...setting, betNotify: e }) }}
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

          <FormGroup row>
            <Label sm='6'>
              {getTextByLanguage("Max per match limit")}
            </Label>
            <Col sm='6 align-items-center d-flex'>
              <Input type="number" value={modalData ? modalData.maxBetLimit : ""} onChange={e => { setModalData({ ...modalData, ["maxBetLimit"]: e.target.value }) }} />
            </Col>
          </FormGroup>

          <FormGroup row className='pt-1'>
            <Col sm='12 p-0'>
              <Label sm='12 wing-name'>
                <hr className='wing' />
                {getTextByLanguage("Spreads")}
                <hr className='wing' />
              </Label>
              <Col sm='12 d-flex'>
                <Col sm='4 d-flex align-items-center justify-content-between'>
                  <Label>{getTextByLanguage("Prematch Spread")}</Label>
                  <Select
                    options={spreadOptions}
                    defaultValue={modalData ? modalData.prematchSpread : spreadOptions[0]}
                    className="react-select w-50"
                    theme={selectThemeColors}
                    classNamePrefix='select'
                    onChange={e => { setModalData({ ...modalData, spreadOptions: e }) }}
                  />
                </Col>
                <Col sm='4 d-flex align-items-center justify-content-between'>
                  <Label> {getTextByLanguage("Live Spread")}</Label>
                  <Select
                    options={spreadOptions}
                    defaultValue={modalData ? modalData.liveSpread : spreadOptions[0]}
                    className="react-select w-50"
                    theme={selectThemeColors}
                    classNamePrefix='select'
                    onChange={e => { setModalData({ ...modalData, liveSpread: e }) }}
                  />
                </Col>
                <Col sm='4 d-flex align-items-center justify-content-between'>
                  <Label>{getTextByLanguage("Mix Spread")}</Label>
                  <Select
                    options={spreadOptions}
                    defaultValue={modalData ? modalData.mixSpread : spreadOptions[0]}
                    className="react-select w-50"
                    theme={selectThemeColors}
                    classNamePrefix='select'
                    onChange={e => { setModalData({ ...modalData, mixSpread: e }) }}
                  />
                </Col>
              </Col>
            </Col>
          </FormGroup>

          <FormGroup row className='py-1'>
            <Col sm='12' className='p-0'>
              <Label sm='12 wing-name'>
                <hr className='wing' />
                {getTextByLanguage("Ratios")}
                <hr className='wing' />
              </Label>
              <Col sm='12 d-flex'>
                <Col sm='4 d-flex align-items-center justify-content-between'>
                  <Label>{getTextByLanguage("1x2 Ratio")}</Label>
                  <Input type="number" value={modalData ? modalData.ratio : 0} className='w-50' onChange={e => { setModalData({ ...modalData, ratio: e.target.value }) }} />
                </Col>
                <Col sm='4 d-flex align-items-center justify-content-between'>
                  <Label> {getTextByLanguage("1x2 Ratio live")}</Label>
                  <Input type="number" value={modalData ? modalData.ratioLive : 0} className='w-50' onChange={e => { setModalData({ ...modalData, ratioLive: e.target.value }) }} />
                </Col>
                <Col sm='4 d-flex align-items-center justify-content-between'>
                  <Label>{getTextByLanguage("Ratio Spacial ")}</Label>
                  <Input type="number" value={modalData ? modalData.ratioSpacial : 0} className='w-50' onChange={e => { setModalData({ ...modalData, ratioSpacial: e.target.value }) }} />
                </Col>
              </Col>
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
              <h2 className="b-list m-auto px-5 py-1 transaction-title">{getTextByLanguage("User Management")}</h2>
            </div>
          </CardHeader>
          <div className="title bet-list-t row m-0">
            <div className="col-3 d-flex justify-content-between align-items-center bet-list-select-options">
              <div>
                <CustomInput type='checkbox' className='custom-control-Primary' id='Activem' label='Active Users' onClick={() => setActiveStatus(!activeStatus)} />
              </div>
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
                  // pagination
                  // paginationPerPage={10}
                  // paginationDefaultPage={currentPage + 1}
                  // paginationComponent={CustomPagination}
                  sortIcon={<ChevronDown size={5} />}
                  columns={tableColumns}
                  data={filterData}
                  expandableRowsHideExpander={true}
                  expandableRows
                  expandOnRowClicked
                  expandableRowsComponent={<ExpandableTable history={filterData} />}
                  noHeader={true}
                  expandableRowExpanded={(row) => true}
                  className='react-dataTable'
                />
              </React.Fragment>
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

export default UserManageByAgent
