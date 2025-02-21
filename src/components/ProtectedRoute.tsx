import { useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import { Navigate, useNavigate } from 'react-router'

export default function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null)
  const navigate = useNavigate()

  useEffect(() => {
    const validateAuth = () => {
      const token = localStorage.getItem('token')
      const user = localStorage.getItem('user')

      if (!token || !user) {
        setIsAuthenticated(false)
        toast.error('Please login to access this page')
        return
      }

      try {
        const userData = JSON.parse(user)

        if (userData.role !== 'admin') {
          throw new Error('Unauthorized')
        }

        setIsAuthenticated(true)
      } catch (error) {
        setIsAuthenticated(false)
        localStorage.removeItem('token')
        localStorage.removeItem('user')

        if (error instanceof Error) {
          if (error.message === 'Unauthorized') {
            toast.error('Admin access required')
          } else {
            toast.error('Session expired. Please login again.')
          }
        }

        navigate('/auth/login')
      }
    }

    validateAuth()
  }, [navigate])

  if (isAuthenticated === null) {
    return (
      <div className='flex h-screen items-center justify-center'>
        <div className='text-lg'>Verifying access...</div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return <Navigate to='/auth/login' replace />
  }

  return <>{children}</>
}
