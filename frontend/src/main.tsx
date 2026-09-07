import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { RouterProvider } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

import { ThemeProvider } from './providers/ThemeProvider'
import { PeriodProvider } from './providers/PeriodProvider'
import { Toaster } from './components/ui/toast'

import './index.css'
import router from './router'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutos
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
})

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
        <PeriodProvider>
          <Toaster>
            <RouterProvider router={router} />
          </Toaster>
        </PeriodProvider>
      </ThemeProvider>
    </QueryClientProvider>
  </StrictMode>,
)
