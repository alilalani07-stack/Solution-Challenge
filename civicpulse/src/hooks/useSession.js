import { useSessionContext } from '../store/sessionStore'

export function useSession() {
  return useSessionContext()
}
