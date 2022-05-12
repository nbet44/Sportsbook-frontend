import React, { useEffect, useState } from 'react'
import {
  Col, Modal, ModalBody, ModalFooter, ModalHeader, Input, Button, FormGroup, Label,
  Card, CardHeader, CardBody
} from 'reactstrap'
import Select from 'react-select'
import { selectThemeColors } from '@utils'
import { ChevronDown, AlertCircle, Search } from 'react-feather'
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

const BetListCmp = (props) => {
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
  const [modalData, setModalData] = useState(null)
  const [getTextByLanguage] = useTranslator()

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

  const statusOptions = [
    { value: 'all', label: getTextByLanguage('All') },
    // { value: 'pending', label: getTextByLanguage('Pending') },
    { value: 'pending', label: getTextByLanguage('Open') },
    { value: 'close', label: getTextByLanguage('Close') },
    { value: 'win', label: getTextByLanguage('Win') },
    { value: 'lose', label: getTextByLanguage('Lose') },
    { value: 'cancel', label: getTextByLanguage('Cancel') },
    { value: 'reject', label: getTextByLanguage('Reject') }
  ]

  const sortOptions = [
    { value: 'date', label: getTextByLanguage('Date') },
    { value: 'result', label: getTextByLanguage('Result') }
  ]

  useEffect(async () => {
    if (props.user) {
      const request = {
        agentId: userData._id,
        filter: {
          userId: props.user._id,
          status: props.status,
          week: props.week,
          sort: selectedSort
        }
      }
      const response = await Axios({
        endpoint: "/sports/bet-history",
        method: "POST",
        params: request
      })
      console.log(response)
      if (response.status === 200) {
        setTableData(response.data.result)
        setFilterData(response.data.result)
        setExpandTableData(response.data.group)
        setIsLoading(false)
      } else {
        toast.error(getTextByLanguage(response.data))
        setIsLoading(true)
      }
    } else {
      const request = {
        agentId: userData._id,
        filter: {
          status: selectedStatus,
          week: selectedWeek,
          sort: selectedSort
        }
      }
      const response = await Axios({
        endpoint: "/sports/bet-history",
        method: "POST",
        params: request
      })
      console.log(response)
      if (response.status === 200) {
        setTableData(response.data.result)
        setFilterData(response.data.result)
        setExpandTableData(response.data.group)
        setIsLoading(false)
      } else {
        toast.error(getTextByLanguage(response.data))
        setIsLoading(true)
      }
    }
  }, [])

  const handleViewDetails = (row) => {
    setModalData(row)
    setDetailsModal(!isDetailsModal)
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
      status: type === "status" ? value : selectedStatus,
      week: type === "week" ? value : selectedWeek,
      sort: type === "sort" ? value : selectedSort
    }
    const request = {
      agentId: userData._id,
      filter
    }
    const response = await Axios({
      endpoint: "/sports/bet-history",
      method: "POST",
      params: request
    })
    console.log(response)
    if (response.status === 200) {
      setTableData(response.data.result)
      setFilterData(response.data.result)
      setExpandTableData(response.data.group)
      setIsLoading(false)
    } else {
      toast.error(getTextByLanguage(response.data))
      setIsLoading(true)
    }
    if (type === "status") {
      setSelectedStatus(value)
    }
    if (type === "week") {
      setSelectedWeek(value)
    }
    if (type === "sort") {
      setSelectedSort(value)
    }
  }

  const handleSearch = () => {
    const result = []
    for (const i in tableData) {
      if (tableData[i].betId.indexOf(searchIdBet) !== -1 && tableData[i].amount >= searchMoneyLimit && tableData[i].username.indexOf(searchUserName) !== -1) {
        result.push(tableData[i])
      }
    }
    setFilterData(result)
  }

  const tableColumns = [
    {
      name: getTextByLanguage('#ID'),
      selector: 'betId',
      minWidth: "50px",
      sortable: true
    },
    {
      name: getTextByLanguage('#UID'),
      selector: 'userId',
      minWidth: "50px",
      sortable: true
    },
    {
      name: getTextByLanguage('Name'),
      selector: 'username',
      minWidth: "50px",
      sortable: true
    },
    {
      name: getTextByLanguage('Time'),
      selector: 'created',
      minWidth: "50px",
      sortable: true,
      cell: row => {
        return (
          <div>
            {moment(row.created).format('mm:HH/DD.M.YYYY')}
          </div>
        )
      }
    },
    {
      name: getTextByLanguage('Sport'),
      selector: 'sport',
      minWidth: "50px",
      sortable: true
    },
    {
      name: getTextByLanguage('Description'),
      selector: 'desc',
      sortable: true,
      minWidth: "300px",
      cell: row => {
        return (
          <div>
            {getTextByLanguage(row.desc)}
          </div>
        )
      }
    },
    {
      name: '',
      minWidth: "50px",
      cell: row => {
        if (expandTableData[row["betId"]] && expandTableData[row["betId"]].length > 1) {
          return <></>
        } else {
          return (
            <span onClick={e => { handleViewDetails(row) }} style={{ cursor: "pointer" }}>
              <AlertCircle />
            </span>
          )
        }
      }
    },
    {
      name: getTextByLanguage('Odds'),
      selector: 'odds',
      sortable: true,
      minWidth: "50px"
    },
    {
      name: getTextByLanguage('Stake'),
      selector: "amount",
      sortable: true,
      minWidth: "50px"
    },
    {
      name: getTextByLanguage('Win'),
      selector: "winAmount",
      sortable: true,
      minWidth: "50px"
    },
    {
      name: getTextByLanguage('Result'),
      selector: 'result',
      sortable: true,
      minWidth: "50px"
    },
    {
      name: getTextByLanguage('Status'),
      selector: 'status',
      sortable: true,
      minWidth: "50px"
    }
    // {
    //   name: 'Action',
    //   cell: row => {
    //     <span></span>
    //   }
    // }
  ]

  const DataTableHeader = () => {
    return (
      <React.Fragment>
        <div>
          <div>text1</div>
        </div>
        <div>
          <div>text2</div>
        </div>
        <div>
          <div>text2</div>
        </div>
        <div>
          <div>text2</div>
        </div>
        <div>
          <div>text2</div>
        </div>
      </React.Fragment>
    )
  }

  const ExpandableTable = ({ data }) => {
    if (expandTableData[data["betId"]]) {
      const subData = expandTableData[data["betId"]]
      return (
        <div>
          <div className="expand-table" style={{ width: "100%" }}>
            {subData.map((item, index) => {
              return (
                <div className="expand-row sc-fzoLsD cPZdFe rdt_TableRow" key={index}>
                  <div className="sc-AxhCb sc-AxhUy sc-AxgMl iNQeVO rdt_TableCell">
                    <div>{item["betId"]}</div>
                  </div>
                  <div className="sc-AxhCb sc-AxhUy sc-AxgMl gbbhfF rdt_TableCell">
                    <div>{data["userId"]}</div>
                  </div>
                  <div className="sc-AxhCb sc-AxhUy sc-AxgMl gbbhfF rdt_TableCell">
                    <div>{data["username"]}</div>
                  </div>
                  <div className="sc-AxhCb sc-AxhUy sc-AxgMl gbbhfF rdt_TableCell">
                    <div>{moment(item["created"]).format('mm:HH/DD.M.YYYY')}</div>
                  </div>
                  <div className="sc-AxhCb sc-AxhUy sc-AxgMl gbbhfF rdt_TableCell">
                    <div>{item["sport"]}</div>
                  </div>
                  <div className="sc-AxhCb sc-AxhUy sc-AxgMl feuzsg rdt_TableCell">
                    <div>{item["desc"]}</div>
                  </div>
                  <div className="sc-AxhCb sc-AxhUy sc-AxgMl dEqdaH rdt_TableCell">
                    <span onClick={e => { handleViewDetails(item) }} style={{ cursor: "pointer" }}>
                      <AlertCircle />
                    </span>
                  </div>
                  <div className="sc-AxhCb sc-AxhUy sc-AxgMl gbbhfF rdt_TableCell">
                    <div>{item["odds"]}</div>
                  </div>
                  <div className="sc-AxhCb sc-AxhUy sc-AxgMl gbbhfF rdt_TableCell">
                    <div>-</div>
                  </div>
                  <div className="sc-AxhCb sc-AxhUy sc-AxgMl gbbhfF rdt_TableCell">
                    <div>-</div>
                  </div>
                  <div className="sc-AxhCb sc-AxhUy sc-AxgMl gbbhfF rdt_TableCell">
                    <div>{item["result"]}</div>
                  </div>
                  <div className="sc-AxhCb sc-AxhUy sc-AxgMl gbbhfF rdt_TableCell">
                    <div>{item["status"]}</div>
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
            {/* <div className="right">
              <Input
                onChange={e => { handleSearch(e.target.value) }}
                type='text'
                placeholder='Search'
              />
            </div> */}
          </CardHeader>
          <div className="title bet-list-t row m-0">
            <div className="col-6 d-flex justify-content-between align-items-center bet-list-select-options">
              <div className="gray-sel third">
                <Select
                  options={weekOptions}
                  defaultValue={weekOptions[0]}
                  className="react-select sbHolder"
                  theme={selectThemeColors}
                  classNamePrefix='select'
                  onChange={e => { handleSelectOption("week", e) }}
                />
              </div>
              <div className="gray-sel third">
                <Select
                  options={statusOptions}
                  defaultValue={statusOptions[0]}
                  className="react-select sbHolder"
                  theme={selectThemeColors}
                  classNamePrefix='select'
                  onChange={e => { handleSelectOption("status", e) }}
                />
              </div>
              <div className="gray-sel third">
                <Select
                  options={sortOptions}
                  defaultValue={sortOptions[0]}
                  className="react-select sbHolder"
                  theme={selectThemeColors}
                  classNamePrefix='select'
                  onChange={e => { handleSelectOption("sort", e) }}
                />
              </div>
            </div>
            <div className="col-6 d-flex justify-content-between align-items-center bet-list-search">
              <div className="mr-1">
                {getTextByLanguage("Search Bet")}
              </div>
              <Input
                style={{ maxWidth: "100px" }}
                className="search-input mr-1"
                onChange={e => { setSearchIdBet(e.target.value) }}
                type='text'
                placeholder={getTextByLanguage("ID Bet")}
              />
              <Input
                style={{ maxWidth: "150px" }}
                className="search-input mr-1"
                onChange={e => { setSearchMoneyLimit(e.target.value) }}
                type='number'
                placeholder={getTextByLanguage('Money Limit')}
              />
              <Input
                style={{ maxWidth: "150px" }}
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
                  // sortIcon={<ChevronDown size={10} />}
                  paginationDefaultPage={currentPage + 1}
                  paginationComponent={CustomPagination}
                  data={filterData}
                  expandableRowsHideExpander={true}
                  expandableRows
                  expandOnRowClicked
                  expandableRowsComponent={<ExpandableTable history={filterData} />}
                  noHeader={true}
                // subHeader={false}
                // subHeaderWrap={true}
                // subHeaderComponent={<DataTableHeader />}
                />
              </React.Fragment>
            ) : ""}
          </CardBody>
        </Card>
      </div>
    </div>
  )
}

export default BetListCmp
