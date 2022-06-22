import React, { useEffect, useState } from 'react'
import { useSelector } from 'react-redux'
import { toast } from 'react-toastify'
import { Card, CardHeader, CardBody, Nav, NavItem, NavLink } from 'reactstrap'
import Axios from '../utility/hooks/Axios'
import HeaderCmp from './Header'
import { getSportsDataBySportId } from '../redux/actions/sports'
import { sportsNameById, flagsByRegionName, topFootballLeagues } from '../configs/mainConfig'
import moment from 'moment'
import { useTranslator } from '@hooks/useTranslator'
import Spinner from "@components/spinner/Fallback-spinner"
import { useHistory } from 'react-router-dom'

const Home = () => {
  const history = useHistory()
  const [getTextByLanguage] = useTranslator()
  const userData = useSelector((state) => state.auth.userData)
  const [isLoading, setIsLoading] = useState(true)
  const [sportsData, setSportsData] = useState({})
  const [topFootballLeagueData, setTopFootballLeagueData] = useState([])
  const [active, setActive] = useState('1')
  const [sportId, setSportId] = useState(4)

  const getSportsDataBySportId = (data, sortType) => {
    data.sort(function (a, b) {
      if (sortType === "clickCount") {
        const x = a.ClickCount
        const y = b.ClickCount
        if (x > y) { return -1 }
        if (x < y) { return 1 }
        return 0
      } else if (sortType === "playCount") {
        const x = a.PlayCount
        const y = b.PlayCount
        if (x > y) { return -1 }
        if (x < y) { return 1 }
        return 0
      } else {
        const x = a.RegionName.toLowerCase()
        const y = b.RegionName.toLowerCase()
        if (x < y) { return -1 }
        if (x > y) { return 1 }
      }
    })
    const result = {}
    for (const i in data) {
      const tempData = topFootballLeagueData
      let isCheck = true
      for (const j in topFootballLeagues) {
        if ((data[i].SportId === 4) && (topFootballLeagues[j].RegionId === data[i].RegionId) && (data[i].LeagueName.indexOf(topFootballLeagues[j].LeagueName) !== -1)) {
          tempData.push(data[i])
          setTopFootballLeagueData(tempData)
          isCheck = false
          break
        }
      }
      if (isCheck) {
        if (result[data[i]["SportId"]]) {
          result[data[i]["SportId"]].push(data[i])
        } else {
          result[data[i]["SportId"]] = [data[i]]
        }
      }
    }
    return result
  }

  const handleGetLeagueByDate = async (number) => {
    const request = {
      agentId: userData._id,
      sportId,
      date: number
    }
    const response = await Axios({
      endpoint: "/sports/get-league",
      method: "POST",
      params: request
    })
    if (response.status === 200) {
      if (response.setting) {
        setSportsData(await getSportsDataBySportId(response.data, response.setting.leagueSort.value))
        setIsLoading(false)
      }
    } else {
      toast.error(response.data)
    }
  }

  const toggle = (tab, id) => {
    if (active !== tab) {
      setActive(tab)
    }
    setSportId(id)
  }

  useEffect(async () => {
    const request = {
      agentId: userData._id,
      sportId,
      date: Date.now()
    }
    const response = await Axios({
      endpoint: "/sports/get-league",
      method: "POST",
      params: request
    })

    if (response.status === 200) {
      if (response.setting) {
        setSportsData(await getSportsDataBySportId(response.data, response.setting.leagueSort.value))
        setIsLoading(false)
      }
    } else {
      toast.error(response.data)
    }
  }, [])

  const TopFootballLeaguesCmp = () => {
    return (
      <React.Fragment>
        {topFootballLeagueData.map((item, i) => {
          let flagImg = ""
          let regionName = item.RegionName.replaceAll(" ", "")
          regionName = regionName.replaceAll("(", "")
          regionName = regionName.replaceAll(")", "")
          if (flagsByRegionName[regionName]) {
            flagImg = flagsByRegionName[regionName]
          } else {
            flagImg = regionName
          }
          return (
            <React.Fragment key={i}>
              <a className="d-flex align-items-center col-4 mb-1" href={`/match/${item.LeagueId}`}>
                <img src={`https://getbet77.com/files/flags1/${flagImg}.png`} />
                <span style={{ fontSize: "12px", marginLeft: "3px" }} ><b>{getTextByLanguage(item.RegionName)}</b> {getTextByLanguage(item.LeagueName)} </span>
              </a>
            </React.Fragment>
          )
        })}
      </React.Fragment>
    )
  }

  if (isLoading) {
    return (
      <div>
        <HeaderCmp />
        <Spinner />
      </div>
    )
  }

  return (
    <div>
      <HeaderCmp />

      <div className="content-body">
        <div className="">
          <Nav tabs className="category-links m-0">
            <NavItem className="live-bet-tabs">
              <NavLink
                active={active === '1'}
                onClick={() => {
                  toggle('1', 4)
                }}
              >
                {getTextByLanguage("Football")}
              </NavLink>
            </NavItem>
            <NavItem className="live-bet-tabs">
              <NavLink
                active={active === '2'}
                onClick={() => {
                  toggle('2', 56)
                }}
              >
                {getTextByLanguage("Table Tennis")}
              </NavLink>
            </NavItem>
            <NavItem className="live-bet-tabs">
              <NavLink
                active={active === '3'}
                onClick={() => {
                  toggle('3', 7)
                }}
              >
                {getTextByLanguage("Basketball")}
              </NavLink>
            </NavItem>
            <NavItem className="live-bet-tabs">
              <NavLink
                active={active === '4'}
                onClick={() => {
                  toggle('4', 5)
                }}
              >
                {getTextByLanguage("Tennis")}
              </NavLink>
            </NavItem>
            <NavItem className="live-bet-tabs">
              <NavLink
                active={active === '5'}
                onClick={() => {
                  toggle('5', 12)
                }}
              >
                {getTextByLanguage("Ice Hockey")}
              </NavLink>
            </NavItem>
            <NavItem className="live-bet-tabs">
              <NavLink
                active={active === '6'}
                onClick={() => {
                  toggle('6', 18)
                }}
              >
                {getTextByLanguage("Volleyball")}
              </NavLink>
            </NavItem>
          </Nav>
          {Object.keys(sportsData).map((key, index) => {
            const eachData = sportsData[key]
            if (sportsNameById[eachData[0]["SportId"]]) {
              return (
                <Card key={index}>
                  <CardHeader className="align-items-center d-flex justify-content-between" >
                    <div className="left">
                      <h2 id={`sport-title-${eachData[0]["SportId"]}`} className="soccer m-auto pl-3 p-1">{getTextByLanguage(eachData[0]["SportName"])}</h2>
                    </div>
                    <div className="right main-links">
                      <a className="fav-link mr-2" onClick={() => history.push(`/favorite`)}>{getTextByLanguage("Favourite Events")}</a>
                      <a className="event-date" onClick={() => { handleGetLeagueByDate(Date.now() + (3600 * 24 * 1000 * 4)) }}>{moment(Date.now() + (3600 * 24 * 1000 * 4)).format('DD/MM')}</a>
                      <a className="event-date" onClick={() => { handleGetLeagueByDate(Date.now() + (3600 * 24 * 1000 * 3)) }}>{moment(Date.now() + (3600 * 24 * 1000 * 3)).format('DD/MM')}</a>
                      <a className="event-date" onClick={() => { handleGetLeagueByDate(Date.now() + (3600 * 24 * 1000 * 2)) }}>{moment(Date.now() + (3600 * 24 * 1000 * 2)).format('DD/MM')}</a>
                      <a className="event-date" onClick={() => { handleGetLeagueByDate(Date.now() + (3600 * 24 * 1000 * 1)) }}>{moment(Date.now() + (3600 * 24 * 1000)).format('DD/MM')}</a>
                      <a className="event-date" onClick={() => history.push(`/today/${eachData[0]["SportId"]}`)}>{getTextByLanguage("Today Games")}</a>
                    </div>
                  </CardHeader>

                  <CardBody className="b-team pt-0">
                    <a href="/" className="outright-link">{getTextByLanguage("Outrights")} ({eachData.length})</a>
                    <div className="list-container justify-content-center">
                      <div className="row col-12 home-sports-list">
                        {eachData[0].SportId === 4 ? <TopFootballLeaguesCmp /> : ""}
                        {eachData.map((item, i) => {
                          let flagImg = ""
                          let regionName = item.RegionName.replaceAll(" ", "")
                          regionName = regionName.replaceAll("(", "")
                          regionName = regionName.replaceAll(")", "")
                          if (flagsByRegionName[regionName]) {
                            flagImg = flagsByRegionName[regionName]
                          } else {
                            flagImg = regionName
                          }
                          return (
                            <React.Fragment key={i}>
                              <a className="d-flex align-items-center col-4 mb-1" onClick={() => history.push(`/match/${item.LeagueId}`)}>
                                <img src={`https://getbet77.com/files/flags1/${flagImg}.png`} />
                                <span style={{ fontSize: "12px", marginLeft: "3px" }} ><b>{getTextByLanguage(item.RegionName)}</b> {getTextByLanguage(item.LeagueName)} </span>
                              </a>
                            </React.Fragment>
                          )
                        })}
                      </div>
                    </div>
                  </CardBody>
                </Card>
              )
            }
          })
          }
        </div>
      </div>
    </div>
  )
}

export default Home
