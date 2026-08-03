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
    title: 'Bonuses',
    href: '/bonuses',
    icon: BadgeDollarSign,
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
]
