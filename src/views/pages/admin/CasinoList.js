import React, { useEffect, useState } from 'react'
import {
  Input, Card, CardHeader, CardBody, CardTitle, CardText, CardLink
} from 'reactstrap'
import Select from 'react-select'
import { selectThemeColors } from '@utils'
import { ChevronDown } from 'react-feather'
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

const CasinoListCmp = () => {
  const [currentPage, setCurrentPage] = useState(0)
  const [isLoading, setIsLoading] = useState(true)
  const [tableData, setTableData] = useState([])
  const [filterData, setFilterData] = useState([])
  const [searchValue, setSearchValue] = useState("")
  const userData = useSelector((state) => state.auth.userData)
  const timezoneOffset = (new Date().getTimezoneOffset()) / 60
  const [getTextByLanguage] = useTranslator()

  const tableColumns = [
    {
      name: getTextByLanguage('ID'),
      selector: 'ext_bet_ref',
      sortable: true
    },
    {
      name: getTextByLanguage('Number'),
      selector: 'ext_event_ref',
      sortable: true
    },
    {
      name: getTextByLanguage('User Name'),
      selector: 'username',
      sortable: true
    },
    {
      name: getTextByLanguage('Time'),
      selector: 'timestamp',
      sortable: true,
      cell: row => {
        return (
          // <span>{moment(new Date(parseInt(row.timestamp))).format('hh:mm MM/DD/YYYY')}</span>
          // <span>{moment(new Date(new Date(row.created).getTime() + (3600 * 1000 * timezoneOffset))).format('HH:mm DD/MM/YYYY')}</span>
          <span>{moment(new Date(new Date(row.created).getTime())).format('HH:mm DD/MM/YYYY')}</span>
        )
      }
    },
    {
      name: getTextByLanguage('Amount'),
      selector: "amount",
      sortable: true
    },
    {
      name: getTextByLanguage('Win'),
      selector: 'winnings',
      sortable: true
    },
    {
      name: getTextByLanguage('Cancel'),
      selector: 'cancel_reason',
      sortable: true
    }
    // {
    //   name: 'Status',
    //   selector: 'status',
    //   sortable: true,
    //   cell: row => {
    //     return (
    //       <span>{row.winnings !== "" && !row.cancel_reason ? "Win" : row.cancel_reason !== "" ? "Cancel" : "Pending"}</span>
    //     )
    //   }
    // }
    // {
    //   name: 'Action',
    //   cell: row => {
    //     <span></span>
    //   }
    // }
  ]

  useEffect(async () => {
    const request = {
      agentId: userData._id
    }
    const response = await Axios({
      endpoint: "/mohio/casino-history",
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

  if (isLoading) {
    return (
      <Spinner></Spinner>
    )
  }

  const handleSearch = (value) => {
    const result = []
    for (const i in tableData) {
      if (tableData[i].username.indexOf(value) !== -1) {
        result.push(tableData[i])
      }
    }
    setFilterData(result)
  }

  return (
    <div>
      <CategoriesCmp />
      <div className="content-body">
        <Card className="b-team__list">
          <CardHeader >
            <div className="left">
              <h2 className="b-list m-auto px-5 py-1 transaction-title">{getTextByLanguage("Casino List")}</h2>
            </div>
            <div className="right">
              <Input
                onChange={e => { handleSearch(e.target.value) }}
                type='text'
                placeholder={getTextByLanguage("Search")}
              />
            </div>
          </CardHeader>
          <div className="title bet-list-t">
            {/* <div className="left">
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
            </div> */}
          </div>
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

export default CasinoListCmp
