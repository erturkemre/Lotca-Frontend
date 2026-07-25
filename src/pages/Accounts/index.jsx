import { useState } from 'react'
import ConfirmDialog from '../../shared/components/ConfirmDialog'
import { notifyError, notifySuccess } from '../../shared/utils/notify'
import {
  useAccounts,
  useBrokerOptions,
  useCreateAccount,
  useDeleteAccount,
  useUpdateAccount,
} from '../../features/account/useAccounts'

const emptyForm = { brokerName: '', label: '' }

export default function Accounts() {
  const { data: accounts = [], isLoading } = useAccounts()
  const { data: brokers = [] } = useBrokerOptions()
  const createAccount = useCreateAccount()
  const updateAccount = useUpdateAccount()
  const deleteAccount = useDeleteAccount()

  const [showForm, setShowForm] = useState(false)
  const [editingAccount, setEditingAccount] = useState(null)
  const [form, setForm] = useState(emptyForm)
  const [deleteTarget, setDeleteTarget] = useState(null)

  const isEditing = !!editingAccount

  function openCreateForm() {
    setEditingAccount(null)
    setForm(emptyForm)
    setShowForm((v) => !v)
  }

  function openEditForm(account) {
    setEditingAccount(account)
    setForm({ brokerName: account.brokerName, label: account.label || '' })
    setShowForm(true)
  }

  function closeForm() {
    setShowForm(false)
    setEditingAccount(null)
    setForm(emptyForm)
  }

  function handleSubmit(e) {
    e.preventDefault()

    if (isEditing) {
      updateAccount.mutate(
        { id: editingAccount.id, ...form },
        {
          onSuccess: () => {
            notifySuccess('Kurum güncellendi')
            closeForm()
          },
          onError: (error) => notifyError(error, 'Kurum güncellenemedi'),
        }
      )
    } else {
      createAccount.mutate(form, {
        onSuccess: () => {
          notifySuccess('Kurum eklendi')
          closeForm()
        },
        onError: (error) => notifyError(error, 'Kurum eklenemedi'),
      })
    }
  }

  function handleDelete() {
    deleteAccount.mutate(deleteTarget.id, {
      onSuccess: () => {
        notifySuccess('Kurum silindi')
        setDeleteTarget(null)
      },
      onError: (error) => {
        notifyError(error, 'Kurum silinemedi')
        setDeleteTarget(null)
      },
    })
  }

  const isSaving = createAccount.isPending || updateAccount.isPending

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Kurumlar</h1>
        <button
          onClick={openCreateForm}
          className="rounded bg-brand-green px-4 py-2 font-medium text-white hover:bg-brand-green-dark"
        >
          {showForm && !isEditing ? 'Kapat' : 'Yeni Kurum'}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-3 rounded-lg bg-white p-4 shadow-sm">
          <select
            value={form.brokerName}
            onChange={(e) => setForm((prev) => ({ ...prev, brokerName: e.target.value }))}
            required
            className="rounded border border-gray-300 px-3 py-2"
          >
            <option value="">Aracı kurum seçin</option>
            {brokers.map((b) => (
              <option key={b.name} value={b.name}>
                {b.label}
              </option>
            ))}
          </select>
          <input
            value={form.label}
            onChange={(e) => setForm((prev) => ({ ...prev, label: e.target.value }))}
            placeholder="Etiket (opsiyonel, örn. Ana Hesap)"
            className="rounded border border-gray-300 px-3 py-2"
          />
          <div className="col-span-2 flex gap-2">
            <button
              type="submit"
              disabled={isSaving}
              className="flex-1 rounded bg-brand-green px-4 py-2 font-medium text-white hover:bg-brand-green-dark disabled:opacity-50"
            >
              {isSaving ? 'Kaydediliyor...' : isEditing ? 'Değişiklikleri Kaydet' : 'Kurumu Ekle'}
            </button>
            <button
              type="button"
              onClick={closeForm}
              className="rounded border border-gray-300 px-4 py-2 font-medium text-gray-600 hover:bg-gray-50"
            >
              Vazgeç
            </button>
          </div>
        </form>
      )}

      <div className="overflow-x-auto rounded-lg bg-white shadow-sm">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-200 text-left text-gray-500">
              <th className="px-4 py-3">Aracı Kurum</th>
              <th className="px-4 py-3">Etiket</th>
              <th className="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody>
            {isLoading && (
              <tr>
                <td colSpan={3} className="px-4 py-6 text-center text-gray-400">
                  Yükleniyor...
                </td>
              </tr>
            )}
            {!isLoading && accounts.length === 0 && (
              <tr>
                <td colSpan={3} className="px-4 py-6 text-center text-gray-400">
                  Henüz kurum eklenmedi
                </td>
              </tr>
            )}
            {accounts.map((acc) => (
              <tr key={acc.id} className="border-b border-gray-100 last:border-0">
                <td className="px-4 py-3 font-medium">{acc.brokerLabel}</td>
                <td className="px-4 py-3">{acc.label || '-'}</td>
                <td className="px-4 py-3 text-right">
                  <div className="flex justify-end gap-3">
                    <button onClick={() => openEditForm(acc)} className="text-brand-mid hover:underline">
                      Düzenle
                    </button>
                    <button onClick={() => setDeleteTarget(acc)} className="text-brand-red hover:underline">
                      Sil
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <ConfirmDialog
        open={!!deleteTarget}
        title="Kurumu sil"
        message={`"${deleteTarget?.brokerLabel}${deleteTarget?.label ? ` (${deleteTarget.label})` : ''}" hesabını silmek istediğinize emin misiniz?`}
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  )
}
