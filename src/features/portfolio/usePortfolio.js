import { useQuery } from '@tanstack/react-query'
import api from '../../shared/api/axios'
import { endpoints } from '../../shared/api/endpoints'

const REFETCH_INTERVAL = 15 * 60 * 1000

export function usePositions() {
  return useQuery({
    queryKey: ['portfolio', 'positions'],
    queryFn: async () => {
      const { data } = await api.get(endpoints.portfolio.positions)
      return data
    },
    refetchInterval: REFETCH_INTERVAL,
  })
}

export function usePortfolioSummary() {
  return useQuery({
    queryKey: ['portfolio', 'summary'],
    queryFn: async () => {
      const { data } = await api.get(endpoints.portfolio.summary)
      return data
    },
    refetchInterval: REFETCH_INTERVAL,
  })
}

export function usePosition(symbol) {
  return useQuery({
    queryKey: ['portfolio', 'position', symbol],
    queryFn: async () => {
      const { data } = await api.get(endpoints.portfolio.detail(symbol))
      return data
    },
    enabled: !!symbol,
    refetchInterval: REFETCH_INTERVAL,
  })
}

export function useAccountReport() {
  return useQuery({
    queryKey: ['portfolio', 'by-account'],
    queryFn: async () => {
      const { data } = await api.get(endpoints.portfolio.byAccount)
      return data
    },
    refetchInterval: REFETCH_INTERVAL,
  })
}

export function useEquityCurve() {
  return useQuery({
    queryKey: ['portfolio', 'equity-curve'],
    queryFn: async () => {
      const { data } = await api.get(endpoints.portfolio.equityCurve)
      return data
    },
  })
}

export function usePortfolioHistory() {
  return useQuery({
    queryKey: ['portfolio', 'history'],
    queryFn: async () => {
      const { data } = await api.get(endpoints.portfolio.history)
      return data
    },
  })
}
