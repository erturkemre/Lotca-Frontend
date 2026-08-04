import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAccountReport, usePositions, usePortfolioSummary } from '../../features/portfolio/usePortfolio'
import QuickTransactionModal from '../../features/transaction/QuickTransactionModal'
import PnlBadge from '../../shared/components/PnlBadge'
import TickingValue from '../../shared/components/TickingValue'

function SummaryCard({ label, value, valueClassName }) {
  return (
    <div className="rounded-lg bg-white p-4 shadow-sm">
      <div className="text-sm text-gray-500">{label}</div>
      <div className={`mt-1 text-2xl font-semibold ${valueClassName ?? ''}`}>{value}</div>
    </div>
  )
}

export default function Dashboard() {
  const { data: positions = [], isLoading } = usePositions()
  const { data: summary } = usePortfolioSummary()
  const { data: accountReport = [], isLoading: isAccountReportLoading } = useAccountReport()
  const [accountFilter, setAccountFilter] = useState('all')
  const [quickTxPosition, setQuickTxPosition] = useState(null)

  const accountOptions = useMemo(() => {
    const labels = new Set()
    positions.forEach((p) => p.byAccount.forEach((a) => labels.add(a.accountLabel)))
    return Array.from(labels)
  }, [positions])

  const filteredPositions = useMemo(() => {
    if (accountFilter === 'all') return positions

    return positions
      .map((p) => {
        const accountBreakdown = p.byAccount.find((a) => a.accountLabel === accountFilter)
        if (!accountBreakdown) return null

        const totalQuantity = accountBreakdown.quantity
        const averageCost = accountBreakdown.averageCost
        const totalValue = totalQuantity * p.lastPrice
        const costBasis = totalQuantity * averageCost
        const unrealizedPnl = totalValue - costBasis
        const unrealizedPnlPct = costBasis > 0 ? (unrealizedPnl / costBasis) * 100 : 0

        // dailyChangePct is a price-ratio (independent of quantity), so it carries
        // over unchanged; only the TL amount scales down to this account's share.
        const dailyChangePerShare = p.totalQuantity > 0 ? p.dailyChange / p.totalQuantity : 0
        const dailyChange = totalQuantity * dailyChangePerShare

        return {
          ...p,
          totalQuantity,
          averageCost,
          totalValue,
          unrealizedPnl,
          unrealizedPnlPct,
          dailyChange,
          // realizedPnl is computed FIFO-wide across all accounts holding this
          // symbol, so it can't be attributed to a single kurum once filtered.
          realizedPnl: null,
        }
      })
      .filter(Boolean)
  }, [positions, accountFilter])

  const currencyFmt = new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' })

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-6">
        <SummaryCard
          label="Toplam Değer"
          value={<TickingValue value={summary?.totalValue ?? 0} format={(v) => currencyFmt.format(v)} />}
        />
        <SummaryCard
          label="Günlük Değişim"
          value={
            <PnlBadge value={summary?.dailyChange ?? 0} pct={summary?.dailyChangePct ?? 0} />
          }
        />
        <SummaryCard
          label="Gerçekleşmemiş K/Z"
          value={
            <PnlBadge value={summary?.totalUnrealizedPnl ?? 0} pct={summary?.totalUnrealizedPnlPct ?? 0} />
          }
        />
        <SummaryCard
          label="Gerçekleşmiş K/Z"
          value={<PnlBadge value={summary?.totalRealizedPnl ?? 0} />}
        />
        <SummaryCard
          label="Toplam Temettü"
          value={<span className="text-brand-green">{currencyFmt.format(summary?.totalDividends ?? 0)}</span>}
        />
        <SummaryCard label="Pozisyon Sayısı" value={summary?.positionCount ?? 0} />
      </div>

      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Pozisyonlar</h2>
        <select
          value={accountFilter}
          onChange={(e) => setAccountFilter(e.target.value)}
          className="rounded border border-gray-300 px-3 py-1.5 text-sm"
        >
          <option value="all">Tüm Kurumlar</option>
          {accountOptions.map((label) => (
            <option key={label} value={label}>
              {label}
            </option>
          ))}
        </select>
      </div>

      <div className="overflow-x-auto rounded-lg bg-white shadow-sm">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-200 text-left text-gray-500">
              <th className="px-4 py-3">Sembol</th>
              <th className="px-4 py-3">Adet</th>
              <th className="px-4 py-3">Ort. Maliyet</th>
              <th className="px-4 py-3">Güncel Fiyat</th>
              <th className="px-4 py-3">Günlük %</th>
              <th className="px-4 py-3">Günlük K/Z</th>
              <th className="px-4 py-3">P&L%</th>
              <th className="px-4 py-3">P&L TL</th>
              <th className="px-4 py-3">Gerçekleşmiş K/Z</th>
              <th className="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody>
            {isLoading && (
              <tr>
                <td colSpan={10} className="px-4 py-6 text-center text-gray-400">
                  Yükleniyor...
                </td>
              </tr>
            )}
            {!isLoading && filteredPositions.length === 0 && (
              <tr>
                <td colSpan={10} className="px-4 py-6 text-center text-gray-400">
                  Pozisyon bulunamadı
                </td>
              </tr>
            )}
            {filteredPositions.map((p) => (
              <tr key={p.symbol} className="border-b border-gray-100 last:border-0 hover:bg-brand-bg/60">
                <td className="px-4 py-3 font-medium">
                  <Link to={`/stocks/${p.symbol}`} className="hover:underline">
                    {p.symbol}
                  </Link>
                </td>
                <td className="px-4 py-3">{p.totalQuantity}</td>
                <td className="px-4 py-3">{currencyFmt.format(p.averageCost)}</td>
                <td className="px-4 py-3">
                  {p.priceAvailable === false ? (
                    <span className="rounded bg-gray-100 px-2 py-0.5 text-xs italic text-gray-500">
                      Fiyat bekleniyor
                    </span>
                  ) : (
                    <TickingValue value={p.lastPrice} format={(v) => currencyFmt.format(v)} />
                  )}
                </td>
                <td className="px-4 py-3">
                  {p.priceAvailable === false ? (
                    <span className="text-gray-400">-</span>
                  ) : (
                    <span className={p.dailyChangePct >= 0 ? 'text-brand-green' : 'text-brand-red'}>
                      {p.dailyChangePct >= 0 ? '+' : ''}
                      {p.dailyChangePct.toFixed(2)}%
                    </span>
                  )}
                </td>
                <td className="px-4 py-3">
                  {p.priceAvailable === false ? (
                    <span className="text-gray-400">-</span>
                  ) : (
                    <PnlBadge value={p.dailyChange} />
                  )}
                </td>
                <td className="px-4 py-3">
                  {p.priceAvailable === false ? (
                    <span className="text-gray-400">-</span>
                  ) : (
                    <span className={p.unrealizedPnlPct >= 0 ? 'text-brand-green' : 'text-brand-red'}>
                      {p.unrealizedPnlPct >= 0 ? '+' : ''}
                      {p.unrealizedPnlPct.toFixed(2)}%
                    </span>
                  )}
                </td>
                <td className="px-4 py-3">
                  {p.priceAvailable === false ? (
                    <span className="text-gray-400">-</span>
                  ) : (
                    <PnlBadge value={p.unrealizedPnl} />
                  )}
                </td>
                <td className="px-4 py-3">
                  {p.realizedPnl === null || p.realizedPnl === undefined || p.realizedPnl === 0 ? (
                    <span className="text-gray-400">-</span>
                  ) : (
                    <PnlBadge value={p.realizedPnl} />
                  )}
                </td>
                <td className="px-4 py-3 text-right">
                  <div className="flex justify-end gap-1.5">
                    <button
                      onClick={() => setQuickTxPosition({ position: p, type: 'SELL' })}
                      title="Hızlı satım ekle"
                      className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-red-50 font-semibold text-brand-red hover:bg-brand-red hover:text-white"
                    >
                      −
                    </button>
                    <button
                      onClick={() => setQuickTxPosition({ position: p, type: 'BUY' })}
                      title="Hızlı alım ekle"
                      className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-brand-green-light font-semibold text-brand-green-dark hover:bg-brand-green hover:text-white"
                    >
                      +
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <h2 className="text-lg font-semibold">Kurum Bazlı Rapor</h2>

      <div className="overflow-x-auto rounded-lg bg-white shadow-sm">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-200 text-left text-gray-500">
              <th className="px-4 py-3">Kurum</th>
              <th className="px-4 py-3">Pozisyon</th>
              <th className="px-4 py-3">Toplam Maliyet</th>
              <th className="px-4 py-3">Güncel Değer</th>
              <th className="px-4 py-3">P&L%</th>
              <th className="px-4 py-3">P&L TL</th>
            </tr>
          </thead>
          <tbody>
            {isAccountReportLoading && (
              <tr>
                <td colSpan={6} className="px-4 py-6 text-center text-gray-400">
                  Yükleniyor...
                </td>
              </tr>
            )}
            {!isAccountReportLoading && accountReport.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-6 text-center text-gray-400">
                  Kurum verisi bulunamadı
                </td>
              </tr>
            )}
            {accountReport.map((r) => (
              <tr key={r.accountId} className="border-b border-gray-100 last:border-0 hover:bg-brand-bg/60">
                <td className="px-4 py-3 font-medium">{r.accountLabel}</td>
                <td className="px-4 py-3">{r.positionCount}</td>
                <td className="px-4 py-3">{currencyFmt.format(r.totalCost)}</td>
                <td className="px-4 py-3">{currencyFmt.format(r.totalValue)}</td>
                <td className="px-4 py-3">
                  <span className={r.unrealizedPnlPct >= 0 ? 'text-brand-green' : 'text-brand-red'}>
                    {r.unrealizedPnlPct >= 0 ? '+' : ''}
                    {r.unrealizedPnlPct.toFixed(2)}%
                  </span>
                </td>
                <td className="px-4 py-3">
                  <PnlBadge value={r.unrealizedPnl} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {quickTxPosition && (
        <QuickTransactionModal
          position={quickTxPosition.position}
          defaultType={quickTxPosition.type}
          onClose={() => setQuickTxPosition(null)}
        />
      )}
    </div>
  )
}
