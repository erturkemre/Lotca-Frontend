import { useState } from 'react'
import { useChangePassword, useMe } from '../../features/auth/useAuth'

export default function Profile() {
  const { data: me } = useMe()
  const changePassword = useChangePassword()

  const [form, setForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' })
  const [successMessage, setSuccessMessage] = useState('')

  function handleChange(e) {
    const { name, value } = e.target
    setForm((prev) => ({ ...prev, [name]: value }))
    setSuccessMessage('')
  }

  function handleSubmit(e) {
    e.preventDefault()
    setSuccessMessage('')

    if (form.newPassword !== form.confirmPassword) {
      changePassword.reset()
      return
    }

    changePassword.mutate(
      { currentPassword: form.currentPassword, newPassword: form.newPassword },
      {
        onSuccess: () => {
          setForm({ currentPassword: '', newPassword: '', confirmPassword: '' })
          setSuccessMessage('Şifreniz başarıyla güncellendi.')
        },
      }
    )
  }

  const passwordsMismatch =
    form.confirmPassword.length > 0 && form.newPassword !== form.confirmPassword

  return (
    <div className="mx-auto max-w-lg space-y-6">
      <h1 className="text-2xl font-semibold">Profil</h1>

      <div className="rounded-lg bg-white p-4 shadow-sm">
        <div className="text-sm text-gray-500">E-posta</div>
        <div className="mt-1 font-medium">{me?.email}</div>
      </div>

      <div className="rounded-lg bg-white p-4 shadow-sm">
        <h2 className="mb-4 text-lg font-semibold">Şifre Değiştir</h2>
        <form onSubmit={handleSubmit} className="space-y-3">
          <input
            name="currentPassword"
            value={form.currentPassword}
            onChange={handleChange}
            type="password"
            placeholder="Mevcut şifre"
            required
            className="w-full rounded border border-gray-300 px-3 py-2"
          />
          <input
            name="newPassword"
            value={form.newPassword}
            onChange={handleChange}
            type="password"
            placeholder="Yeni şifre (en az 8 karakter)"
            required
            minLength={8}
            className="w-full rounded border border-gray-300 px-3 py-2"
          />
          <input
            name="confirmPassword"
            value={form.confirmPassword}
            onChange={handleChange}
            type="password"
            placeholder="Yeni şifre (tekrar)"
            required
            minLength={8}
            className="w-full rounded border border-gray-300 px-3 py-2"
          />

          {passwordsMismatch && (
            <p className="text-sm text-brand-red">Yeni şifreler eşleşmiyor.</p>
          )}
          {changePassword.isError && (
            <p className="text-sm text-brand-red">
              {changePassword.error?.response?.data?.message || 'Şifre değiştirilemedi'}
            </p>
          )}
          {successMessage && <p className="text-sm text-brand-green">{successMessage}</p>}

          <button
            type="submit"
            disabled={changePassword.isPending || passwordsMismatch}
            className="w-full rounded bg-brand-green px-4 py-2 font-medium text-white hover:bg-brand-green-dark disabled:opacity-50"
          >
            {changePassword.isPending ? 'Kaydediliyor...' : 'Şifreyi Güncelle'}
          </button>
        </form>
      </div>
    </div>
  )
}
