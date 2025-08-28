'use client'

import { createContext, useState, ReactNode, useContext } from 'react'
import NotificationsList from '../components/NotificationsList'

export type Notification = {
  id: string
  message: string
  type?: 'success' | 'error' | 'info'
  position?:
    | 'top-left'
    | 'top-right'
    | 'bottom-left'
    | 'bottom-right'
    | 'center-top'
    | 'center-bottom'
  isExiting?: boolean
}

type NotificationsContextType = {
  notifications: Notification[]
  addNotification: (message: string, type?: Notification['type']) => void
  removeNotification: (id: string) => void
}

export const NotificationsContext = createContext<NotificationsContextType | undefined>(undefined)

export default function NotificationsProvider({ children }: { children: ReactNode }) {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const defaultPosition = 'top-left'
  const defaultType = 'info'

  const addNotification = (
    message: string,
    type: Notification['type'] = defaultType,
    position: Notification['position'] = defaultPosition,
  ) => {
    const id = crypto.randomUUID()
    const notification = { id, message, type, position }

    setNotifications((prev) => {
      const updated = [notification, ...prev]

      if (updated.length > 5) {
        updated.forEach((n, index) => {
          if (index >= 5) {
            removeNotification(n.id)
          }
        })
      }

      return updated
    })

    setTimeout(() => removeNotification(id), 3000)
  }

  const removeNotification = (id: string) => {
    setNotifications((prev) =>
      prev.map((notification) =>
        notification.id === id ? { ...notification, isExiting: true } : notification,
      ),
    )

    setTimeout(() => {
      setNotifications((prev) => prev.filter((n) => n.id !== id))
    }, 300)
  }

  return (
    <NotificationsContext.Provider value={{ notifications, addNotification, removeNotification }}>
      <NotificationsList />
      {children}
    </NotificationsContext.Provider>
  )
}

export function useNotifications() {
  const context = useContext(NotificationsContext)
  if (!context) {
    throw new Error('useNotifications must be used within a NotificationsProvider')
  }
  return context
}
