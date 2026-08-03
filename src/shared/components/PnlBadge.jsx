import TickingValue from './TickingValue'

const currencyFmt = new Intl.NumberFormat('tr-TR', {
  style: 'currency',
  currency: 'TRY',
  maximumFractionDigits: 2,
})

export default function PnlBadge({ value, pct }) {
  const isPositive = value >= 0
  const color = isPositive ? 'text-brand-green' : 'text-brand-red'

  return (
    <span className={`font-medium ${color}`}>
      <TickingValue value={value} format={(v) => currencyFmt.format(v)} />
      {pct !== undefined && (
        <span className="ml-1 text-sm">({isPositive ? '+' : ''}{pct.toFixed(2)}%)</span>
      )}
    </span>
  )
}
