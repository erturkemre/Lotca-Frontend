import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useRegister } from '../../features/auth/useAuth'

export default function Register() {
  const navigate = useNavigate()
  const register = useRegister()
  const [form, setForm] = useState({ email: '', password: '' })

  function handleSubmit(e) {
    e.preventDefault()
    register.mutate(form, { onSuccess: () => navigate('/') })
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-brand-bg">
      <div className="w-full max-w-sm rounded-lg bg-white p-6 shadow-sm">
        <h1 className="mb-6 text-center text-2xl font-semibold text-brand-dark">Lotça'ya Kayıt Ol</h1>
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
            placeholder="Şifre (en az 8 karakter)"
            value={form.password}
            onChange={(e) => setForm((p) => ({ ...p, password: e.target.value }))}
            required
            minLength={8}
            className="w-full rounded border border-gray-300 px-3 py-2"
          />
          {register.isError && (
            <p className="text-sm text-brand-red">
              {register.error?.response?.data?.message || 'Kayıt başarısız'}
            </p>
          )}
          <button
            type="submit"
            disabled={register.isPending}
            className="w-full rounded bg-brand-green px-4 py-2 font-medium text-white hover:bg-brand-green-dark disabled:opacity-50"
          >
            {register.isPending ? 'Kayıt yapılıyor...' : 'Kayıt Ol'}
          </button>
        </form>
        <p className="mt-4 text-center text-sm text-gray-500">
          Zaten hesabın var mı?{' '}
          <Link to="/login" className="text-brand-green hover:underline">
            Giriş yap
          </Link>
        </p>
      </div>
    </div>
  )
}
