import {
  BadgeDollarSign,
  LayoutDashboard,
  ReceiptText,
  Users,
} from 'lucide-react'

export const menuItems = [
  {
    title: 'Dashboard',
    href: '/',
    icon: LayoutDashboard,
  },
  {
    title: 'Sales',
    href: '/sales',
    icon: ReceiptText,
  },
  {
    title: 'Salespeople',
    href: '/salespeople',
    icon: Users,
  },
  {
    title: 'Bonuses',
    href: '/bonuses',
    icon: BadgeDollarSign,
  },
]
