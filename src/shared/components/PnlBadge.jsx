export default function PnlBadge({ value, pct }) {
  const isPositive = value >= 0
  const color = isPositive ? 'text-brand-green' : 'text-brand-red'

  const formattedValue = new Intl.NumberFormat('tr-TR', {
    style: 'currency',
    currency: 'TRY',
    maximumFractionDigits: 2,
  }).format(value)

  return (
    <span className={`font-medium ${color}`}>
      {formattedValue}
      {pct !== undefined && (
        <span className="ml-1 text-sm">({isPositive ? '+' : ''}{pct.toFixed(2)}%)</span>
      )}
    </span>
  )
}
