import { useQuery } from '@tanstack/react-query'
import api from '../../shared/api/axios'
import { endpoints } from '../../shared/api/endpoints'

export function useStockChart(symbol, range = '1Y') {
  return useQuery({
    queryKey: ['portfolio', 'chart', symbol, range],
    queryFn: async () => {
      const { data } = await api.get(endpoints.portfolio.chart(symbol), { params: { range } })
      return data
    },
    enabled: !!symbol,
  })
}
