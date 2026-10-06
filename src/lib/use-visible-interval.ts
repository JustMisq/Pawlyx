'use client'

import { useEffect, useRef } from 'react'

/**
 * Exécute un callback à intervalle régulier, uniquement quand l'onglet est visible,
 * et rattrape immédiatement au retour sur l'onglet. Évite de sonder l'API en arrière-plan.
 */
export function useVisibleInterval(callback: () => void, intervalMs: number, enabled = true) {
  const callbackRef = useRef(callback)
  callbackRef.current = callback

  useEffect(() => {
    if (!enabled) return

    let timer: ReturnType<typeof setInterval> | null = null

    const start = () => {
      if (timer === null) {
        timer = setInterval(() => callbackRef.current(), intervalMs)
      }
    }

    const stop = () => {
      if (timer !== null) {
        clearInterval(timer)
        timer = null
      }
    }

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        callbackRef.current()
        start()
      } else {
        stop()
      }
    }

    if (document.visibilityState === 'visible') start()
    document.addEventListener('visibilitychange', handleVisibilityChange)

    return () => {
      stop()
      document.removeEventListener('visibilitychange', handleVisibilityChange)
    }
  }, [intervalMs, enabled])
}
