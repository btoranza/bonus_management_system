import { createBrowserRouter } from 'react-router-dom'

import AppLayout from '@/components/layout/AppLayout'

import Dashboard from '@/pages/Dashboard'
import Sales from '@/pages/Sales'
import Salespeople from '@/pages/Salespeople'
import Bonuses from '@/pages/Bonuses'

const router = createBrowserRouter([
  {
    element: <AppLayout />,
    children: [
      {
        path: '/',
        element: <Dashboard />,
      },
      {
        path: '/sales',
        element: <Sales />,
      },
      {
        path: '/salespeople',
        element: <Salespeople />,
      },
      {
        path: '/bonuses',
        element: <Bonuses />,
      },
    ],
  },
])

export default router
