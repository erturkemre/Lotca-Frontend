import { useState } from 'react'
import AccountSelect from '../../shared/components/AccountSelect'
import ConfirmDialog from '../../shared/components/ConfirmDialog'
import SymbolAutocomplete from '../../shared/components/SymbolAutocomplete'
import { notifyError, notifySuccess } from '../../shared/utils/notify'
import { useCreateDividend, useDeleteDividend, useDividends } from '../../features/dividend/useDividends'

const initialForm = {
  accountId: '',
  symbol: '',
  date: new Date().toISOString().slice(0, 10),
  amount: '',
  note: '',
}

export default function Dividends() {
  const { data: dividends = [], isLoading } = useDividends()
  const createDividend = useCreateDividend()
  const deleteDividend = useDeleteDividend()

  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState(initialForm)
  const [deleteTarget, setDeleteTarget] = useState(null)

  const currencyFmt = new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' })
  const totalAmount = dividends.reduce((sum, d) => sum + d.amount, 0)

  function handleChange(e) {
    const { name, value } = e.target
    setForm((prev) => ({ ...prev, [name]: value }))
  }

  function handleSubmit(e) {
    e.preventDefault()
    createDividend.mutate(
      { ...form, symbol: form.symbol.toUpperCase(), amount: Number(form.amount) },
      {
        onSuccess: () => {
          notifySuccess('Temettü kaydedildi')
          setForm(initialForm)
          setShowForm(false)
        },
        onError: (error) => notifyError(error, 'Temettü eklenemedi'),
      }
    )
  }

  function handleDelete() {
    deleteDividend.mutate(deleteTarget.id, {
      onSuccess: () => {
        notifySuccess('Temettü silindi')
        setDeleteTarget(null)
      },
      onError: (error) => {
        notifyError(error, 'Temettü silinemedi')
        setDeleteTarget(null)
      },
    })
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Temettüler</h1>
        <button
          onClick={() => setShowForm((v) => !v)}
          className="rounded bg-brand-green px-4 py-2 font-medium text-white hover:bg-brand-green-dark"
        >
          {showForm ? 'Kapat' : 'Yeni Temettü'}
        </button>
      </div>

      <div className="rounded-lg bg-white p-4 shadow-sm">
        <div className="text-sm text-gray-500">Toplam Temettü Geliri</div>
        <div className="mt-1 text-2xl font-semibold text-brand-green">{currencyFmt.format(totalAmount)}</div>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-3 rounded-lg bg-white p-4 shadow-sm">
          <AccountSelect
            value={form.accountId}
            onChange={(accountId) => setForm((prev) => ({ ...prev, accountId }))}
            required
          />
          <SymbolAutocomplete
            value={form.symbol}
            onChange={(symbol) => setForm((prev) => ({ ...prev, symbol }))}
            required
          />
          <input
            name="date"
            value={form.date}
            onChange={handleChange}
            type="date"
            required
            className="rounded border border-gray-300 px-3 py-2"
          />
          <input
            name="amount"
            value={form.amount}
            onChange={handleChange}
            type="number"
            step="0.0001"
            placeholder="Tutar (TL)"
            required
            className="rounded border border-gray-300 px-3 py-2"
          />
          <input
            name="note"
            value={form.note}
            onChange={handleChange}
            placeholder="Not (opsiyonel)"
            className="col-span-2 rounded border border-gray-300 px-3 py-2"
          />
          <button
            type="submit"
            disabled={createDividend.isPending}
            className="col-span-2 rounded bg-brand-green px-4 py-2 font-medium text-white hover:bg-brand-green-dark disabled:opacity-50"
          >
            {createDividend.isPending ? 'Kaydediliyor...' : 'Temettü Ekle'}
          </button>
        </form>
      )}

      <div className="overflow-x-auto rounded-lg bg-white shadow-sm">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-200 text-left text-gray-500">
              <th className="px-4 py-3">Tarih</th>
              <th className="px-4 py-3">Sembol</th>
              <th className="px-4 py-3">Kurum</th>
              <th className="px-4 py-3">Tutar</th>
              <th className="px-4 py-3">Not</th>
              <th className="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody>
            {isLoading && (
              <tr>
                <td colSpan={6} className="px-4 py-6 text-center text-gray-400">
                  Yükleniyor...
                </td>
              </tr>
            )}
            {!isLoading && dividends.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-6 text-center text-gray-400">
                  Henüz temettü kaydı yok
                </td>
              </tr>
            )}
            {dividends.map((d) => (
              <tr key={d.id} className="border-b border-gray-100 last:border-0">
                <td className="px-4 py-3">{d.date}</td>
                <td className="px-4 py-3 font-medium">{d.symbol}</td>
                <td className="px-4 py-3">{d.accountLabel}</td>
                <td className="px-4 py-3 text-brand-green">{currencyFmt.format(d.amount)}</td>
                <td className="px-4 py-3">{d.note || '-'}</td>
                <td className="px-4 py-3 text-right">
                  <button onClick={() => setDeleteTarget(d)} className="text-brand-red hover:underline">
                    Sil
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <ConfirmDialog
        open={!!deleteTarget}
        title="Temettüyü sil"
        message={`${deleteTarget?.symbol} - ${deleteTarget?.date} tarihli temettü kaydını silmek istediğinize emin misiniz?`}
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  )
}
