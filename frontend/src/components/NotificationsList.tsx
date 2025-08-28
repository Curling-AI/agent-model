import { Notification, useNotifications } from '../context/NotificationsProvider'
import styles from './NotificationsList.module.css'

type IconProps = {
  type: 'success' | 'error' | 'info'
}

const getNotificationPositionStyle = (position: Notification['position']) => {
  switch (position) {
    case 'top-left':
      return styles.topLeft
    case 'top-right':
      return styles.topRight
    case 'bottom-left':
      return styles.bottomLeft
    case 'bottom-right':
      return styles.bottomRight
    case 'center-top':
      return styles.centerTop
    case 'center-bottom':
      return styles.centerBottom
    default:
      return styles.topLeft
  }
}

const NotificationIcon = ({ type }: IconProps) => {
  switch (type) {
    case 'success':
      return (
        <svg
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M22 11.08V12C21.9988 14.1564 21.3005 16.2547 20.0093 17.9818C18.7182 19.709 16.9033 20.9725 14.8354 21.5839C12.7674 22.1953 10.5573 22.1219 8.53447 21.3746C6.51168 20.6273 4.78465 19.2461 3.61096 17.4371C2.43727 15.628 1.87979 13.4881 2.02168 11.3363C2.16356 9.18455 2.99721 7.13631 4.39828 5.49706C5.79935 3.85781 7.69279 2.71537 9.79619 2.24013C11.8996 1.7649 14.1003 1.98232 16.07 2.85999"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M22 4L12 14.01L9 11.01"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      )
    case 'error':
      return (
        <svg
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M15 9L9 15"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M9 9L15 15"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      )
    case 'info':
    default:
      return (
        <svg
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M12 16V12"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M12 8H12.01"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      )
  }
}

export default function NotificationsList() {
  const { notifications, removeNotification } = useNotifications()

  return (
    <div
      className={`${styles.NotificationsListContainer} ${getNotificationPositionStyle(notifications?.[0]?.position)}`}
    >
      {notifications.map(({ id, message, type = 'info', isExiting }) => (
        <div
          key={id}
          className={`${styles.notification}  ${styles[type]} ${isExiting ? styles.exiting : ''}`}
        >
          <div className={styles.notificationContent}>
            <div className={styles.notificationIcon}>
              <NotificationIcon type={type} />
            </div>
            <p className={styles.notificationMessage}>{message}</p>
          </div>
          <button
            className={styles.closeButton}
            onClick={() => removeNotification(id)}
            aria-label="Fechar notificação"
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M18 6L6 18"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M6 6L18 18"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
        </div>
      ))}
    </div>
  )
}
