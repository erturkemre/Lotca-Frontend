import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import api from '../../shared/api/axios'
import { endpoints } from '../../shared/api/endpoints'

export function useAccounts() {
  return useQuery({
    queryKey: ['accounts'],
    queryFn: async () => {
      const { data } = await api.get(endpoints.accounts)
      return data
    },
  })
}

export function useBrokerOptions() {
  return useQuery({
    queryKey: ['accounts', 'brokers'],
    queryFn: async () => {
      const { data } = await api.get(endpoints.accountBrokers)
      return data
    },
    staleTime: Infinity,
  })
}

export function useCreateAccount() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (payload) => {
      const { data } = await api.post(endpoints.accounts, payload)
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['accounts'] })
    },
  })
}

export function useUpdateAccount() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ id, ...payload }) => {
      const { data } = await api.put(`${endpoints.accounts}/${id}`, payload)
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['accounts'] })
    },
  })
}

export function useDeleteAccount() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (id) => {
      await api.delete(`${endpoints.accounts}/${id}`)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['accounts'] })
    },
  })
}
