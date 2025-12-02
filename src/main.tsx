import { StrictMode } from "react"
import { createRoot } from "react-dom/client"
import { BrowserRouter, Route, Routes } from "react-router"
import "./index.css"
import { Home } from "./pages/home.tsx"
import { Login } from "./pages/login.tsx"
import { ProtectedRoutes } from "./utils/protected-routes.tsx"

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <BrowserRouter>
      <Routes>
        <Route element={<Login />} path="/login" />

        <Route element={<ProtectedRoutes />}>
          <Route element={<Home />} path="/" />
        </Route>
      </Routes>
    </BrowserRouter>
  </StrictMode>
)
