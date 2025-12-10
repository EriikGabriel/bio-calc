import type { User } from "@supabase/supabase-js"
import { DoorOpen, LogIn, UserCircle } from "lucide-react"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { Button } from "./ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu"

export function Header() {
  const router = useRouter()
  const [user, setUser] = useState<User | null>(null)
  useEffect(() => {
    if (typeof window !== "undefined") {
      const userStr = localStorage.getItem("user")
      if (userStr) {
        // Evita warning de setState síncrono
        requestAnimationFrame(() => setUser(JSON.parse(userStr)))
      } else {
        requestAnimationFrame(() => setUser(null))
      }
    }
  }, [])

  const handleLogin = () => {
    router.push("/login")
  }
  const handleLogout = () => {
    localStorage.removeItem("user")
    localStorage.removeItem("session")
    setUser(null)
    router.push("/login")
  }

  return (
    <header className="bg-soil-800 h-14 w-[90%] flex justify-between items-center p-3 rounded-b-2xl">
      <h1 className="text-3xl font-bold tracking-wide">BioCalc</h1>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="link"
            className="bg-transparent ring-0 outline-0"
            size="icon"
          >
            <UserCircle className="size-8 text-white" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-56" align="end">
          <DropdownMenuLabel className="font-bold">
            {user?.user_metadata?.displayName || "Visitante"}
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          {user && (
            <DropdownMenuItem
              className="cursor-pointer"
              onClick={() => router.push("/historico")}
            >
              Histórico
            </DropdownMenuItem>
          )}
          {!user ? (
            <DropdownMenuItem className="cursor-pointer" onClick={handleLogin}>
              Login
              <DropdownMenuShortcut>
                <LogIn />
              </DropdownMenuShortcut>
            </DropdownMenuItem>
          ) : (
            <DropdownMenuItem className="cursor-pointer" onClick={handleLogout}>
              Sair da conta
              <DropdownMenuShortcut>
                <DoorOpen />
              </DropdownMenuShortcut>
            </DropdownMenuItem>
          )}
        </DropdownMenuContent>
      </DropdownMenu>
    </header>
  )
}
