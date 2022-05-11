import { lazy } from 'react'

// ** Document title
const TemplateTitle = 'Gambabet - Sport Betting Platform'

// ** Default Route
const DefaultRoute = '/home'

// ** Merge Routes
const Routes = [
  {
    path: '/admin',
    component: lazy(() => import('../../views/pages/admin/Home'))
  },
  {
    path: '/today/:id',
    component: lazy(() => import('../../views/pages/todayGames'))
  },
  {
    path: "/favorite",
    component: lazy(() => import("../../views/pages/favorite"))
  },
  {
    path: '/match/:id',
    component: lazy(() => import('../../views/pages/match'))
  },
  {
    path: '/event/:id',
    component: lazy(() => import('../../views/pages/event'))
  },
  {
    path: '/admin/setting',
    component: lazy(() => import('../../views/pages/admin/siteSetting'))
  },
  {
    path: '/admin/user-list',
    component: lazy(() => import('../../views/pages/admin/UserList'))
  },
  {
    path: '/admin/live-result',
    component: lazy(() => import('../../views/pages/admin/LiveResultList'))
  },
  {
    path: '/admin/live-result/sport/:id',
    component: lazy(() => import('../../views/pages/liveResult/Leagues'))
  },
  {
    path: '/admin/live-result/league/:id',
    component: lazy(() => import('../../views/pages/liveResult/Matches'))
  },
  {
    path: '/admin/live-result/match/:id',
    component: lazy(() => import('../../views/pages/liveResult/Markets'))
  },
  {
    path: '/admin/pre-result',
    component: lazy(() => import('../../views/pages/admin/PreResultList'))
  },
  {
    path: '/admin/pre-result/sport/:id',
    component: lazy(() => import('../../views/pages/result/Leagues'))
  },
  {
    path: '/admin/pre-result/league/:id',
    component: lazy(() => import('../../views/pages/result/Matches'))
  },
  {
    path: '/admin/pre-result/match/:id',
    component: lazy(() => import('../../views/pages/result/Markets'))
  },
  {
    path: '/admin/transaction',
    component: lazy(() => import('../../views/pages/admin/Transaction'))
  },
  {
    path: '/admin/bet-list',
    component: lazy(() => import('../../views/pages/admin/BetList'))
  },
  {
    path: '/admin/casino-list',
    component: lazy(() => import('../../views/pages/admin/CasinoList'))
  },
  {
    path: '/admin/agent-list',
    component: lazy(() => import('../../views/pages/admin/AgentList'))
  },
  {
    path: '/admin/create-new-player',
    component: lazy(() => import('../../views/pages/admin/NewPlayer'))
  },
  {
    path: '/admin/create-new-agent',
    component: lazy(() => import('../../views/pages/admin/NewAgent'))
  },
  {
    path: '/home',
    component: lazy(() => import('../../views/Home'))
  },
  {
    path: '/live',
    component: lazy(() => import('../../views/pages/live'))
  },
  {
    path: '/casino',
    component: lazy(() => import('../../views/pages/casino'))
  },
  {
    path: '/betlist',
    component: lazy(() => import('../../views/pages/betlist'))
  },
  {
    path: '/transaction',
    component: lazy(() => import('../../views/pages/transaction'))
  },
  {
    path: '/login-history',
    component: lazy(() => import('../../views/pages/loginHistory'))
  },
  {
    path: '/login',
    component: lazy(() => import('../../views/auth/Login')),
    layout: 'BlankLayout',
    meta: {
      authRoute: true
    }
  },
  {
    path: '/rules',
    component: lazy(() => import('../../views/pages/rules'))
  },
  {
    path: '/error',
    component: lazy(() => import('../../views/Error')),
    layout: 'BlankLayout'
  }
]

export { DefaultRoute, TemplateTitle, Routes }
