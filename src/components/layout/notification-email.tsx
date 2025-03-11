import { useEffect } from 'react'
import { useNotification } from '@/components/provider/notification-provider'

export function NotificationEmail() {
  const { addNotification } = useNotification()

  useEffect(() => {
    const userEmail = localStorage.getItem("userEmail")
    const needsVerification = localStorage.getItem("needsEmailVerification")
    
    if (userEmail && needsVerification === "true") {
      addNotification({
        id: 'email-verification',
        message: (
          <>
            Please verify your email <strong>{userEmail}</strong> to activate your account.
          </>
        ),
        action: {
          label: 'Resend',
          onClick: () => {
            // Lógica para reenviar e-mail
            console.log('Resend email')
          }
        },
        variant: 'info',
        dismissible: true
      })
    }
  }, [addNotification])

  return null
}