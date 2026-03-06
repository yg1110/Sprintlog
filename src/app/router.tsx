import { createBrowserRouter, Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { AuthPage } from '../pages/AuthPage'
import { DashboardPage } from '../pages/DashboardPage'
import { OkrsPage } from '../pages/OkrsPage'
import { WorkLogsPage } from '../pages/WorkLogsPage'
import { AppLayout } from './AppLayout'

function ProtectedRoute() {
  const { user, loading } = useAuth()
  if (loading) return <div className="flex items-center justify-center min-h-screen"><p className="text-sm text-muted-foreground">로딩 중...</p></div>
  if (!user) return <Navigate to="/auth" replace />
  return (
    <AppLayout>
      <Outlet />
    </AppLayout>
  )
}

function GuestRoute() {
  const { user, loading } = useAuth()
  if (loading) return null
  if (user) return <Navigate to="/dashboard" replace />
  return <Outlet />
}

export const router = createBrowserRouter([
  {
    element: <GuestRoute />,
    children: [{ path: '/auth', element: <AuthPage /> }],
  },
  {
    element: <ProtectedRoute />,
    children: [
      { path: '/dashboard', element: <DashboardPage /> },
      { path: '/okrs', element: <OkrsPage /> },
      { path: '/work-logs', element: <WorkLogsPage /> },
    ],
  },
  { path: '/', element: <Navigate to="/dashboard" replace /> },
  { path: '*', element: <Navigate to="/dashboard" replace /> },
])
