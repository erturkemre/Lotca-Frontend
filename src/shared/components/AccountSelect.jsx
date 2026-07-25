import { useState } from 'react'
import { useAccounts, useBrokerOptions, useCreateAccount } from '../../features/account/useAccounts'

export default function AccountSelect({ value, onChange, required }) {
  const { data: accounts = [] } = useAccounts()
  const { data: brokers = [] } = useBrokerOptions()
  const createAccount = useCreateAccount()

  const [showForm, setShowForm] = useState(false)
  const [brokerName, setBrokerName] = useState('')
  const [label, setLabel] = useState('')

  function handleCreate(e) {
    e.preventDefault()
    createAccount.mutate(
      { brokerName, label },
      {
        onSuccess: (account) => {
          onChange(account.id)
          setShowForm(false)
          setBrokerName('')
          setLabel('')
        },
      }
    )
  }

  return (
    <div className="col-span-2 space-y-2 sm:col-span-1">
      <div className="flex gap-2">
        <select
          value={value}
          onChange={(e) => onChange(e.target.value)}
          required={required}
          className="w-full rounded border border-gray-300 px-3 py-2"
        >
          <option value="">Kurum seçin</option>
          {accounts.map((acc) => (
            <option key={acc.id} value={acc.id}>
              {acc.label || acc.brokerLabel}
            </option>
          ))}
        </select>
        <button
          type="button"
          onClick={() => setShowForm((v) => !v)}
          className="whitespace-nowrap rounded border border-brand-green px-3 py-2 text-sm text-brand-green hover:bg-brand-green-light"
        >
          {showForm ? 'Vazgeç' : '+ Yeni Kurum'}
        </button>
      </div>

      {showForm && (
        <div className="space-y-2 rounded border border-gray-200 bg-brand-bg p-3">
          <select
            value={brokerName}
            onChange={(e) => setBrokerName(e.target.value)}
            className="w-full rounded border border-gray-300 px-3 py-2"
          >
            <option value="">Aracı kurum seçin</option>
            {brokers.map((b) => (
              <option key={b.name} value={b.name}>
                {b.label}
              </option>
            ))}
          </select>
          <input
            value={label}
            onChange={(e) => setLabel(e.target.value)}
            placeholder="Etiket (opsiyonel, örn. Ana Hesap)"
            className="w-full rounded border border-gray-300 px-3 py-2"
          />
          <button
            type="button"
            onClick={handleCreate}
            disabled={!brokerName || createAccount.isPending}
            className="w-full rounded bg-brand-green px-3 py-2 text-sm font-medium text-white hover:bg-brand-green-dark disabled:opacity-50"
          >
            {createAccount.isPending ? 'Ekleniyor...' : 'Kurumu Kaydet'}
          </button>
        </div>
      )}
    </div>
  )
}
