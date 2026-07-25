import { useParams } from 'react-router-dom'
import {
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

function CustomTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null
  return (
    <div className="rounded border border-gray-200 bg-white px-3 py-2 text-sm shadow">
      <div className="text-gray-500">{label}</div>
      <div className="font-medium">{payload[0].value?.toFixed(2)} ₺</div>
    </div>
  )
}

export default function StockDetail() {
  const { symbol } = useParams()
  const { data: chart, isLoading } = useStockChart(symbol)
  const { data: position } = usePosition(symbol)

  const currencyFmt = new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' })

  if (isLoading || !chart) {
    return <div className="text-gray-400">Yükleniyor...</div>
  }

  const buyPins = chart.pins.filter((p) => p.type === 'BUY')
  const sellPins = chart.pins.filter((p) => p.type === 'SELL')

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">{symbol}</h1>
        {position && (
          <p className="text-gray-500">
            {position.totalQuantity} adet · Ort. maliyet {currencyFmt.format(position.averageCost)}
          </p>
        )}
      </div>

      <div className="h-96 rounded-lg bg-white p-4 shadow-sm">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={chart.prices}>
            {chart.periods.map((p, i) => (
              <ReferenceArea
                key={i}
                x1={p.from}
                x2={p.to || chart.prices.at(-1)?.date}
                fill="#6b7280"
                fillOpacity={0.08}
              />
            ))}

            <Line dataKey="price" dot={false} stroke="#1FD07A" strokeWidth={2} />

            {chart.averageCostLine && (
              <ReferenceLine y={chart.averageCostLine} stroke="#F59E0B" strokeDasharray="4 4" />
            )}

            {buyPins.map((pin, i) => (
              <ReferenceLine key={`buy-${i}`} x={pin.date} stroke="#1FD07A" strokeWidth={1.5} />
            ))}

            {sellPins.map((pin, i) => (
              <ReferenceLine key={`sell-${i}`} x={pin.date} stroke="#FF4757" strokeWidth={1.5} />
            ))}

            <Tooltip content={<CustomTooltip />} />
            <XAxis dataKey="date" />
            <YAxis domain={['auto', 'auto']} />
          </ComposedChart>
        </ResponsiveContainer>
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
