import { Outlet } from 'react-router-dom'

import { SidebarProvider } from '@/providers/SidebarProvider'

import AppHeader from './AppHeader'
import AppSidebar from './AppSidebar'

const AppLayout = () => {
  return (
    <SidebarProvider>
      <div className="flex h-svh w-full overflow-hidden">
        <AppSidebar />

        <main className="flex min-h-0 flex-1 flex-col">
          <AppHeader />

          <div className="min-h-0 flex-1 overflow-auto">
            <Outlet />
          </div>
        </main>
      </div>
    </SidebarProvider>
  )
}

export default AppLayout
