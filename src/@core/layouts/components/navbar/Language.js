// ** React Imports
import { useContext } from 'react'
import { changeLanguage } from '@utils'

// ** Third Party Components
import ReactCountryFlag from 'react-country-flag'
import { UncontrolledDropdown, DropdownMenu, DropdownItem, DropdownToggle } from 'reactstrap'

// ** Internationalization Context
import { IntlContext } from '@src/utility/context/Internationalization'

const IntlDropdown = () => {
  // ** Context
  const intlContext = useContext(IntlContext)

  // ** Vars
  const langObj = {
    en: 'English',
    il: 'Israel'
    // de: 'German',
    // fr: 'French',
  }

  // ** Function to switch Language
  const handleLangUpdate = (e, lang) => {
    e.preventDefault()
    intlContext.switchLanguage(lang)
  }

  return (
    <div className="d-flex align-items-center mr-1">
      <div className="mr-2" onClick={e => handleLangUpdate(e, 'en')} style={{ cursor: "pointer" }}>
        <ReactCountryFlag
          className='country-flag flag-icon'
          countryCode="us"
          svg
        />
        {/* <span className='selected-language' style={{ marginLeft: "5px" }}>English</span> */}
      </div>
      <div onClick={e => handleLangUpdate(e, 'he')} style={{ cursor: "pointer" }}>
        <ReactCountryFlag
          className='country-flag flag-icon'
          countryCode="il"
          svg
        />
        {/* <span style={{ marginLeft: "5px" }}>Israel</span> */}
      </div>
    </div>
  )
}

export default IntlDropdown
