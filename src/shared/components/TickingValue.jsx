import { useEffect, useRef, useState } from 'react'

/**
 * Smoothly counts from the previous numeric value to the next one and briefly
 * flashes green/red by direction whenever it changes — makes a value that only
 * actually updates once a minute (the delayed price feed) read as continuously
 * live, the way brokerage tickers do, without polling the price source any harder.
 */
export default function TickingValue({ value, format, className = '' }) {
  const [displayValue, setDisplayValue] = useState(value)
  const [flash, setFlash] = useState(null)
  const prevValueRef = useRef(value)
  const rafRef = useRef(null)

  useEffect(() => {
    const prev = prevValueRef.current

    if (typeof value !== 'number' || typeof prev !== 'number' || prev === value) {
      setDisplayValue(value)
      prevValueRef.current = value
      return
    }

    setFlash(value > prev ? 'up' : 'down')
    const flashTimeout = setTimeout(() => setFlash(null), 900)

    const duration = 600
    const startValue = prev
    const startTime = performance.now()

    function step(now) {
      const progress = Math.min((now - startTime) / duration, 1)
      const eased = 1 - Math.pow(1 - progress, 3)
      setDisplayValue(startValue + (value - startValue) * eased)
      if (progress < 1) {
        rafRef.current = requestAnimationFrame(step)
      } else {
        prevValueRef.current = value
      }
    }

    if (rafRef.current) cancelAnimationFrame(rafRef.current)
    rafRef.current = requestAnimationFrame(step)

    return () => {
      clearTimeout(flashTimeout)
      if (rafRef.current) cancelAnimationFrame(rafRef.current)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value])

  const flashClass =
    flash === 'up' ? 'bg-brand-green-light' : flash === 'down' ? 'bg-red-50' : 'bg-transparent'

  return (
    <span className={`inline-block rounded px-1 transition-colors duration-700 ${flashClass} ${className}`}>
      {format ? format(displayValue) : displayValue}
    </span>
  )
}
