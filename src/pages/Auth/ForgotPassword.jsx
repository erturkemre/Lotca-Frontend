import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useForgotPassword } from '../../features/auth/useAuth'

export default function ForgotPassword() {
  const forgotPassword = useForgotPassword()
  const [email, setEmail] = useState('')
  const [submitted, setSubmitted] = useState(false)

  function handleSubmit(e) {
    e.preventDefault()
    forgotPassword.mutate({ email }, { onSuccess: () => setSubmitted(true) })
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-brand-bg">
      <div className="w-full max-w-sm rounded-lg bg-white p-6 shadow-sm">
        <h1 className="mb-2 text-center text-2xl font-semibold text-brand-dark">Şifremi Unuttum</h1>
        <p className="mb-6 text-center text-sm text-gray-500">
          E-posta adresinizi girin, şifre sıfırlama bağlantısı gönderelim.
        </p>

        {submitted ? (
          <p className="rounded bg-brand-green-light px-3 py-3 text-center text-sm text-brand-green-dark">
            Eğer bu e-posta adresine ait bir hesap varsa, sıfırlama bağlantısı gönderildi.
          </p>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <input
              type="email"
              placeholder="E-posta"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full rounded border border-gray-300 px-3 py-2"
            />
            <button
              type="submit"
              disabled={forgotPassword.isPending}
              className="w-full rounded bg-brand-green px-4 py-2 font-medium text-white hover:bg-brand-green-dark disabled:opacity-50"
            >
              {forgotPassword.isPending ? 'Gönderiliyor...' : 'Sıfırlama Bağlantısı Gönder'}
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
