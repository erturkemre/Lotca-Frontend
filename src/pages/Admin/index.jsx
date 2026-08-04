import { useState } from 'react'
import ConfirmDialog from '../../shared/components/ConfirmDialog'
import { notifyError, notifySuccess } from '../../shared/utils/notify'
import {
  useAdminSettings,
  useAdminStats,
  useAdminUsers,
  useDeleteUser,
  useSetRegistrationEnabled,
  useUpdateUserRole,
} from '../../features/admin/useAdmin'
import { useAuthStore } from '../../features/auth/authStore'

export default function Admin() {
  const currentUser = useAuthStore((s) => s.user)
  const { data: users = [], isLoading } = useAdminUsers()
  const { data: stats } = useAdminStats()
  const { data: settings } = useAdminSettings()
  const setRegistrationEnabled = useSetRegistrationEnabled()
  const updateRole = useUpdateUserRole()
  const deleteUser = useDeleteUser()
  const [deleteTarget, setDeleteTarget] = useState(null)

  function handleToggleRegistration() {
    const next = !settings?.registrationEnabled
    setRegistrationEnabled.mutate(next, {
      onSuccess: () => notifySuccess(next ? 'Yeni kayıtlar açıldı' : 'Yeni kayıtlar kapatıldı'),
      onError: (error) => notifyError(error, 'Ayar güncellenemedi'),
    })
  }

  function handleRoleChange(user, role) {
    if (role === user.role) return
    updateRole.mutate(
      { id: user.id, role },
      {
        onSuccess: () => notifySuccess(`${user.email} artık ${role === 'ADMIN' ? 'admin' : 'kullanıcı'}`),
        onError: (error) => notifyError(error, 'Rol güncellenemedi'),
      }
    )
  }

  function handleDelete() {
    deleteUser.mutate(deleteTarget.id, {
      onSuccess: () => {
        notifySuccess('Kullanıcı silindi')
        setDeleteTarget(null)
      },
      onError: (error) => {
        notifyError(error, 'Kullanıcı silinemedi')
        setDeleteTarget(null)
      },
    })
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Yönetim</h1>

      <div className="flex items-center justify-between rounded-lg bg-white p-4 shadow-sm">
        <div>
          <div className="font-medium text-brand-dark">Yeni Kayıtlar</div>
          <div className="text-sm text-gray-500">
            Kapatılırsa siteye kimse yeni hesap açamaz, mevcut kullanıcılar giriş yapmaya devam eder.
          </div>
        </div>
        <button
          type="button"
          onClick={handleToggleRegistration}
          disabled={setRegistrationEnabled.isPending || !settings}
          role="switch"
          aria-checked={settings?.registrationEnabled ?? true}
          className={`inline-flex h-7 w-12 flex-none items-center rounded-full transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-green focus-visible:ring-offset-2 disabled:opacity-50 ${
            settings?.registrationEnabled ?? true ? 'bg-brand-green' : 'bg-gray-300'
          }`}
        >
          <span
            className={`inline-block h-5 w-5 transform rounded-full bg-white shadow transition-transform ${
              settings?.registrationEnabled ?? true ? 'translate-x-6' : 'translate-x-1'
            }`}
          />
        </button>
      </div>

      {stats && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div className="rounded-lg bg-white p-4 shadow-sm">
            <div className="text-sm text-gray-500">Toplam Kullanıcı</div>
            <div className="mt-1 text-2xl font-semibold">{stats.totalUsers}</div>
          </div>
          <div className="rounded-lg bg-white p-4 shadow-sm">
            <div className="text-sm text-gray-500">Toplam İşlem</div>
            <div className="mt-1 text-2xl font-semibold">{stats.totalTransactions}</div>
          </div>
          <div className="rounded-lg bg-white p-4 shadow-sm">
            <div className="text-sm text-gray-500">Takip Edilen Hisse</div>
            <div className="mt-1 text-2xl font-semibold">{stats.totalStocksTracked}</div>
          </div>
        </div>
      )}

      <h2 className="text-lg font-semibold">Kullanıcılar</h2>

      <div className="overflow-x-auto rounded-lg bg-white shadow-sm">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-200 text-left text-gray-500">
              <th className="px-4 py-3">E-posta</th>
              <th className="px-4 py-3">Kayıt Tarihi</th>
              <th className="px-4 py-3">Rol</th>
              <th className="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody>
            {isLoading && (
              <tr>
                <td colSpan={4} className="px-4 py-6 text-center text-gray-400">
                  Yükleniyor...
                </td>
              </tr>
            )}
            {users.map((u) => (
              <tr key={u.id} className="border-b border-gray-100 last:border-0">
                <td className="px-4 py-3 font-medium">{u.email}</td>
                <td className="px-4 py-3">{new Date(u.createdAt).toLocaleDateString('tr-TR')}</td>
                <td className="px-4 py-3">
                  <select
                    value={u.role}
                    onChange={(e) => handleRoleChange(u, e.target.value)}
                    disabled={u.id === currentUser?.id}
                    className="rounded border border-gray-300 px-2 py-1"
                  >
                    <option value="USER">Kullanıcı</option>
                    <option value="ADMIN">Admin</option>
                  </select>
                </td>
                <td className="px-4 py-3 text-right">
                  {u.id !== currentUser?.id && (
                    <button onClick={() => setDeleteTarget(u)} className="text-brand-red hover:underline">
                      Sil
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <ConfirmDialog
        open={!!deleteTarget}
        title="Kullanıcıyı sil"
        message={`"${deleteTarget?.email}" kullanıcısını ve tüm verilerini kalıcı olarak silmek istediğinize emin misiniz?`}
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  )
}
