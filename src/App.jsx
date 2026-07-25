import { Route, Routes } from 'react-router-dom'
import Layout from './shared/components/Layout'
import PrivateRoute from './shared/components/PrivateRoute'
import AdminRoute from './shared/components/AdminRoute'
import Dashboard from './pages/Dashboard'
import StockDetail from './pages/StockDetail'
import Transactions from './pages/Transactions'
import Dividends from './pages/Dividends'
import IPO from './pages/IPO'
import Reports from './pages/Reports'
import Accounts from './pages/Accounts'
import Admin from './pages/Admin'
import Profile from './pages/Profile'
import Login from './pages/Auth/Login'
import Register from './pages/Auth/Register'
import ForgotPassword from './pages/Auth/ForgotPassword'
import ResetPassword from './pages/Auth/ResetPassword'

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/reset-password" element={<ResetPassword />} />

      <Route element={<PrivateRoute />}>
        <Route element={<Layout />}>
          <Route path="/" element={<Dashboard />} />
          <Route path="/stocks/:symbol" element={<StockDetail />} />
          <Route path="/transactions" element={<Transactions />} />
          <Route path="/dividends" element={<Dividends />} />
          <Route path="/ipo" element={<IPO />} />
          <Route path="/reports" element={<Reports />} />
          <Route path="/accounts" element={<Accounts />} />
          <Route path="/profile" element={<Profile />} />

          <Route element={<AdminRoute />}>
            <Route path="/admin" element={<Admin />} />
          </Route>
        </Route>
      </Route>
    </Routes>
  )
}
