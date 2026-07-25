import { useState } from 'react'
import AccountSelect from '../../shared/components/AccountSelect'
import SymbolAutocomplete from '../../shared/components/SymbolAutocomplete'
import { notifyError, notifySuccess } from '../../shared/utils/notify'
import { useCreateTransaction, useUpdateTransaction } from './useTransactions'

const initialForm = {
  accountId: '',
  symbol: '',
  type: 'BUY',
  quantity: '',
  price: '',
  date: new Date().toISOString().slice(0, 10),
  fee: '',
  note: '',
}

function toFormState(transaction) {
  if (!transaction) return initialForm
  return {
    accountId: transaction.accountId,
    symbol: transaction.symbol,
    type: transaction.type,
    quantity: transaction.quantity,
    price: transaction.price,
    date: transaction.date,
    fee: transaction.fee || '',
    note: transaction.note || '',
  }
}

export default function TransactionForm({ transaction, onSuccess, onCancel }) {
  const [form, setForm] = useState(() => toFormState(transaction))
  const createTransaction = useCreateTransaction()
  const updateTransaction = useUpdateTransaction()
  const isEditing = !!transaction
  const mutation = isEditing ? updateTransaction : createTransaction

  function handleChange(e) {
    const { name, value } = e.target
    setForm((prev) => ({ ...prev, [name]: value }))
  }

  function handleSubmit(e) {
    e.preventDefault()
    const payload = {
      ...form,
      symbol: form.symbol.toUpperCase(),
      quantity: Number(form.quantity),
      price: Number(form.price),
      fee: form.fee === '' ? 0 : Number(form.fee),
    }

    mutation.mutate(isEditing ? { id: transaction.id, ...payload } : payload, {
      onSuccess: () => {
        setForm(initialForm)
        notifySuccess(isEditing ? 'İşlem güncellendi' : 'İşlem eklendi')
        onSuccess?.()
      },
      onError: (error) => notifyError(error, isEditing ? 'İşlem güncellenemedi' : 'İşlem eklenemedi'),
    })
  }

  return (
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

      <select
        name="type"
        value={form.type}
        onChange={handleChange}
        className="rounded border border-gray-300 px-3 py-2"
      >
        <option value="BUY">Alım</option>
        <option value="SELL">Satım</option>
      </select>

      <input
        name="quantity"
        value={form.quantity}
        onChange={handleChange}
        type="number"
        step="0.000001"
        placeholder="Adet"
        required
        className="rounded border border-gray-300 px-3 py-2"
      />

      <input
        name="price"
        value={form.price}
        onChange={handleChange}
        type="number"
        step="0.0001"
        placeholder="Fiyat"
        required
        className="rounded border border-gray-300 px-3 py-2"
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
        name="fee"
        value={form.fee}
        onChange={handleChange}
        type="number"
        step="0.0001"
        placeholder="Komisyon (opsiyonel)"
        className="rounded border border-gray-300 px-3 py-2"
      />

      <input
        name="note"
        value={form.note}
        onChange={handleChange}
        placeholder="Not (opsiyonel)"
        className="rounded border border-gray-300 px-3 py-2"
      />

      <div className="col-span-2 flex gap-2">
        <button
          type="submit"
          disabled={mutation.isPending}
          className="flex-1 rounded bg-brand-green px-4 py-2 font-medium text-white hover:bg-brand-green-dark disabled:opacity-50"
        >
          {mutation.isPending ? 'Kaydediliyor...' : isEditing ? 'Değişiklikleri Kaydet' : 'İşlem Ekle'}
        </button>
        {isEditing && (
          <button
            type="button"
            onClick={onCancel}
            className="rounded border border-gray-300 px-4 py-2 font-medium text-gray-600 hover:bg-gray-50"
          >
            Vazgeç
          </button>
        )}
      </div>
    </form>
  )
}
