import { createContext, useContext, useState } from 'react'

import { useIsMobile } from '@/hooks/use-mobile'

type SidebarContextValue = {
  collapsed: boolean
  mobileOpen: boolean
  isMobile: boolean
  toggleSidebar: () => void
  closeMobileSidebar: () => void
}

const SidebarContext = createContext<SidebarContextValue | undefined>(undefined)

export function SidebarProvider({ children }: { children: React.ReactNode }) {
  const [collapsed, setCollapsed] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const isMobile = useIsMobile()

  const value = {
    collapsed,
    mobileOpen,
    isMobile,
    toggleSidebar: () => {
      if (isMobile) {
        setMobileOpen((prev) => !prev)
      } else {
        setCollapsed((prev) => !prev)
      }
    },
    closeMobileSidebar: () => setMobileOpen(false),
  }

  return (
    <SidebarContext.Provider value={value}>{children}</SidebarContext.Provider>
  )
}

export const useSidebar = () => {
  const context = useContext(SidebarContext)
  if (context === undefined) {
    throw new Error('useSidebar must be used within a SidebarProvider')
  }
  return context
}
