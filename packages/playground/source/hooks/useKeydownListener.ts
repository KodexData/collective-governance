import { useContext, useEffect } from 'react'
import { CtxState } from '../context'

/**
 * A hook that listens for keydown events and dispatches actions based on the key pressed.
 * @date 27.4.2023 - 00:16:59
 *
 * @export
 * @returns {(e: KeyboardEvent) => void} The event handler function for keydown events.
 */
export default function useKeydownListener(): (e: KeyboardEvent) => void {
  const { dispatch } = useContext(CtxState)

  function handler(e: KeyboardEvent) {
    if (e.ctrlKey && e.key === 'f') {
      dispatch({
        type: 'search/set-open',
        payload: true
      })
    }

    if (e.ctrlKey && e.key === 'l') {
      dispatch({ type: 'log-state' })
    }

    if (e.ctrlKey && e.key === 'w') {
      console.log(`toggle sidebar`)
      dispatch({ type: 'toggle-sidebar' })
    }
  }

  useEffect(() => {
    document.addEventListener('keydown', handler)
    return () => {
      document.removeEventListener('keydown', handler)
    }
  }, [])

  return handler
}
