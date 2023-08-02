import { useContext, useEffect, useState } from 'react'
import { CtxState } from 'context'

type useHideSidebar = {
  sidebarState: boolean | undefined
  setSidebarState: React.Dispatch<React.SetStateAction<boolean | undefined>>
}

/**
 * Hook that provides state for hiding/showing the sidebar, and sets the hideSidebar state to `true` on initial mount.
 * @date 27.4.2023 - 00:05:38
 *
 * @export
 * @returns {useHideSidebar}
 */
export default function useHideSidebar(): useHideSidebar {
  const [sidebarState, setSidebarState] = useState<boolean>()
  const { state, dispatch } = useContext(CtxState)

  useEffect(() => {
    setSidebarState(state.hideSidebar)
    dispatch({ type: 'set-hide-sidebar', payload: true })

    // Reset hideSidebar state to its original value when the component is unmounted
    return () => {
      dispatch({ type: 'set-hide-sidebar', payload: Boolean(sidebarState) })
    }
  }, [])

  return { sidebarState, setSidebarState }
}
