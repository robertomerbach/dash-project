"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { RefreshCw } from "lucide-react"
import { mutate } from "swr"

export function ButtonRefresh() {
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date())
  const [updateText, setUpdateText] = useState("Updated now")

  useEffect(() => {
    const interval = setInterval(() => {
      const diffMinutes = Math.floor((new Date().getTime() - lastUpdate.getTime()) / 1000 / 60)
      
      if (diffMinutes < 1) {
        setUpdateText("Updated now")
      } else if (diffMinutes < 60) {
        setUpdateText(`Updated ${diffMinutes}m ago`)
      } else {
        const hours = Math.floor(diffMinutes / 60)
        const minutes = diffMinutes % 60
        
        if (minutes === 0) {
          setUpdateText(`Updated ${hours}h ago`)
        } else {
          setUpdateText(`Updated ${hours}h ${minutes}m ago`)
        }
      }
    }, 30000) // Atualiza a cada 30 segundos

    return () => clearInterval(interval)
  }, [lastUpdate])

  const handleRefresh = async () => {
    setIsRefreshing(true)
    
    try {
      // Revalidar todas as chaves SWR relevantes
      await Promise.all([
        // Revalidar dados dos sites
        mutate(`/api/sites`),
        // Aqui você pode adicionar outras chaves SWR que precisam ser revalidadas
      ])
      setLastUpdate(new Date())
      setUpdateText("Updated now")
    } catch (error) {
      console.error("Error refreshing data:", error)
    } finally {
      setIsRefreshing(false)
    }
  }

  return (
    <div className="flex items-center gap-2">
      <p className="text-sm text-muted-foreground">{updateText}</p>
      <Button
        variant="outline"
        size="icon"
        onClick={handleRefresh}
        title="Update data"
        className={isRefreshing ? "cursor-not-allowed" : "cursor-pointer"}
        disabled={isRefreshing}
      >
        <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
      </Button>
    </div>
  )
}
