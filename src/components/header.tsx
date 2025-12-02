import { DoorOpen, UserCircle } from "lucide-react"
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
          <DropdownMenuLabel className="font-bold">John Doe</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem className="cursor-pointer">
            Sair da conta
            <DropdownMenuShortcut>
              <DoorOpen />
            </DropdownMenuShortcut>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </header>
  )
}
