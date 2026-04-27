import { createBrowserRouter, RouterProvider, Outlet, Navigate, useLocation } from 'react-router'
import { AnimatePresence } from 'framer-motion'
import { useSession } from '../hooks/useSession'

// Pages
import LandingPage from '../pages/public/LandingPage'
import RoleSelectionPage from '../pages/public/RoleSelectionPage'

import CitizenHomePage from '../pages/citizen/CitizenHomePage'
import CitizenSubmitPage from '../pages/citizen/CitizenSubmitPage'
import CitizenTrackPage from '../pages/citizen/CitizenTrackPage'

import VolunteerLoginPage from '../pages/volunteer/VolunteerLoginPage'
import VolunteerDashboardPage from '../pages/volunteer/VolunteerDashboardPage'
import VolunteerTaskPage from '../pages/volunteer/VolunteerTaskPage'

import CoordinatorLoginPage from '../pages/coordinator/CoordinatorLoginPage'
import CoordinatorDashboardPage from '../pages/coordinator/CoordinatorDashboardPage'
import CoordinatorReviewPage from '../pages/coordinator/CoordinatorReviewPage'
import CoordinatorNeedPage from '../pages/coordinator/CoordinatorNeedPage'

// Auth Guard
function RequireAuth({ children, allowedRole }) {
  const { isAuthenticated, role } = useSession()
  const location = useLocation()

  if (!isAuthenticated) {
    const loginPath = allowedRole === 'volunteer' ? '/volunteer/login' : '/coordinator/login'
    return <Navigate to={loginPath} state={{ from: location }} replace />
  }

  if (allowedRole && role !== allowedRole) {
    return <Navigate to="/" replace />
  }

  return children
}

// Wrapper for AnimatePresence
function AnimatedOutlet() {
  const location = useLocation()
  return (
    <AnimatePresence mode="wait">
      <div key={location.pathname} className="min-h-screen">
        <Outlet />
      </div>
    </AnimatePresence>
  )
}

const router = createBrowserRouter([
  {
    element: <AnimatedOutlet />,
    children: [
      { path: '/', element: <LandingPage /> },
      { path: '/start', element: <RoleSelectionPage /> },
      
      // Citizen (Public)
      { path: '/citizen', element: <CitizenHomePage /> },
      { path: '/citizen/submit', element: <CitizenSubmitPage /> },
      { path: '/citizen/track', element: <CitizenTrackPage /> },
      
      // Volunteer
      { path: '/volunteer/login', element: <VolunteerLoginPage /> },
      { 
        path: '/volunteer/dashboard', 
        element: <RequireAuth allowedRole="volunteer"><VolunteerDashboardPage /></RequireAuth> 
      },
      { 
        path: '/volunteer/tasks/:id', 
        element: <RequireAuth allowedRole="volunteer"><VolunteerTaskPage /></RequireAuth> 
      },
      
      // Coordinator
      { path: '/coordinator/login', element: <CoordinatorLoginPage /> },
      { 
        path: '/coordinator/dashboard', 
        element: <RequireAuth allowedRole="coordinator"><CoordinatorDashboardPage /></RequireAuth> 
      },
      { 
        path: '/coordinator/review', 
        element: <RequireAuth allowedRole="coordinator"><CoordinatorReviewPage /></RequireAuth> 
      },
      { 
        path: '/coordinator/needs/:id', 
        element: <RequireAuth allowedRole="coordinator"><CoordinatorNeedPage /></RequireAuth> 
      },
    ]
  }
])

export default function AppRouter() {
  return <RouterProvider router={router} />
}
