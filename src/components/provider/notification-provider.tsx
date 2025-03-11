import React, { 
    createContext, 
    useState, 
    useContext, 
    ReactNode 
  } from 'react'
  import { NotificationAlert, NotificationVariant } from '@/components/layout/notification-alert'
  
  /**
   * Interface para configuração de notificação
   */
  interface NotificationConfig {
    id: string;
    message: ReactNode;
    variant?: NotificationVariant;
    action?: {
      label: string;
      onClick: () => void;
    };
    dismissible?: boolean;
  }
  
  /**
   * Interface para o contexto de notificações
   */
  interface NotificationContextType {
    /**
     * Adiciona uma nova notificação
     */
    addNotification: (config: NotificationConfig) => void;
    
    /**
     * Remove uma notificação específica
     */
    removeNotification: (id: string) => void;
    
    /**
     * Lista de notificações ativas
     */
    notifications: NotificationConfig[];
  }
  
  // Criação do contexto
  const NotificationContext = createContext<NotificationContextType>({
    addNotification: () => {},
    removeNotification: () => {},
    notifications: []
  })
  
  /**
   * Provider de notificações para envolver a aplicação
   */
  export function NotificationProvider({ children }: { children: ReactNode }) {
    const [notifications, setNotifications] = useState<NotificationConfig[]>([])
  
    /**
     * Adiciona uma nova notificação
     */
    const addNotification = (config: NotificationConfig) => {
      setNotifications(prev => {
        // Evita duplicatas
        if (prev.some(n => n.id === config.id)) return prev
        return [...prev, config]
      })
    }
  
    /**
     * Remove uma notificação específica
     */
    const removeNotification = (id: string) => {
      setNotifications(prev => prev.filter(n => n.id !== id))
    }
  
    return (
      <NotificationContext.Provider 
        value={{ 
          addNotification, 
          removeNotification, 
          notifications 
        }}
      >
        {children}
        {notifications.map(notification => (
          <NotificationAlert
            key={notification.id}
            {...notification}
            onDismiss={() => removeNotification(notification.id)}
          />
        ))}
      </NotificationContext.Provider>
    )
  }
  
  /**
   * Hook para usar o contexto de notificações
   */
  export function useNotification() {
    const context = useContext(NotificationContext)
    
    if (!context) {
      throw new Error('useNotification must be used within a NotificationProvider')
    }
    
    return context
  }