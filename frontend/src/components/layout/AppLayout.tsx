import { Outlet } from 'react-router-dom'
import AppSidebar from './AppSidebar'
import AppHeader from './AppHeader'
import { SidebarProvider } from '@/providers/SidebarProvider'

const AppLayout = () => {
  return (
    <SidebarProvider>
      <div className="flex min-h-svh w-full">
        <AppSidebar />

        <main className="flex flex-1 flex-col">
          <AppHeader />

          <Outlet />
        </main>
      </div>
    </SidebarProvider>
  )
}

export default AppLayout
