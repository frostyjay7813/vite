import { createBrowserRouter, RouterProvider } from 'react-router'
import { DashboardPage } from '../features/dashboard/DashboardPage'
import { HealthPage } from '../features/health/HealthPage'

const router = createBrowserRouter([
  {
    path: '/',
    element: <DashboardPage />,
  },
  {
    path: '/health',
    element: <HealthPage />,
  },
])

export function AppRouter() {
  return <RouterProvider router={router} />
}
