import { useMemo } from 'react'
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  Treemap,
  XAxis,
  YAxis,
} from 'recharts'
import {
  useAccountReport,
  useEquityCurve,
  usePortfolioHistory,
  usePositions,
} from '../../features/portfolio/usePortfolio'

// Validated categorical palette (dataviz skill reference), fixed hue order — never cycled.
const CATEGORICAL_COLORS = [
  '#2a78d6', // blue
  '#008300', // green
  '#e87ba4', // magenta
  '#eda100', // yellow
  '#1baf7a', // aqua
  '#eb6834', // orange
  '#4a3aa7', // violet
  '#e34948', // red
]

const GOOD = '#1FD07A'
const GOOD_LIGHT = '#8FE8BC'
const BAD = '#FF4757'
const BAD_LIGHT = '#FFA9B1'
const NEUTRAL = '#c3c2b7'

const currencyFmt = new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' })
const pctFmt = (n) => (n === undefined || n === null ? '' : `${n >= 0 ? '+' : ''}${n.toFixed(1)}%`)

function pnlColor(pct) {
  if (pct === undefined || pct === null || pct === 0) return NEUTRAL
  if (pct > 10) return GOOD
  if (pct > 0) return GOOD_LIGHT
  if (pct > -10) return BAD_LIGHT
  return BAD
}

function ChartCard({ title, children, height = 320 }) {
  return (
    <div className="rounded-lg bg-white p-4 shadow-sm">
      <h3 className="mb-3 text-sm font-semibold text-gray-700">{title}</h3>
      <div style={{ height }}>
        <ResponsiveContainer width="100%" height="100%">
          {children}
        </ResponsiveContainer>
      </div>
    </div>
  )
}

function TreemapCell({ x, y, width, height, name, pnlPct }) {
  if (width < 2 || height < 2) return null
  const showLabel = width > 50 && height > 34

  return (
    <g>
      <rect
        x={x}
        y={y}
        width={width}
        height={height}
        fill={pnlColor(pnlPct)}
        stroke="#fcfcfb"
        strokeWidth={2}
      />
      {showLabel && (
        <>
          <text x={x + 8} y={y + 20} fontSize={13} fontWeight={600} fill="#0b0b0b">
            {name}
          </text>
          <text x={x + 8} y={y + 36} fontSize={11} fill="#0b0b0b" opacity={0.75}>
            {pctFmt(pnlPct)}
          </text>
        </>
      )}
    </g>
  )
}

function TreemapTooltip({ active, payload }) {
  if (!active || !payload?.length) return null
  const item = payload[0].payload
  return (
    <div className="rounded border border-gray-200 bg-white px-3 py-2 text-sm shadow">
      <div className="font-medium">{item.name}</div>
      <div className="text-gray-500">{currencyFmt.format(item.size)}</div>
      <div className={item.pnlPct >= 0 ? 'text-brand-green' : 'text-brand-red'}>{pctFmt(item.pnlPct)}</div>
    </div>
  )
}

