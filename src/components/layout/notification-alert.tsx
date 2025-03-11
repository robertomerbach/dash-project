import React, { useEffect, useState } from "react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"

/**
 * Types of notification variants
 */
export type NotificationVariant = 'info' | 'warning' | 'error' | 'success';

/**
 * Properties for the NotificationAlert component
 */
interface NotificationAlertProps {
  /**
   * Unique identifier for the notification
   * Used to manage localStorage state
   */
  id: string;

  /**
   * Main message content for the notification
   */
  message: React.ReactNode;

  /**
   * Optional secondary action
   */
  action?: {
    label: string;
    onClick: () => void;
  };

  /**
   * Variant of the notification
   * @default 'info'
   */
  variant?: NotificationVariant;

  /**
   * Additional CSS classes to customize the alert's appearance
   */
  className?: string;

  /**
   * Custom storage key (optional)
   * @default 'notification'
   */
  storageKey?: string;

  /**
   * Whether the notification can be dismissed
   * @default true
   */
  dismissible?: boolean;

  /**
   * Callback when notification is dismissed
   */
  onDismiss?: () => void;
}

/**
 * NotificationAlert Component
 * 
 * A flexible, reusable notification component that can be shown/hidden 
 * and persists its state using localStorage
 * 
 * @component
 */
export function NotificationAlert({
  id,
  message,
  action,
  variant = 'info',
  className = '',
  storageKey = 'notification',
  dismissible = true,
  onDismiss
}: NotificationAlertProps) {
  const [show, setShow] = useState(false)

  // Variant-based styling
  const variantClasses = {
    info: 'bg-blue-50 border-blue-200 text-blue-800',
    warning: 'bg-yellow-50 border-yellow-200 text-yellow-800',
    error: 'bg-red-50 border-red-200 text-red-800',
    success: 'bg-green-50 border-green-200 text-green-800'
  }

  useEffect(() => {
    // Check if notification should be shown based on localStorage
    const notificationState = localStorage.getItem(`${storageKey}-${id}`)
    
    if (notificationState !== 'dismissed') {
      setShow(true)
    }
  }, [id, storageKey])

  /**
   * Handles dismissing the notification
   */
  const handleDismiss = () => {
    setShow(false)
    localStorage.setItem(`${storageKey}-${id}`, 'dismissed')
    onDismiss?.()
  }

  /**
   * Handles the optional secondary action
   */
  const handleAction = () => {
    action?.onClick()
    handleDismiss()
  }

  // Do not render anything if the alert should not be shown
  if (!show) return null

  return (
    <Alert 
      className={`
        sticky top-0 border-0 border-b right-0 w-full rounded-none 
        ${variantClasses[variant]} 
        ${className}
      `}
    >
      <div className="flex items-start justify-between">
        <AlertDescription className="text-sm flex-grow">
          {message}
          {action && (
            <Button 
              variant="link" 
              className="p-0 h-auto font-normal underline ml-2"
              onClick={handleAction}
            >
              {action.label}
            </Button>
          )}
        </AlertDescription>
        {dismissible && (
          <Button
            variant="ghost"
            className="h-auto p-0 hover:bg-transparent"
            onClick={handleDismiss}
          >
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              width="16" 
              height="16" 
              viewBox="0 0 24 24" 
              fill="none" 
              stroke="currentColor" 
              strokeWidth="2" 
              strokeLinecap="round" 
              strokeLinejoin="round"
            >
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </Button>
        )}
      </div>
    </Alert>
  )
}