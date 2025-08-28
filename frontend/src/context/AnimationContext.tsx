'use client'

import React, { createContext, useContext, useEffect, useState } from 'react'

interface AnimationContextType {
  // Configurações de easing
  easings: {
    standard: string
    easeOut: string
    easeIn: string
    emphasis: string
  }

  // Durações em ms
  durations: {
    instant: number
    quick: number
    standard: number
    moderate: number
    expressive: number
  }

  // Configurações de coreografia
  choreography: {
    staggerDelay: number // ms entre elementos relacionados
    parentChildDelay: number // ms entre pai e filho
  }

  // Utilitários
  shouldReduceMotion: boolean // based on user preference
  applyHoverEffect: (ref: React.RefObject<HTMLElement>) => void
  applyActiveEffect: (ref: React.RefObject<HTMLElement>) => void
}

const AnimationContext = createContext<AnimationContextType>({
  easings: {
    standard: 'cubic-bezier(0.25, 0.1, 0.25, 1.0)',
    easeOut: 'cubic-bezier(0.0, 0.0, 0.2, 1.0)',
    easeIn: 'cubic-bezier(0.8, 0.0, 1.0, 1.0)',
    emphasis: 'cubic-bezier(0.12, 0.8, 0.32, 1.0)',
  },
  durations: {
    instant: 100,
    quick: 200,
    standard: 350,
    moderate: 450,
    expressive: 600,
  },
  choreography: {
    staggerDelay: 25,
    parentChildDelay: 30,
  },
  shouldReduceMotion: false,
  applyHoverEffect: () => {},
  applyActiveEffect: () => {},
})

export const AnimationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [shouldReduceMotion, setShouldReduceMotion] = useState(false)

  // Detectar preferência de redução de movimento
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
      setShouldReduceMotion(mediaQuery.matches)

      // Adicionar listener para mudanças na preferência
      const handleChange = (e: MediaQueryListEvent) => {
        setShouldReduceMotion(e.matches)
      }

      mediaQuery.addEventListener('change', handleChange)
      return () => {
        mediaQuery.removeEventListener('change', handleChange)
      }
    }
  }, [])

  // Aplicar efeito de hover conforme especificações Apple
  const applyHoverEffect = (ref: React.RefObject<HTMLElement>) => {
    if (!ref.current) return

    const element = ref.current

    const handleMouseEnter = () => {
      if (shouldReduceMotion) return

      element.style.transform = 'scale(1.02)'
      element.style.filter = 'brightness(1.05)'
      element.style.boxShadow = '0px 3px 7px rgba(0,0,0,0.15)'
    }

    const handleMouseLeave = () => {
      element.style.transform = ''
      element.style.filter = ''
      element.style.boxShadow = ''
    }

    element.addEventListener('mouseenter', handleMouseEnter)
    element.addEventListener('mouseleave', handleMouseLeave)

    return () => {
      element.removeEventListener('mouseenter', handleMouseEnter)
      element.removeEventListener('mouseleave', handleMouseLeave)
    }
  }

  // Aplicar efeito de ativo conforme especificações Apple
  const applyActiveEffect = (ref: React.RefObject<HTMLElement>) => {
    if (!ref.current) return

    const element = ref.current

    const handleMouseDown = () => {
      if (shouldReduceMotion) return

      element.style.transform = 'scale(0.95)'
    }

    const handleMouseUp = () => {
      element.style.transform = ''
    }

    element.addEventListener('mousedown', handleMouseDown)
    element.addEventListener('mouseup', handleMouseUp)
    element.addEventListener('mouseleave', handleMouseUp)

    return () => {
      element.removeEventListener('mousedown', handleMouseDown)
      element.removeEventListener('mouseup', handleMouseUp)
      element.removeEventListener('mouseleave', handleMouseUp)
    }
  }

  const contextValue: AnimationContextType = {
    easings: {
      standard: 'cubic-bezier(0.25, 0.1, 0.25, 1.0)',
      easeOut: 'cubic-bezier(0.0, 0.0, 0.2, 1.0)',
      easeIn: 'cubic-bezier(0.8, 0.0, 1.0, 1.0)',
      emphasis: 'cubic-bezier(0.12, 0.8, 0.32, 1.0)',
    },
    durations: {
      instant: shouldReduceMotion ? 50 : 100,
      quick: shouldReduceMotion ? 100 : 200,
      standard: shouldReduceMotion ? 175 : 350,
      moderate: shouldReduceMotion ? 225 : 450,
      expressive: shouldReduceMotion ? 300 : 600,
    },
    choreography: {
      staggerDelay: shouldReduceMotion ? 10 : 25,
      parentChildDelay: shouldReduceMotion ? 15 : 30,
    },
    shouldReduceMotion,
    applyHoverEffect,
    applyActiveEffect,
  }

  return <AnimationContext.Provider value={contextValue}>{children}</AnimationContext.Provider>
}

export const useAnimation = () => {
  return useContext(AnimationContext)
}
