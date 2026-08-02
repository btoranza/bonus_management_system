import { Moon } from 'lucide-react'
import { NavLink } from 'react-router-dom'

import logo from '@/assets/logo.png'
import { cn } from '@/lib/utils'
import { Switch } from '@/components/ui/switch'
import { useSidebar } from '@/providers/SidebarProvider'
import { useTheme } from '@/providers/ThemeProvider'

import { menuItems } from './menuItems'

const AppSidebar = () => {
  const { theme, setTheme } = useTheme()
  const { collapsed } = useSidebar()

  return (
    <aside
      className={cn(
        'flex h-svh shrink-0 flex-col border-r bg-sidebar text-sidebar-foreground transition-[width] duration-200',
        collapsed ? 'w-20' : 'w-64',
      )}
    >
      <div
        className={cn(
          'flex h-16 items-center gap-3 px-4',
          collapsed && 'justify-center px-0',
        )}
      >
        <img src={logo} alt="" className="size-10 shrink-0" />
        {!collapsed && (
          <span className="font-heading text-lg font-semibold">BMS</span>
        )}
      </div>

      <nav className="flex flex-col gap-2 px-3 pt-2">
        {menuItems.map(({ title, href, icon: Icon }) => (
          <NavLink
            key={href}
            to={href}
            className={({ isActive }) =>
              cn(
                'flex h-12 items-center gap-3 rounded-lg pl-4 text-lg hover:bg-sidebar-accent hover:text-sidebar-accent-foreground',
                isActive &&
                  'bg-sidebar-accent font-medium text-sidebar-accent-foreground',
                collapsed && 'justify-center pl-0',
              )
            }
          >
            <Icon className="size-6 shrink-0" />
            {!collapsed && <span>{title}</span>}
          </NavLink>
        ))}
      </nav>

      <div className="mt-auto p-3">
        {!collapsed && (
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
  )
}

export default AppSidebar
