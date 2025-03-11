import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'

export interface Metric {
  id: string
  date: string
  revenue: number
  cost: number
  impressions: number
  clicks: number
  ad_impressions: number
  ad_clicks: number
  ad_coverage: number
  viewability: number
  domainId: string
  country?: string
}

// Função para gerar dados aleatórios
function generateRandomMetrics(domainIds: string[], startDate: Date, endDate: Date): Metric[] {
  const metrics: Metric[] = []
  const countries = ['United States', 'Brazil', 'Chile', 'Argentina', 'Mexico', 'Spain', 'Portugal', 'Italy']
  
  // Criar um array de datas entre startDate e endDate
  const dates: Date[] = []
  const currentDate = new Date(startDate)
  while (currentDate <= endDate) {
    dates.push(new Date(currentDate))
    currentDate.setDate(currentDate.getDate() + 1)
  }
  
  // Para cada domínio e data, gerar métricas
  domainIds.forEach(domainId => {
    dates.forEach(date => {
      // Gerar algumas entradas por país para cada data
      countries.forEach(country => {
        if (Math.random() > 0.3) { // 70% de chance de ter dados para este país nesta data
          const impressions = Math.floor(Math.random() * 10000) + 1000
          const clicks = Math.floor(impressions * (Math.random() * 0.1)) // CTR entre 0-10%
          const ad_impressions = Math.floor(impressions * (Math.random() * 0.8 + 0.1)) // 10-90% de impressões com anúncios
          const ad_clicks = Math.floor(ad_impressions * (Math.random() * 0.15)) // CTR de anúncios entre 0-15%
          
          metrics.push({
            id: `${domainId}-${date.toISOString().split('T')[0]}-${country}`,
            date: date.toISOString().split('T')[0],
            revenue: parseFloat((Math.random() * 500 + 50).toFixed(2)),
            cost: parseFloat((Math.random() * 200 + 20).toFixed(2)),
            impressions,
            clicks,
            ad_impressions,
            ad_clicks,
            ad_coverage: parseFloat((ad_impressions / impressions).toFixed(2)),
            viewability: parseFloat((Math.random() * 0.4 + 0.5).toFixed(2)), // 50-90%
            domainId,
            country
          })
        }
      })
      
      // Também adicionar uma entrada sem país (total global)
      const impressions = Math.floor(Math.random() * 50000) + 5000
      const clicks = Math.floor(impressions * (Math.random() * 0.1)) // CTR entre 0-10%
      const ad_impressions = Math.floor(impressions * (Math.random() * 0.8 + 0.1)) // 10-90% de impressões com anúncios
      const ad_clicks = Math.floor(ad_impressions * (Math.random() * 0.15)) // CTR de anúncios entre 0-15%
      
      metrics.push({
        id: `${domainId}-${date.toISOString().split('T')[0]}-global`,
        date: date.toISOString().split('T')[0],
        revenue: parseFloat((Math.random() * 2000 + 200).toFixed(2)),
        cost: parseFloat((Math.random() * 800 + 80).toFixed(2)),
        impressions,
        clicks,
        ad_impressions,
        ad_clicks,
        ad_coverage: parseFloat((ad_impressions / impressions).toFixed(2)),
        viewability: parseFloat((Math.random() * 0.4 + 0.5).toFixed(2)), // 50-90%
        domainId
      })
    })
  })
  
  return metrics
}

export function useMetrics(
  selectedSites: string[] = [], 
  dateRange: { start: Date; end: Date } = { 
    start: new Date(new Date().setDate(new Date().getDate() - 30)), 
    end: new Date() 
  }
) {
  const [metrics, setMetrics] = useState<Metric[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const params = useParams()
  const teamId = params.teamId as string

  useEffect(() => {
    // Simular o carregamento de dados
    setIsLoading(true)
    
    // Timeout para simular uma chamada de API
    const timer = setTimeout(() => {
      // Se não houver sites selecionados, usar alguns IDs de exemplo
      const domainIds = selectedSites.length > 0 
        ? selectedSites 
        : ['site-1', 'site-2', 'site-3']
      
      const data = generateRandomMetrics(domainIds, dateRange.start, dateRange.end)
      setMetrics(data)
      setIsLoading(false)
    }, 800)
    
    return () => clearTimeout(timer)
  }, [selectedSites, dateRange.start, dateRange.end, teamId])

  return {
    data: metrics,
    isLoading,
    isError: false
  }
}

// Funções auxiliares para agregação de dados
export function aggregateMetricsByDate(metrics: Metric[]): Record<string, Metric> {
  const aggregated: Record<string, Metric> = {}
  
  metrics.forEach(metric => {
    const date = metric.date
    
    if (!aggregated[date]) {
      aggregated[date] = {
        ...metric,
        id: `agg-${date}`,
        country: undefined
      }
    } else {
      aggregated[date].revenue += metric.revenue
      aggregated[date].cost += metric.cost
      aggregated[date].impressions += metric.impressions
      aggregated[date].clicks += metric.clicks
      aggregated[date].ad_impressions += metric.ad_impressions
      aggregated[date].ad_clicks += metric.ad_clicks
      // Recalcular médias
      aggregated[date].ad_coverage = aggregated[date].ad_impressions / aggregated[date].impressions
      aggregated[date].viewability = (aggregated[date].viewability + metric.viewability) / 2
    }
  })
  
  return aggregated
}

export function aggregateMetricsByCountry(metrics: Metric[]): Record<string, Metric> {
  const aggregated: Record<string, Metric> = {}
  
  metrics.forEach(metric => {
    if (!metric.country) return // Ignorar entradas sem país
    
    const country = metric.country
    
    if (!aggregated[country]) {
      aggregated[country] = {
        ...metric,
        id: `agg-${country}`,
        date: ''
      }
    } else {
      aggregated[country].revenue += metric.revenue
      aggregated[country].cost += metric.cost
      aggregated[country].impressions += metric.impressions
      aggregated[country].clicks += metric.clicks
      aggregated[country].ad_impressions += metric.ad_impressions
      aggregated[country].ad_clicks += metric.ad_clicks
      // Recalcular médias
      aggregated[country].ad_coverage = aggregated[country].ad_impressions / aggregated[country].impressions
      aggregated[country].viewability = (aggregated[country].viewability + metric.viewability) / 2
    }
  })
  
  return aggregated
}

export function aggregateMetricsBySite(metrics: Metric[]): Record<string, Metric> {
  const aggregated: Record<string, Metric> = {}
  
  metrics.forEach(metric => {
    const domainId = metric.domainId
    
    if (!aggregated[domainId]) {
      aggregated[domainId] = {
        ...metric,
        id: `agg-${domainId}`,
        date: '',
        country: undefined
      }
    } else {
      aggregated[domainId].revenue += metric.revenue
      aggregated[domainId].cost += metric.cost
      aggregated[domainId].impressions += metric.impressions
      aggregated[domainId].clicks += metric.clicks
      aggregated[domainId].ad_impressions += metric.ad_impressions
      aggregated[domainId].ad_clicks += metric.ad_clicks
      // Recalcular médias
      aggregated[domainId].ad_coverage = aggregated[domainId].ad_impressions / aggregated[domainId].impressions
      aggregated[domainId].viewability = (aggregated[domainId].viewability + metric.viewability) / 2
    }
  })
  
  return aggregated
}
