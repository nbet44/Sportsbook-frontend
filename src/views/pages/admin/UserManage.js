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
import { useSelector } from 'react-redux'
import Axios from '../../../utility/hooks/Axios'
import Spinner from "@components/spinner/Fallback-spinner"
import { toast } from 'react-toastify'
import moment from 'moment'
import { useTranslator } from '@hooks/useTranslator'

const UserManageByAgent = () => {
  const [currentPage, setCurrentPage] = useState(0)
  const [isLoading, setIsLoading] = useState(true)
  const [tableData, setTableData] = useState([])
  const [filterData, setFilterData] = useState([])
  const [expandTableData, setExpandTableData] = useState(null)
  const userData = useSelector((state) => state.auth.userData)
  const [selectedWeek, setSelectedWeek] = useState(1)
  const [selectedStatus, setSelectedStatus] = useState("all")
  const [selectedSort, setSelectedSort] = useState("date")
  const [searchIdBet, setSearchIdBet] = useState("")
  const [searchMoneyLimit, setSearchMoneyLimit] = useState("")
  const [searchUserName, setSearchUserName] = useState("")
  const [isDetailsModal, setDetailsModal] = useState(false)
  const [activeStatus, setActiveStatus] = useState(false)
  const [modalData, setModalData] = useState(null)
  const [tableColumns, setTableColumns] = useState([])
  const [getTextByLanguage] = useTranslator()

  const weekOptions = [
    { value: '1', label: getTextByLanguage('Current week') },
    { value: '2', label: getTextByLanguage('Last week') },
    { value: '3', label: getTextByLanguage('Two weeks ago') },
    { value: '4', label: getTextByLanguage('Three weeks ago') },
    { value: '5', label: getTextByLanguage('Four weeks ago') }
  ]

  const [dataKind, setDataKind] = useState(1)

  const sportsColumns = [
    {
      name: getTextByLanguage('User ID'),
      selector: 'userId',
      minWidth: "50px",
      sortable: true
    },
    {
      name: getTextByLanguage('Status'),
      selector: 'status',
      minWidth: "50px"
    },
    {
      name: getTextByLanguage('Credit'),
      selector: "credit",
      sortable: true,
      minWidth: "50px"
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
      selector: "agetnCommiPer",
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
      selector: 'username',
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
      minWidth: "50px"
    },
    {
      name: getTextByLanguage('Status'),
      selector: 'status',
      minWidth: "50px"
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
      selector: "agetnCommiPer",
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
      selector: 'username',
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
      minWidth: "50px"
    },
    {
      name: getTextByLanguage('Status'),
      selector: 'status',
      minWidth: "50px"
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
      selector: "agetnCommiPer",
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
      selector: 'username',
      minWidth: "50px",
      sortable: true
    }
  ]
  useEffect(async () => {
    setTableColumns(sportsColumns)
    if (userData) {
      const request = {
        agentId: userData._id,
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

  const handleSelectOption = async (type, event) => {
    const value = event.value
    const filter = {
      status: type === "status" ? value : activeStatus,
      week: type === "week" ? value : selectedWeek
    }
    const request = {
      agentId: userData._id,
      filter
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
    if (type === "status") {
      setActiveStatus(value)
    }
    if (type === "week") {
      setSelectedWeek(value)
    }
  }

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
      {modalData ? (
        <Modal isOpen={isDetailsModal} toggle={() => setDetailsModal(!isDetailsModal)} className="changepassword modal-lg modal-dialog-centered">
          <ModalHeader toggle={() => setDetailsModal(!isDetailsModal)}>
            <div className="left">
              <div className="px-5 py-1 view-details">
                <h3>{getTextByLanguage("Details of a Bet")} {modalData.betId}</h3>
              </div>
            </div>
          </ModalHeader>
          <ModalBody className="useredit-form bet-list-details">
            <Col className="mb-1" sm='12'>
              <Label>
                {getTextByLanguage("UserId")}
              </Label>
              <span>{modalData.userId}</span>
            </Col>
            <Col className="mb-1" sm='12'>
              <Label>
                {getTextByLanguage("Username")}
              </Label>
              <span>{modalData.username}</span>
            </Col>
            <Col className="mb-1" sm='12'>
              <Label>
                {getTextByLanguage("Sport")}
              </Label>
              <span>{modalData.sport}</span>
            </Col>
            <Col className="mb-1" sm='12'>
              <Label>
                {getTextByLanguage("Odds")}
              </Label>
              <span>{modalData.odds}</span>
            </Col>
            <Col className="mb-1" sm='12'>
              <Label>
                {getTextByLanguage("Amount")}
              </Label>
              <span>{modalData.amount}</span>
            </Col>
            <Col className="mb-1" sm='12'>
              <Label>
                {getTextByLanguage("Result")}
              </Label>
              <span>{modalData.result}</span>
            </Col>
            <Col className="mb-1" sm='12'>
              <Label>
                {getTextByLanguage("Time")}
              </Label>
              <span>{moment(modalData.created).format('mm:HH/DD.M.YYYY')}</span>
            </Col>
            <Col className="mb-1" sm='12'>
              <Label>
                {getTextByLanguage("Description")}
              </Label>
              <span>{modalData.desc}</span>
            </Col>
          </ModalBody>
          <ModalFooter className="m-auto">
            <Button color='primary' className="cancel" onClick={e => { setDetailsModal(!isDetailsModal) }}>
              {getTextByLanguage("Cancel")}
            </Button>
          </ModalFooter>
        </Modal>
      ) : ""}

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
                  onChange={e => { handleSelectOption(e) }}
                />
              </div>
              <div>
                <CustomInput type='checkbox' className='custom-control-Primary' id='Activem' label='Active Users' />
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
