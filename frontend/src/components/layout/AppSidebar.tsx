import { Moon, X } from 'lucide-react'
import { NavLink } from 'react-router-dom'

import logo from '@/assets/logo.png'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import { useSidebar } from '@/providers/SidebarProvider'
import { useTheme } from '@/providers/ThemeProvider'

import { menuItems } from './menuItems'

const AppSidebar = () => {
  const { theme, setTheme } = useTheme()
  const { collapsed, mobileOpen, isMobile, closeMobileSidebar } = useSidebar()

  const showLabels = isMobile || !collapsed

  return (
    <>
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 md:hidden"
          onClick={closeMobileSidebar}
          aria-hidden="true"
        />
      )}

      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-50 flex h-svh w-64 shrink-0 flex-col border-r bg-sidebar text-sidebar-foreground transition-transform duration-200 md:static md:translate-x-0 md:transition-[width]',
          mobileOpen ? 'translate-x-0' : '-translate-x-full',
          collapsed ? 'md:w-20' : 'md:w-64',
        )}
      >
        <div
          className={cn(
            'flex h-16 items-center justify-between gap-3 px-4',
            collapsed && !isMobile && 'justify-center px-0',
          )}
        >
          <div className="flex items-center gap-3">
            <img src={logo} alt="" className="size-10 shrink-0" />
            {showLabels && (
              <span className="font-heading text-lg font-semibold">BMS</span>
            )}
          </div>

          {isMobile && (
            <Button
              variant="ghost"
              size="icon-sm"
              onClick={closeMobileSidebar}
            >
              <X className="size-5" />
            </Button>
          )}
        </div>

        <nav className="flex flex-col gap-2 px-3 pt-2">
          {menuItems.map(({ title, href, icon: Icon }) => (
            <NavLink
              key={href}
              to={href}
              onClick={closeMobileSidebar}
              className={({ isActive }) =>
                cn(
                  'flex h-12 items-center gap-3 rounded-lg pl-4 text-lg hover:bg-sidebar-accent hover:text-sidebar-accent-foreground',
                  isActive &&
                    'bg-sidebar-accent font-medium text-sidebar-accent-foreground',
                  collapsed && !isMobile && 'justify-center pl-0',
                )
              }
            >
              <Icon className="size-6 shrink-0" />
              {showLabels && <span>{title}</span>}
            </NavLink>
          ))}
        </nav>

        <div className="mt-auto p-3">
          {showLabels && (
            <div className="flex items-center justify-end gap-2 rounded-lg px-3 py-2">
              <Moon className="size-5 text-muted-foreground" />
              <Switch
                checked={theme === 'dark'}
                onCheckedChange={(checked) =>
                  setTheme(checked ? 'dark' : 'light')
                }
              />
            </div>
          )}
        </div>
      </aside>
    </>
  )
}

export default AppSidebar
