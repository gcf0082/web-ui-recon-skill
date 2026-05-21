import { Navigate, useLocation } from 'react-router-dom'

interface AuthGuardProps {
  children: React.ReactNode
  requiredRole?: 'admin' | 'editor' | 'user'
}

export default function AuthGuard({ children, requiredRole }: AuthGuardProps) {
  const token = localStorage.getItem('access_token')
  const userRole = localStorage.getItem('user_role')
  const location = useLocation()

  if (!token) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  if (requiredRole && userRole !== requiredRole && userRole !== 'admin') {
    return <Navigate to="/" replace />
  }

  return <>{children}</>
}
