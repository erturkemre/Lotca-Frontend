import { useMutation, useQuery } from '@tanstack/react-query'
import api from '../../shared/api/axios'
import { endpoints } from '../../shared/api/endpoints'
import { useAuthStore } from './authStore'

export function useLogin() {
  const setAuth = useAuthStore((s) => s.setAuth)

  return useMutation({
    mutationFn: async ({ email, password }) => {
      const { data } = await api.post(endpoints.auth.login, { email, password })
      return data
    },
    onSuccess: (data) => {
      setAuth(data.token, data.user)
    },
  })
}

export function useRegister() {
  const setAuth = useAuthStore((s) => s.setAuth)

  return useMutation({
    mutationFn: async ({ email, password }) => {
      const { data } = await api.post(endpoints.auth.register, { email, password })
      return data
    },
    onSuccess: (data) => {
      setAuth(data.token, data.user)
    },
  })
}

export function useLogout() {
  const clearAuth = useAuthStore((s) => s.clearAuth)
  return () => clearAuth()
}

export function useMe() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated)

  return useQuery({
    queryKey: ['auth', 'me'],
    queryFn: async () => {
      const { data } = await api.get(endpoints.auth.me)
      return data
    },
    enabled: isAuthenticated,
  })
}

export function useChangePassword() {
  return useMutation({
    mutationFn: async ({ currentPassword, newPassword }) => {
      await api.put(endpoints.auth.password, { currentPassword, newPassword })
    },
  })
}

export function useForgotPassword() {
  return useMutation({
    mutationFn: async ({ email }) => {
      await api.post(endpoints.auth.forgotPassword, { email })
    },
  })
}

export function useResetPassword() {
  return useMutation({
    mutationFn: async ({ token, newPassword }) => {
      await api.post(endpoints.auth.resetPassword, { token, newPassword })
    },
  })
}
