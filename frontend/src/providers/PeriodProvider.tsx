import {
  createContext,
  type PropsWithChildren,
  useContext,
  useMemo,
  useState,
} from 'react'

export interface Period {
  month: number
  year: number
}

interface PeriodContextType {
  period: Period
  setPeriod: (period: Period) => void
}

const PeriodContext = createContext<PeriodContextType | null>(null)

export const PeriodProvider = ({ children }: PropsWithChildren) => {
  const today = new Date()

  const [period, setPeriod] = useState<Period>({
    month: today.getMonth() + 1,
    year: today.getFullYear(),
  })

  const value = useMemo(
    () => ({
      period,
      setPeriod,
    }),
    [period],
  )

  return (
    <PeriodContext.Provider value={value}>{children}</PeriodContext.Provider>
  )
}

export const usePeriod = () => {
  const context = useContext(PeriodContext)

  if (!context) {
    throw new Error('usePeriod must be used within a PeriodProvider')
  }

  return context
}
