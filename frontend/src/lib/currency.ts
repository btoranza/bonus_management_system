export const formatCurrency = (value: number) =>
  `€ ${Math.round(value).toLocaleString('en-US')}`