export default function Reports() {
  const { data: positions = [], isLoading: positionsLoading } = usePositions()
  const { data: accountReport = [], isLoading: accountLoading } = useAccountReport()
  const { data: history = [], isLoading: historyLoading } = usePortfolioHistory()
  const { data: equityCurve = [], isLoading: equityLoading } = useEquityCurve()

  const treemapData = useMemo(
    () =>
      positions
        .filter((p) => p.totalValue > 0)
        .map((p) => ({ name: p.symbol, size: p.totalValue, pnlPct: p.unrealizedPnlPct })),
    [positions]
  )

  const allocationData = useMemo(
    () => accountReport.map((r) => ({ name: r.accountLabel, value: r.totalValue })),
    [accountReport]
  )

  const pnlBarData = useMemo(
    () =>
      [...positions]
        .sort((a, b) => b.unrealizedPnl - a.unrealizedPnl)
        .map((p) => ({ name: p.symbol, pnl: p.unrealizedPnl })),
    [positions]
  )

  const realizedBarData = useMemo(
    () =>
      [...history]
        .sort((a, b) => new Date(a.closedAt) - new Date(b.closedAt))
        .map((h) => ({
          name: `${h.symbol} (${h.accountLabel})`,
          symbol: h.symbol,
          accountLabel: h.accountLabel,
          date: h.closedAt,
          pnl: h.realizedPnl,
        })),
    [history]
  )

  const isEmpty = !positionsLoading && !historyLoading && positions.length === 0 && history.length === 0

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Raporlar</h1>

      {isEmpty && (
        <div className="rounded-lg bg-white p-8 text-center text-gray-400 shadow-sm">
          Grafikleri görmek için önce bir işlem ekleyin.
        </div>
      )}

      {!isEmpty && (
        <>
          <ChartCard title="Portföy Değeri (Zaman İçinde)" height={300}>
            {equityLoading ? (
              <div />
            ) : equityCurve.length === 0 ? (
              <div className="flex h-full items-center justify-center text-sm text-gray-400">
                Fiyat geçmişi yükleniyor veya mevcut değil
              </div>
            ) : (
              <AreaChart data={equityCurve} margin={{ top: 8 }}>
                <defs>
                  <linearGradient id="equityFill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#2a78d6" stopOpacity={0.35} />
                    <stop offset="100%" stopColor="#2a78d6" stopOpacity={0.02} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e1e0d9" />
                <XAxis dataKey="date" tick={{ fontSize: 11 }} minTickGap={30} />
                <YAxis tickFormatter={(v) => currencyFmt.format(v)} tick={{ fontSize: 11 }} width={80} />
                <Tooltip formatter={(value) => currencyFmt.format(value)} />
                <Area
                  type="monotone"
                  dataKey="value"
                  stroke="#2a78d6"
                  strokeWidth={2}
                  fill="url(#equityFill)"
                  dot={false}
                  isAnimationActive={false}
                />
              </AreaChart>
            )}
          </ChartCard>

          <ChartCard title="Portföy Isı Haritası — değer = boyut, K/Z% = renk" height={360}>
            <Treemap
              data={treemapData}
              dataKey="size"
              stroke="#fcfcfb"
              content={<TreemapCell />}
              isAnimationActive={false}
            >
              <Tooltip content={<TreemapTooltip />} />
            </Treemap>
          </ChartCard>

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <ChartCard title="Kurum Bazlı Dağılım">
              {accountLoading ? (
                <div />
              ) : (
                <PieChart>
                  <Pie
                    data={allocationData}
                    dataKey="value"
                    nameKey="name"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={2}
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  >
                    {allocationData.map((_, i) => (
                      <Cell key={i} fill={CATEGORICAL_COLORS[i % CATEGORICAL_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => currencyFmt.format(value)} />
                  <Legend />
                </PieChart>
              )}
            </ChartCard>

            <ChartCard title="Pozisyon Bazlı K/Z (TL)">
              <BarChart data={pnlBarData} layout="vertical" margin={{ left: 16 }}>
                <XAxis type="number" tickFormatter={(v) => currencyFmt.format(v)} tick={{ fontSize: 11 }} />
                <YAxis type="category" dataKey="name" tick={{ fontSize: 12 }} width={70} />
                <Tooltip formatter={(value) => currencyFmt.format(value)} />
                <Bar dataKey="pnl" radius={[0, 4, 4, 0]}>
                  {pnlBarData.map((d, i) => (
                    <Cell key={i} fill={d.pnl >= 0 ? GOOD : BAD} />
                  ))}
                </Bar>
              </BarChart>
            </ChartCard>
          </div>

          <ChartCard title="Gerçekleşmiş K/Z Geçmişi (kapanan pozisyonlar)">
            {historyLoading ? (
              <div />
            ) : realizedBarData.length === 0 ? (
              <div className="flex h-full items-center justify-center text-sm text-gray-400">
                Henüz kapanmış pozisyon yok
              </div>
            ) : (
              <BarChart data={realizedBarData} margin={{ top: 8 }}>
                <XAxis dataKey="date" tick={{ fontSize: 11 }} />
                <YAxis tickFormatter={(v) => currencyFmt.format(v)} tick={{ fontSize: 11 }} />
                <Tooltip
                  content={({ active, payload, label }) => {
                    if (!active || !payload?.length) return null
                    const item = payload[0].payload
                    return (
                      <div className="rounded border border-gray-200 bg-white px-3 py-2 text-sm shadow">
                        <div className="font-medium">
                          {item.symbol} — {item.accountLabel}
                        </div>
                        <div className="text-gray-500">{label}</div>
                        <div className={item.pnl >= 0 ? 'text-brand-green' : 'text-brand-red'}>
                          {currencyFmt.format(item.pnl)}
                        </div>
                      </div>
                    )
                  }}
                />
                <Bar dataKey="pnl" radius={[4, 4, 0, 0]}>
                  {realizedBarData.map((d, i) => (
                    <Cell key={i} fill={d.pnl >= 0 ? GOOD : BAD} />
                  ))}
                </Bar>
              </BarChart>
            )}
          </ChartCard>

          <div className="overflow-x-auto rounded-lg bg-white shadow-sm">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200 text-left text-gray-500">
                  <th className="px-4 py-3">Sembol</th>
                  <th className="px-4 py-3">Kurum</th>
                  <th className="px-4 py-3">Kapanma Tarihi</th>
                  <th className="px-4 py-3">Gerçekleşmiş K/Z</th>
                </tr>
              </thead>
              <tbody>
                {historyLoading && (
                  <tr>
                    <td colSpan={4} className="px-4 py-6 text-center text-gray-400">
                      Yükleniyor...
                    </td>
                  </tr>
                )}
                {!historyLoading && history.length === 0 && (
                  <tr>
                    <td colSpan={4} className="px-4 py-6 text-center text-gray-400">
                      Henüz kapanmış pozisyon yok
                    </td>
                  </tr>
                )}
                {[...history]
                  .sort((a, b) => new Date(b.closedAt) - new Date(a.closedAt))
                  .map((h, i) => (
                    <tr key={i} className="border-b border-gray-100 last:border-0">
                      <td className="px-4 py-3 font-medium">{h.symbol}</td>
                      <td className="px-4 py-3">{h.accountLabel}</td>
                      <td className="px-4 py-3">{h.closedAt}</td>
                      <td className="px-4 py-3">
                        <span className={h.realizedPnl >= 0 ? 'text-brand-green' : 'text-brand-red'}>
                          {currencyFmt.format(h.realizedPnl)}
                        </span>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  )
}
