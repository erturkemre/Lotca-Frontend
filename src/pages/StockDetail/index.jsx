import { useMemo, useState } from 'react'
import { useParams } from 'react-router-dom'
import {
  Area,
  ComposedChart,
  Line,
  ReferenceArea,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { useStockChart } from '../../features/portfolio/useStockChart'
import { usePosition } from '../../features/portfolio/usePortfolio'

const RANGES = [
  { key: '1W', label: '1H' },
  { key: '1M', label: '1A' },
  { key: '3M', label: '3A' },
  { key: '6M', label: '6A' },
  { key: '1Y', label: '1Y' },
  { key: 'ALL', label: 'Tümü' },
]

const GOOD = '#1FD07A'
const BAD = '#FF4757'

const currencyFmt = new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' })

function TriangleDot({ cx, cy, fill, pointing, payload, dataKey }) {
  if (payload[dataKey] == null || cx === undefined || cy === undefined) return null
  const size = 6
  const points =
    pointing === 'up'
      ? `${cx},${cy - size} ${cx - size},${cy + size} ${cx + size},${cy + size}`
      : `${cx},${cy + size} ${cx - size},${cy - size} ${cx + size},${cy - size}`

  return (
    <polygon
      points={points}
      fill={fill}
      stroke="#fff"
      strokeWidth={1}
      style={{ filter: 'drop-shadow(0 1px 2px rgba(0,0,0,0.25))' }}
    />
  )
}

function buildTooltip(pinsByDate) {
  return function CustomTooltip({ active, payload, label }) {
    if (!active || !payload?.length) return null
    const pricePoint = payload.find((p) => p.dataKey === 'price')
    const trades = pinsByDate.get(label) || []

    return (
      <div className="rounded border border-gray-200 bg-white px-3 py-2 text-sm shadow-lg">
        <div className="text-gray-500">{label}</div>
        {pricePoint && <div className="font-medium">{currencyFmt.format(pricePoint.value)}</div>}
        {trades.map((t, i) => (
          <div
            key={i}
            className={`mt-1 border-t border-gray-100 pt-1 text-xs ${t.type === 'BUY' ? 'text-brand-green' : 'text-brand-red'}`}
          >
            {t.type === 'BUY' ? 'Alım' : 'Satım'}: {t.quantity} adet @ {currencyFmt.format(t.price)}
            {t.accountLabel ? ` — ${t.accountLabel}` : ''}
          </div>
        ))}
      </div>
    )
  }
}

export default function StockDetail() {
  const { symbol } = useParams()
  const [range, setRange] = useState('1Y')
  const { data: chart, isLoading } = useStockChart(symbol, range)
  const { data: position } = usePosition(symbol)

  const pinsByDate = useMemo(() => {
    const map = new Map()
    chart?.pins.forEach((p) => {
      if (!map.has(p.date)) map.set(p.date, [])
      map.get(p.date).push(p)
    })
    return map
  }, [chart])

  // Merge buy/sell markers into the same array the price line renders from, so
  // both share one x-axis domain and stay pixel-aligned (a separate Scatter series
  // fights the shared category axis and can break the line's own rendering).
  const data = useMemo(() => {
    if (!chart) return []
    return chart.prices.map((point) => {
      const trades = pinsByDate.get(point.date) || []
      const buy = trades.find((t) => t.type === 'BUY')
      const sell = trades.find((t) => t.type === 'SELL')
      return {
        ...point,
        buyPrice: buy ? buy.price : null,
        sellPrice: sell ? sell.price : null,
      }
    })
  }, [chart, pinsByDate])

  if (isLoading || !chart) {
    return <div className="text-gray-400">Yükleniyor...</div>
  }

  const CustomTooltip = buildTooltip(pinsByDate)

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-semibold">{symbol}</h1>
          {position && (
            <p className="text-gray-500">
              {position.totalQuantity} adet · Ort. maliyet {currencyFmt.format(position.averageCost)}
            </p>
          )}
        </div>
        <div className="flex gap-1 rounded-lg bg-white p-1 shadow-sm">
          {RANGES.map((r) => (
            <button
              key={r.key}
              onClick={() => setRange(r.key)}
              className={`rounded px-3 py-1.5 text-sm font-medium transition-colors ${
                range === r.key ? 'bg-brand-green text-white' : 'text-gray-500 hover:bg-brand-bg'
              }`}
            >
              {r.label}
            </button>
          ))}
        </div>
      </div>

      <div className="h-96 rounded-lg bg-white p-4 shadow-sm">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={data} margin={{ top: 8, right: 16 }}>
            <defs>
              <linearGradient id="priceFill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={GOOD} stopOpacity={0.25} />
                <stop offset="100%" stopColor={GOOD} stopOpacity={0.02} />
              </linearGradient>
            </defs>

            {chart.periods.map((p, i) => (
              <ReferenceArea
                key={i}
                x1={p.from}
                x2={p.to || data.at(-1)?.date}
                fill="#6b7280"
                fillOpacity={0.08}
              />
            ))}

            {chart.averageCostLine && (
              <ReferenceLine
                y={chart.averageCostLine}
                stroke="#F59E0B"
                strokeDasharray="4 4"
                label={{ value: 'Ort. Maliyet', position: 'insideTopRight', fontSize: 11, fill: '#F59E0B' }}
              />
            )}

            <Area
              type="monotone"
              dataKey="price"
              stroke={GOOD}
              strokeWidth={2}
              fill="url(#priceFill)"
              dot={false}
              isAnimationActive={false}
            />

            <Line
              dataKey="buyPrice"
              stroke="none"
              isAnimationActive={false}
              activeDot={false}
              legendType="none"
              dot={(props) => (
                <TriangleDot key={`buy-${props.index}`} {...props} fill={GOOD} pointing="up" dataKey="buyPrice" />
              )}
            />
            <Line
              dataKey="sellPrice"
              stroke="none"
              isAnimationActive={false}
              activeDot={false}
              legendType="none"
              dot={(props) => (
                <TriangleDot key={`sell-${props.index}`} {...props} fill={BAD} pointing="down" dataKey="sellPrice" />
              )}
            />

            <Tooltip content={<CustomTooltip />} />
            <XAxis dataKey="date" tick={{ fontSize: 11 }} minTickGap={30} />
            <YAxis domain={['auto', 'auto']} tick={{ fontSize: 11 }} width={70} />
          </ComposedChart>
        </ResponsiveContainer>
      </div>

      <div className="flex items-center gap-4 text-xs text-gray-500">
        <span className="flex items-center gap-1">
          <span className="inline-block h-2 w-2 rounded-full bg-brand-green" /> Alım
        </span>
        <span className="flex items-center gap-1">
          <span className="inline-block h-2 w-2 rounded-full bg-brand-red" /> Satım
        </span>
        <span className="flex items-center gap-1">
          <span className="inline-block h-2 w-0.5 bg-brand-amber" /> Ortalama maliyet
        </span>
        <span className="flex items-center gap-1">
          <span className="inline-block h-2 w-2 rounded-sm bg-gray-400 opacity-30" /> Pozisyon açık dönemi
        </span>
      </div>

      <div className="overflow-x-auto rounded-lg bg-white shadow-sm">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-200 text-left text-gray-500">
              <th className="px-4 py-3">Tarih</th>
              <th className="px-4 py-3">Kurum</th>
              <th className="px-4 py-3">İşlem</th>
              <th className="px-4 py-3">Adet</th>
              <th className="px-4 py-3">Fiyat</th>
              <th className="px-4 py-3">Maliyet</th>
            </tr>
          </thead>
          <tbody>
            {chart.pins.map((pin, i) => (
              <tr key={i} className="border-b border-gray-100 last:border-0">
                <td className="px-4 py-3">{pin.date}</td>
                <td className="px-4 py-3">{pin.accountLabel}</td>
                <td className="px-4 py-3">
                  <span className={pin.type === 'BUY' ? 'text-brand-green' : 'text-brand-red'}>
                    {pin.type === 'BUY' ? 'Alım' : 'Satım'}
                  </span>
                </td>
                <td className="px-4 py-3">{pin.quantity}</td>
                <td className="px-4 py-3">{currencyFmt.format(pin.price)}</td>
                <td className="px-4 py-3">{currencyFmt.format(pin.price * pin.quantity)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
