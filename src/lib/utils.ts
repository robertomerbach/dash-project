import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { randomBytes } from "crypto"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatCurrency(value: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value);
}

export function formatNumber(value: number): string {
  return new Intl.NumberFormat('pt-BR').format(value);
}

export function calculatePercentageChange(previous: number, current: number): number {
  if (previous === 0) return current === 0 ? 0 : 100;
  return Number(((current - previous) / previous * 100).toFixed(1));
}

export function generatePassword(length: number = 12): string {
  const lowercase = "abcdefghijklmnopqrstuvwxyz"
  const uppercase = "ABCDEFGHIJKLMNOPQRSTUVWXYZ"
  const numbers = "0123456789"
  const special = "!@#$%^&*"
  
  let password = ""
  password += lowercase[Math.floor(Math.random() * lowercase.length)]
  password += uppercase[Math.floor(Math.random() * uppercase.length)]
  password += numbers[Math.floor(Math.random() * numbers.length)]
  password += special[Math.floor(Math.random() * special.length)]
  
  const charset = lowercase + uppercase + numbers + special
  for (let i = password.length; i < length; i++) {
    password += charset[Math.floor(Math.random() * charset.length)]
  }

  return password.split('').sort(() => Math.random() - 0.5).join('')
}

// export function groupDataByDate(data: Metrics[], dateRange: DateRange): Metrics[] {
//   if (!dateRange.from || !dateRange.to) {
//     return []
//   }

//   // Criar um objeto com todas as datas do intervalo
//   const allDates: Record<string, Metrics> = {}
  
//   // Preencher todas as datas do intervalo
//   let currentDate = dateRange.from
//   while (currentDate <= dateRange.to) {
//     const dateStr = format(currentDate, 'dd-MM-yyyy')
//     allDates[dateStr] = {
//       id: dateStr,
//       date: dateStr,
//       impressions: 0,
//       clicks: 0,
//       ctr: 0,
//       cpc: 0,
//       cost: 0,
//       revenue: 0,
//       profit: 0,
//       ad_impressions: 0,
//       ad_clicks: 0,
//       ad_ctr: 0,
//       ecpm: 0
//     }
//     currentDate = addDays(currentDate, 1)
//   }

//   // Somar os dados existentes
//   const grouped = data.reduce((acc, current) => {
//     const date = format(new Date(current.date), 'dd-MM-yyyy')
    
//     if (!acc[date]) {
//       acc[date] = {
//         id: date,
//         date: date,
//         impressions: 0,
//         clicks: 0,
//         ctr: 0,
//         cpc: 0,
//         cost: 0,
//         revenue: 0,
//         profit: 0,
//         ad_impressions: 0,
//         ad_clicks: 0,
//         ad_ctr: 0,
//         ecpm: 0
//       }
//     }
    
//     acc[date].impressions += current.impressions || 0
//     acc[date].clicks += current.clicks || 0
//     acc[date].cost += current.cost || 0
//     acc[date].revenue += current.revenue || 0
//     acc[date].profit += current.profit || 0
//     acc[date].ad_impressions += current.ad_impressions || 0
//     acc[date].ad_clicks += current.ad_clicks || 0
    
//     acc[date].ctr = (acc[date].clicks / acc[date].impressions) * 100 || 0
//     acc[date].cpc = acc[date].cost / acc[date].clicks || 0
//     acc[date].ad_ctr = (acc[date].ad_clicks / acc[date].ad_impressions) * 100 || 0
//     acc[date].ecpm = (acc[date].revenue / acc[date].impressions) * 1000 || 0

//     return acc
//   }, allDates)

//   return Object.values(grouped).sort((a, b) => 
//     new Date(b.date.split('-').reverse().join('-')).getTime() - 
//     new Date(a.date.split('-').reverse().join('-')).getTime()
//   )
// }

export function generateToken(length: number = 32): string {
  return randomBytes(length).toString('hex')
}