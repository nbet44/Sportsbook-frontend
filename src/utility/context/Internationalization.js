// ** React Imports
import { useState, createContext } from 'react'
import { useDispatch } from 'react-redux'
import { useTranslation } from "react-i18next"
import socketIOClient from "socket.io-client"

// ** Intl Provider Import
import { IntlProvider } from 'react-intl'
import { getLanguage, getUserData } from '@utils'
import { handleSession } from '@store/actions/auth'
import { useRTL } from '@hooks/useRTL'

// ** Core Language Data
import messagesEn from '@assets/data/locales/en.json'
import messagesDe from '@assets/data/locales/de.json'
import messagesFr from '@assets/data/locales/fr.json'
import messagesPt from '@assets/data/locales/pt.json'

// ** User Language Data
import userMessagesEn from '@src/assets/data/locales/en.json'
import userMessagesDe from '@src/assets/data/locales/de.json'
import userMessagesFr from '@src/assets/data/locales/fr.json'
import userMessagesPt from '@src/assets/data/locales/pt.json'
import mainConfig from '../../configs/mainConfig'
import Axios from '../hooks/Axios'
import { toast } from 'react-toastify'

// ** Menu msg obj
const menuMessages = {
  en: { ...messagesEn, ...userMessagesEn },
  de: { ...messagesDe, ...userMessagesDe },
  fr: { ...messagesFr, ...userMessagesFr },
  pt: { ...messagesPt, ...userMessagesPt }
}

// ** Create Context
const Context = createContext()

const IntlProviderWrapper = ({ children }) => {
  // ** States
  const [locale, setLocale] = useState('en')
  const [messages, setMessages] = useState(menuMessages['en'])
  const dispatch = useDispatch()
  const [userData, setUserData] = useState(getUserData())
  const { t, i18n } = useTranslation('common')
  const [isRtl, setIsRtl] = useRTL()

  // ** Switches Language
  const switchLanguage = lang => {
    i18n.changeLanguage(lang)
    if (lang === "he") {
      setIsRtl(true)
    } else {
      setIsRtl(false)
    }
    localStorage.setItem("lang", lang)
    window.location.reload()
    // setLocale(lang)
    // setMessages(menuMessages[lang])
  }

  if (userData) {
    // mainConfig.socket = socketIOClient(mainConfig.server.socket_url)
    async function fetchData() {
      const request = userData
      const response = await Axios({
        endpoint: "/user/get-self",
        method: "POST",
        params: request
      })
      if (response.status === 200) {
        dispatch(handleSession(response.data))
      } else {
        toast.error(response.data)
      }
    }
    fetchData()
  }

  if (getLanguage() === "he") {
    setIsRtl(true)
  }

  return (
    <Context.Provider value={{ locale, switchLanguage }}>
      <IntlProvider key={locale} locale={locale} messages={messages} defaultLocale='en'>
        {children}
      </IntlProvider>
    </Context.Provider>
  )
}

export { IntlProviderWrapper, Context as IntlContext }
