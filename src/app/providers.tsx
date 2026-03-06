import { Toaster } from 'sonner'
import { AuthContext, useAuthState } from '../hooks/useAuth'
import { router } from './router'
import { RouterProvider } from 'react-router-dom'

function AppWithAuth() {
  const authState = useAuthState()
  return (
    <AuthContext.Provider value={authState}>
      <RouterProvider router={router} />
      <Toaster position="top-right" richColors />
    </AuthContext.Provider>
  )
}

export function Providers() {
  return <AppWithAuth />
}
