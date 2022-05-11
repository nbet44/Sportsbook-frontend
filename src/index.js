// ** React Imports
import { Suspense, lazy } from 'react'
import ReactDOM from 'react-dom'
import { I18nextProvider } from "react-i18next"
import i18next from "i18next"

// ** Redux Imports
import { Provider } from 'react-redux'
import { store } from './redux/storeConfig/store'

// ** Toast & ThemeColors Context
import { ToastContainer } from 'react-toastify'
import { ThemeContext } from './utility/context/ThemeColors'
import { IntlProviderWrapper } from './utility/context/Internationalization'

// ** Spinner (Splash Screen)
import Spinner from './@core/components/spinner/Fallback-spinner'

// ** Ripple Button
import './@core/components/ripple-button'

// ** PrismJS
import 'prismjs'
import 'prismjs/themes/prism-tomorrow.css'
import 'prismjs/components/prism-jsx.min'

// ** React Perfect Scrollbar
import 'react-perfect-scrollbar/dist/css/styles.css'

// ** React Toastify
import '@styles/react/libs/toastify/toastify.scss'

// ** Core styles
import './@core/assets/fonts/feather/iconfont.css'
import './@core/scss/core.scss'
import './assets/scss/style.scss'
import './assets/css/style.css'

import common_en from './assets/data/locales/en.json'
import common_he from './assets/data/locales/he.json'
import { getLanguage } from '@utils'

// ** Service Worker
import * as serviceWorker from './serviceWorker'

// ** Lazy load app
const LazyApp = lazy(() => import('./App'))
i18next.init({
  interpolation: { escapeValue: false },
  lng: getLanguage(),
  resources: {
    en: {
      common: common_en
    },
    he: {
      common: common_he
    }
  }
})

ReactDOM.render(
  <Provider store={store}>
    <Suspense fallback={<Spinner />}>
      <ThemeContext>
        <I18nextProvider i18n={i18next}>
          <IntlProviderWrapper>
            <LazyApp />
            <ToastContainer newestOnTop />
          </IntlProviderWrapper>
        </I18nextProvider>
      </ThemeContext>
    </Suspense>
  </Provider>,
  document.getElementById('root')
)

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister()
