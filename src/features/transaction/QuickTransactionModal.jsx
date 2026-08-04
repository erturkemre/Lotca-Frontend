import { useState } from 'react'
import { notifyError, notifySuccess } from '../../shared/utils/notify'
import { useCreateTransaction } from './useTransactions'

export default function QuickTransactionModal({ position, defaultType = 'SELL', onClose }) {
  const accounts = position.byAccount
  const createTransaction = useCreateTransaction()

  const [form, setForm] = useState({
    accountId: accounts.length === 1 ? accounts[0].accountId : '',
    type: defaultType,
    quantity: '',
    price: position.priceAvailable === false ? '' : (position.lastPrice ?? ''),
    date: new Date().toISOString().slice(0, 10),
    fee: '',
    note: '',
  })

  function handleChange(e) {
    const { name, value } = e.target
    setForm((prev) => ({ ...prev, [name]: value }))
  }

  function handleSubmit(e) {
    e.preventDefault()
    createTransaction.mutate(
      {
        accountId: form.accountId,
        symbol: position.symbol,
        type: form.type,
        quantity: Number(form.quantity),
        price: Number(form.price),
        date: form.date,
        fee: form.fee === '' ? 0 : Number(form.fee),
        note: form.note,
      },
      {
        onSuccess: () => {
          notifySuccess('İşlem eklendi')
          onClose()
        },
        onError: (error) => notifyError(error, 'İşlem eklenemedi'),
      }
    )
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
      <div className="w-full max-w-sm rounded-lg bg-white p-5 shadow-lg">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-lg font-semibold text-brand-dark">{position.symbol} — Hızlı İşlem</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3">
          <select
            name="type"
            value={form.type}
            onChange={handleChange}
            className="w-full rounded border border-gray-300 px-3 py-2"
          >
            <option value="SELL">Satım</option>
            <option value="BUY">Alım</option>
          </select>

          {accounts.length === 1 ? (
            <div className="rounded border border-gray-200 bg-brand-bg px-3 py-2 text-sm text-gray-600">
              Kurum: <span className="font-medium text-brand-dark">{accounts[0].accountLabel}</span>
            </div>
          ) : (
            <select
              name="accountId"
              value={form.accountId}
              onChange={handleChange}
              required
              className="w-full rounded border border-gray-300 px-3 py-2"
            >
              <option value="">Kurum seçin</option>
              {accounts.map((acc) => (
                <option key={acc.accountId} value={acc.accountId}>
                  {acc.accountLabel} ({acc.quantity} adet)
                </option>
              ))}
            </select>
          )}

          <input
            name="quantity"
            value={form.quantity}
            onChange={handleChange}
            type="number"
            step="0.000001"
            placeholder="Adet"
            required
            autoFocus
            className="w-full rounded border border-gray-300 px-3 py-2"
          />

          <input
            name="price"
            value={form.price}
            onChange={handleChange}
            type="number"
            step="0.0001"
            placeholder="Fiyat"
            required
            className="w-full rounded border border-gray-300 px-3 py-2"
          />

          <input
            name="date"
            value={form.date}
            onChange={handleChange}
            type="date"
            required
            className="w-full rounded border border-gray-300 px-3 py-2"
          />

          <input
            name="fee"
            value={form.fee}
            onChange={handleChange}
            type="number"
            step="0.0001"
            placeholder="Komisyon (opsiyonel)"
            className="w-full rounded border border-gray-300 px-3 py-2"
          />

          <div className="flex gap-2 pt-1">
            <button
              type="submit"
              disabled={createTransaction.isPending || !form.accountId}
              className="flex-1 rounded bg-brand-green px-4 py-2 font-medium text-white hover:bg-brand-green-dark disabled:opacity-50"
            >
              {createTransaction.isPending ? 'Kaydediliyor...' : 'Kaydet'}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="rounded border border-gray-300 px-4 py-2 font-medium text-gray-600 hover:bg-gray-50"
            >
              Vazgeç
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
