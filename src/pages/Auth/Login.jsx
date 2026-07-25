import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useLogin } from '../../features/auth/useAuth'

export default function Login() {
  const navigate = useNavigate()
  const login = useLogin()
  const [form, setForm] = useState({ email: '', password: '' })

  function handleSubmit(e) {
    e.preventDefault()
    login.mutate(form, { onSuccess: () => navigate('/') })
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-brand-bg">
      <div className="w-full max-w-sm rounded-lg bg-white p-6 shadow-sm">
        <h1 className="mb-6 text-center text-2xl font-semibold text-brand-dark">Lotça'ya Giriş</h1>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="email"
            placeholder="E-posta"
            value={form.email}
            onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))}
            required
            className="w-full rounded border border-gray-300 px-3 py-2"
          />
          <input
            type="password"
            placeholder="Şifre"
            value={form.password}
            onChange={(e) => setForm((p) => ({ ...p, password: e.target.value }))}
            required
            className="w-full rounded border border-gray-300 px-3 py-2"
          />
          {login.isError && (
            <p className="text-sm text-brand-red">
              {login.error?.response?.data?.message || 'Giriş başarısız'}
            </p>
          )}
          <div className="text-right">
            <Link to="/forgot-password" className="text-sm text-brand-green hover:underline">
              Şifremi unuttum
            </Link>
          </div>
          <button
            type="submit"
            disabled={login.isPending}
            className="w-full rounded bg-brand-green px-4 py-2 font-medium text-white hover:bg-brand-green-dark disabled:opacity-50"
          >
            {login.isPending ? 'Giriş yapılıyor...' : 'Giriş Yap'}
          </button>
        </form>
        <p className="mt-4 text-center text-sm text-gray-500">
          Hesabın yok mu?{' '}
          <Link to="/register" className="text-brand-green hover:underline">
            Kayıt ol
          </Link>
        </p>
      </div>
    </div>
  )
}
