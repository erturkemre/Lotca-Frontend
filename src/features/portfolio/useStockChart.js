import { useQuery } from '@tanstack/react-query'
import api from '../../shared/api/axios'
import { endpoints } from '../../shared/api/endpoints'

export function useStockChart(symbol) {
  return useQuery({
    queryKey: ['portfolio', 'chart', symbol],
    queryFn: async () => {
      const { data } = await api.get(endpoints.portfolio.chart(symbol))
      return data
    },
    enabled: !!symbol,
  })
}
