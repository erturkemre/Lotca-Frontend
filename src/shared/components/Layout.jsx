import { NavLink, Outlet } from 'react-router-dom'
import { useAuthStore } from '../../features/auth/authStore'
import { useLogout } from '../../features/auth/useAuth'

const navItems = [
  { to: '/', label: 'Dashboard' },
  { to: '/transactions', label: 'İşlemler' },
  { to: '/dividends', label: 'Temettüler' },
  { to: '/ipo', label: 'Halka Arz' },
  { to: '/reports', label: 'Raporlar' },
  { to: '/accounts', label: 'Kurumlar' },
]

export default function Layout() {
  const user = useAuthStore((s) => s.user)
  const logout = useLogout()
  const items = user?.role === 'ADMIN' ? [...navItems, { to: '/admin', label: 'Yönetim' }] : navItems

  return (
    <div className="min-h-screen bg-brand-bg">
      <header className="bg-brand-dark text-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
          <div className="text-xl font-semibold">Lotça</div>
          <nav className="flex flex-wrap gap-2">
            {items.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.to === '/'}
                className={({ isActive }) =>
                  `rounded px-3 py-1.5 text-sm ${isActive ? 'bg-brand-mid' : 'hover:bg-brand-mid/60'}`
                }
              >
                {item.label}
              </NavLink>
            ))}
          </nav>
          <div className="flex items-center gap-3 text-sm">
            <NavLink to="/profile" className="text-white/70 hover:text-white hover:underline">
              {user?.email}
            </NavLink>
            <button
              onClick={logout}
              className="rounded bg-brand-mid px-3 py-1.5 hover:bg-brand-mid/80"
            >
              Çıkış
            </button>
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-6xl px-4 py-6">
        <Outlet />
      </main>
    </div>
  )
}
