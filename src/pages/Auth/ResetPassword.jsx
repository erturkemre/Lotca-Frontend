import { useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { useResetPassword } from '../../features/auth/useAuth'

export default function ResetPassword() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const token = searchParams.get('token') || ''
  const resetPassword = useResetPassword()

  const [form, setForm] = useState({ newPassword: '', confirmPassword: '' })
  const [done, setDone] = useState(false)

  const passwordsMismatch =
    form.confirmPassword.length > 0 && form.newPassword !== form.confirmPassword

  function handleSubmit(e) {
    e.preventDefault()
    if (form.newPassword !== form.confirmPassword) return

    resetPassword.mutate(
      { token, newPassword: form.newPassword },
      {
        onSuccess: () => {
          setDone(true)
          setTimeout(() => navigate('/login'), 2000)
        },
      }
    )
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-brand-bg">
      <div className="w-full max-w-sm rounded-lg bg-white p-6 shadow-sm">
        <h1 className="mb-6 text-center text-2xl font-semibold text-brand-dark">Şifre Sıfırla</h1>

        {!token && (
          <p className="rounded bg-red-50 px-3 py-3 text-center text-sm text-brand-red">
            Bağlantı geçersiz. Lütfen e-postanızdaki sıfırlama linkini kullanın.
          </p>
        )}

        {token && done && (
          <p className="rounded bg-brand-green-light px-3 py-3 text-center text-sm text-brand-green-dark">
            Şifreniz güncellendi, giriş sayfasına yönlendiriliyorsunuz...
          </p>
        )}

        {token && !done && (
          <form onSubmit={handleSubmit} className="space-y-4">
            <input
              type="password"
              placeholder="Yeni şifre (en az 8 karakter)"
              value={form.newPassword}
              onChange={(e) => setForm((p) => ({ ...p, newPassword: e.target.value }))}
              required
              minLength={8}
              className="w-full rounded border border-gray-300 px-3 py-2"
            />
            <input
              type="password"
              placeholder="Yeni şifre (tekrar)"
              value={form.confirmPassword}
              onChange={(e) => setForm((p) => ({ ...p, confirmPassword: e.target.value }))}
              required
              minLength={8}
              className="w-full rounded border border-gray-300 px-3 py-2"
            />

            {passwordsMismatch && (
              <p className="text-sm text-brand-red">Şifreler eşleşmiyor.</p>
            )}
            {resetPassword.isError && (
              <p className="text-sm text-brand-red">
                {resetPassword.error?.response?.data?.message || 'Şifre sıfırlanamadı'}
              </p>
            )}

            <button
              type="submit"
              disabled={resetPassword.isPending || passwordsMismatch}
              className="w-full rounded bg-brand-green px-4 py-2 font-medium text-white hover:bg-brand-green-dark disabled:opacity-50"
            >
              {resetPassword.isPending ? 'Kaydediliyor...' : 'Şifreyi Güncelle'}
            </button>
          </form>
        )}

        <p className="mt-4 text-center text-sm text-gray-500">
          <Link to="/login" className="text-brand-green hover:underline">
            Giriş sayfasına dön
          </Link>
        </p>
      </div>
    </div>
  )
}
