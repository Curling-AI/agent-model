import React, { ButtonHTMLAttributes, ReactNode, useEffect, useCallback } from 'react'
import styles from './WPOficialButton.module.css'
import { FacebookAccessToken } from '@/types/facebook'
import { useAnimation } from '@/context/AnimationContext'
import { useIntegrationsStore } from '@/store/integrations'

// Declaração de tipo global para a variável FB do SDK do Facebook
declare global {
  interface Window {
    FB: {
      init: (params: {
        appId: string
        autoLogAppEvents: boolean
        xfbml: boolean
        version: string
      }) => void
      login: (
        callback: (response: FacebookLoginResponse) => void,
        options: {
          config_id: string
          response_type: string
          override_default_response_type: boolean
          extras: {
            setup: object
            featureType: string
            sessionInfoVersion: string
          }
        },
      ) => void
    }
    fbAsyncInit: () => void
  }
}

interface WhatsAppSignupButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  appId: string
  graphApiVersion: string
  configurationId: string
  featureType: string
  children: ReactNode
  variant?: 'primary' | 'secondary' | 'tertiary' | 'danger' | 'success' | 'warning'
  size?: 'small' | 'medium' | 'large'
  stretch?: boolean
  icon?: ReactNode
  iconPosition?: 'left' | 'right'
  disabled?: boolean
  onLoginSuccess?: (data: FacebookAccessToken) => void
}

interface FacebookLoginResponse {
  authResponse?: {
    code: string
  }
  error?: {
    message: string
  }
  status?: string
}

let facebookAccessToken: FacebookAccessToken = {
  access_token: '',
  token_type: '',
  expires_in: 0,
  phone_number_id: '',
  business_id: '',
  waba_id: '',
}

const WhatsAppSignupButton: React.FC<WhatsAppSignupButtonProps> = ({
  appId,
  graphApiVersion,
  configurationId,
  featureType,
  children,
  variant = 'primary',
  size = 'medium',
  stretch = false,
  icon,
  iconPosition = 'left',
  disabled = false,
  className = '',
  onLoginSuccess = () => {},
  ...props
}) => {
  const { shouldReduceMotion } = useAnimation()

  // Mapeamento de variantes para classes CSS
  const variantClassMap = {
    primary: styles.primary,
    secondary: styles.secondary,
    tertiary: styles.tertiary,
    danger: styles.danger,
    success: styles.success,
    warning: styles.warning,
  }

  // Mapeamento de tamanhos para classes CSS
  const sizeClassMap = {
    small: styles.small,
    medium: styles.medium,
    large: styles.large,
  }

  // Criação da classe combinada
  const combinedClassName = `
    ${styles.button}
    ${variantClassMap[variant]}
    ${sizeClassMap[size]}
    ${stretch ? styles.stretch : ''}
    ${disabled ? styles.disabled : ''}
    ${shouldReduceMotion ? styles.reducedMotion : ''}
    ${className}
  `.trim()

  const { getFacebookAccessToken } = useIntegrationsStore()

  const fbLoginCallback = useCallback(
    (response: FacebookLoginResponse) => {
      if (response.authResponse) {
        const code = response.authResponse.code
        getFacebookAccessToken(code)
          .then(({ success, error, data }) => {
            if (success) {
              const { access_token, token_type, expires_in } = data as FacebookAccessToken
              facebookAccessToken = {
                ...facebookAccessToken,
                access_token,
                token_type,
                expires_in,
              }
              onLoginSuccess(facebookAccessToken)
            }
            if (error) {
              console.error('Erro obtendo o token de acesso do Facebook:', error)
            }
          })
          .catch((err) => {
            console.error('Erro no retorno do Facebook:', err)
          })
      } else {
        console.error('Erro durante o login do Facebook', response)
      }
    },
    [getFacebookAccessToken, onLoginSuccess],
  )

  const launchWhatsAppSignup = useCallback(() => {
    if (window.FB) {
      window.FB.login(fbLoginCallback, {
        config_id: configurationId,
        response_type: 'code',
        override_default_response_type: true,
        extras: {
          setup: {},
          featureType: featureType,
          sessionInfoVersion: '3',
        },
      })
    } else {
      console.error('Facebook SDK not loaded.')
    }
  }, [fbLoginCallback, configurationId, featureType])

  useEffect(() => {
    // Função para carregar o SDK do Facebook
    const loadFacebookSDK = () => {
      if (document.getElementById('facebook-jssdk')) {
        return // SDK já carregado
      }

      const script = document.createElement('script')
      script.id = 'facebook-jssdk'
      script.src = 'https://connect.facebook.net/en_US/sdk.js'
      script.async = true
      script.defer = true
      script.crossOrigin = 'anonymous'
      document.body.appendChild(script)

      script.onload = () => {
        if (window.FB) {
          window.fbAsyncInit = function () {
            window.FB.init({
              appId: appId,
              autoLogAppEvents: true,
              xfbml: true,
              version: graphApiVersion,
            })
            console.log('Facebook SDK initialized.')
          }
        }
      }
    }

    loadFacebookSDK()

    const handleMessageEvent = (event: MessageEvent) => {
      if (!event.origin.endsWith('facebook.com')) return
      try {
        const data = JSON.parse(event.data)
        if (data.type === 'WA_EMBEDDED_SIGNUP') {
          if (data.event === 'FINISH') {
            const { phone_number_id, waba_id, business_id } = data.data
            facebookAccessToken.phone_number_id = phone_number_id
            facebookAccessToken.waba_id = waba_id
            facebookAccessToken.business_id = business_id
          } else if (data.event === 'ERROR') {
            const { error_message } = data.data
            console.error('error ', error_message)
          }
        }
      } catch {}
    }

    window.addEventListener('message', handleMessageEvent)

    return () => {
      window.removeEventListener('message', handleMessageEvent)
    }
  }, [appId, graphApiVersion])

  return (
    <button
      className={combinedClassName}
      disabled={disabled}
      data-apple-button
      {...props}
      onClick={launchWhatsAppSignup}
    >
      {icon && iconPosition === 'left' && <span className={styles.iconLeft}>{icon}</span>}
      <span className={styles.label}>{children}</span>
      {icon && iconPosition === 'right' && <span className={styles.iconRight}>{icon}</span>}
    </button>
  )
}

export default WhatsAppSignupButton
