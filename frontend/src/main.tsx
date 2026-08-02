import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { RouterProvider } from 'react-router-dom'
import { ThemeProvider } from './providers/ThemeProvider'

import './index.css'
import router from './router'
import { PeriodProvider } from './providers/PeriodProvider'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
      <PeriodProvider>
        <RouterProvider router={router} />
      </PeriodProvider>
    </ThemeProvider>
  </StrictMode>,
)
