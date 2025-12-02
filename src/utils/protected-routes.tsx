import { Navigate, Outlet } from "react-router"

export function ProtectedRoutes() {
  const user = true

  return user ? <Outlet /> : <Navigate to="/login" />
}
