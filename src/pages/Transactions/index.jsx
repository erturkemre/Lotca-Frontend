import { useState } from 'react'
import TransactionForm from '../../features/transaction/TransactionForm'
import { useDeleteTransaction, useTransactions } from '../../features/transaction/useTransactions'
import { useAccounts } from '../../features/account/useAccounts'
import ConfirmDialog from '../../shared/components/ConfirmDialog'
import { downloadCsv } from '../../shared/utils/csv'
import { notifyError, notifySuccess } from '../../shared/utils/notify'

const PAGE_SIZE = 20
const emptyFilters = { symbol: '', accountId: '', type: '' }

export default function Transactions() {
  const [showForm, setShowForm] = useState(false)
  const [editingTransaction, setEditingTransaction] = useState(null)
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [page, setPage] = useState(0)
  const [filters, setFilters] = useState(emptyFilters)

  const { data: accounts = [] } = useAccounts()
  const { data, isLoading } = useTransactions({
    page,
    size: PAGE_SIZE,
    symbol: filters.symbol || undefined,
    accountId: filters.accountId || undefined,
    type: filters.type || undefined,
  })
  const deleteTransaction = useDeleteTransaction()

  const currencyFmt = new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' })
  const transactions = data?.content ?? []
  const totalPages = data?.totalPages ?? 0
  const totalElements = data?.totalElements ?? 0
  const hasActiveFilters = filters.symbol || filters.accountId || filters.type

  function handleNewClick() {
    setEditingTransaction(null)
    setShowForm((v) => !v)
  }

  function handleEditClick(transaction) {
    setEditingTransaction(transaction)
    setShowForm(true)
  }

  function handleFormClose() {
    setShowForm(false)
    setEditingTransaction(null)
  }

  function handleFilterChange(e) {
    const { name, value } = e.target
    setFilters((prev) => ({ ...prev, [name]: name === 'symbol' ? value.toUpperCase() : value }))
    setPage(0)
  }

  function handleClearFilters() {
    setFilters(emptyFilters)
    setPage(0)
  }

  function handleDelete() {
    deleteTransaction.mutate(deleteTarget.id, {
      onSuccess: () => {
        notifySuccess('İşlem silindi')
        setDeleteTarget(null)
      },
      onError: (error) => {
        notifyError(error, 'İşlem silinemedi')
        setDeleteTarget(null)
      },
    })
  }

  function handleExportCsv() {
    downloadCsv(
      `lotca-islemler-${new Date().toISOString().slice(0, 10)}.csv`,
      ['Tarih', 'Sembol', 'Kurum', 'İşlem', 'Adet', 'Fiyat', 'Komisyon', 'Not'],
      transactions.map((t) => [
        t.date,
        t.symbol,
        t.accountLabel,
        t.type === 'BUY' ? 'Alım' : 'Satım',
        t.quantity,
        t.price,
        t.fee || 0,
        t.note || '',
      ])
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">İşlemler</h1>
        <div className="flex gap-2">
          <button
            onClick={handleExportCsv}
            disabled={transactions.length === 0}
            className="rounded border border-gray-300 px-4 py-2 font-medium text-gray-600 hover:bg-gray-50 disabled:opacity-50"
          >
            CSV İndir
          </button>
          <button
            onClick={handleNewClick}
            className="rounded bg-brand-green px-4 py-2 font-medium text-white hover:bg-brand-green-dark"
          >
            {showForm && !editingTransaction ? 'Kapat' : 'Yeni İşlem'}
          </button>
        </div>
      </div>

      {showForm && (
        <TransactionForm
          transaction={editingTransaction}
          onSuccess={handleFormClose}
          onCancel={handleFormClose}
        />
      )}

      <div className="flex flex-wrap items-center gap-2 rounded-lg bg-white p-3 shadow-sm">
        <input
          name="symbol"
          value={filters.symbol}
          onChange={handleFilterChange}
          placeholder="Sembol (örn. THYAO)"
          className="rounded border border-gray-300 px-3 py-1.5 text-sm"
        />
        <select
          name="accountId"
          value={filters.accountId}
          onChange={handleFilterChange}
          className="rounded border border-gray-300 px-3 py-1.5 text-sm"
        >
          <option value="">Tüm Kurumlar</option>
          {accounts.map((acc) => (
            <option key={acc.id} value={acc.id}>
              {acc.label || acc.brokerLabel}
            </option>
          ))}
        </select>
        <select
          name="type"
          value={filters.type}
          onChange={handleFilterChange}
          className="rounded border border-gray-300 px-3 py-1.5 text-sm"
        >
          <option value="">Alım / Satım</option>
          <option value="BUY">Alım</option>
          <option value="SELL">Satım</option>
        </select>
        {hasActiveFilters && (
          <button
            onClick={handleClearFilters}
            className="rounded px-3 py-1.5 text-sm text-brand-red hover:underline"
          >
            Filtreleri Temizle
          </button>
        )}
      </div>

      <div className="overflow-x-auto rounded-lg bg-white shadow-sm">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-200 text-left text-gray-500">
              <th className="px-4 py-3">Tarih</th>
              <th className="px-4 py-3">Sembol</th>
              <th className="px-4 py-3">Kurum</th>
              <th className="px-4 py-3">İşlem</th>
              <th className="px-4 py-3">Adet</th>
              <th className="px-4 py-3">Fiyat</th>
              <th className="px-4 py-3">Komisyon</th>
              <th className="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody>
            {isLoading && (
              <tr>
                <td colSpan={8} className="px-4 py-6 text-center text-gray-400">
                  Yükleniyor...
                </td>
              </tr>
            )}
            {!isLoading && transactions.length === 0 && (
              <tr>
                <td colSpan={8} className="px-4 py-6 text-center text-gray-400">
                  {hasActiveFilters ? 'Filtreye uyan işlem bulunamadı' : 'İşlem bulunamadı'}
                </td>
              </tr>
            )}
            {transactions.map((t) => (
              <tr key={t.id} className="border-b border-gray-100 last:border-0">
                <td className="px-4 py-3">{t.date}</td>
                <td className="px-4 py-3 font-medium">{t.symbol}</td>
                <td className="px-4 py-3">{t.accountLabel}</td>
                <td className="px-4 py-3">
                  <span className={t.type === 'BUY' ? 'text-brand-green' : 'text-brand-red'}>
                    {t.type === 'BUY' ? 'Alım' : 'Satım'}
                  </span>
                </td>
                <td className="px-4 py-3">{t.quantity}</td>
                <td className="px-4 py-3">{currencyFmt.format(t.price)}</td>
                <td className="px-4 py-3">{t.fee ? currencyFmt.format(t.fee) : '-'}</td>
                <td className="px-4 py-3 text-right">
                  <div className="flex justify-end gap-3">
                    <button onClick={() => handleEditClick(t)} className="text-brand-mid hover:underline">
                      Düzenle
                    </button>
                    <button onClick={() => setDeleteTarget(t)} className="text-brand-red hover:underline">
                      Sil
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-between text-sm text-gray-500">
          <span>
            Sayfa {page + 1} / {totalPages} · {totalElements} işlem
          </span>
          <div className="flex gap-2">
            <button
              onClick={() => setPage((p) => Math.max(0, p - 1))}
              disabled={page === 0}
              className="rounded border border-gray-300 px-3 py-1.5 hover:bg-gray-50 disabled:opacity-40"
            >
              Önceki
            </button>
            <button
              onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
              disabled={page >= totalPages - 1}
              className="rounded border border-gray-300 px-3 py-1.5 hover:bg-gray-50 disabled:opacity-40"
            >
              Sonraki
            </button>
          </div>
        </div>
      )}

      <ConfirmDialog
        open={!!deleteTarget}
        title="İşlemi sil"
        message={`${deleteTarget?.symbol} - ${deleteTarget?.date} tarihli işlemi silmek istediğinize emin misiniz?`}
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  )
}
