import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import api from '../../shared/api/axios'
import { endpoints } from '../../shared/api/endpoints'

export function useDividends() {
  return useQuery({
    queryKey: ['dividends'],
    queryFn: async () => {
      const { data } = await api.get(endpoints.dividends)
      return data
    },
  })
}

export function useCreateDividend() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (payload) => {
      const { data } = await api.post(endpoints.dividends, payload)
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['dividends'] })
      queryClient.invalidateQueries({ queryKey: ['portfolio', 'summary'] })
    },
  })
}

export function useDeleteDividend() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (id) => {
      await api.delete(`${endpoints.dividends}/${id}`)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['dividends'] })
      queryClient.invalidateQueries({ queryKey: ['portfolio', 'summary'] })
    },
  })
}
