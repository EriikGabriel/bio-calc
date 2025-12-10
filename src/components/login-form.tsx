import { supabase } from "@/services/supabase"
import { Loader2, Lock, Mail } from "lucide-react"
import { useRouter } from "next/navigation"
import type { Dispatch, FormEvent, SetStateAction } from "react"
import { useState } from "react"
import { Button } from "./ui/button"
import { Field, FieldGroup, FieldLabel, FieldSet } from "./ui/field"
import { InputGroup, InputGroupAddon, InputGroupInput } from "./ui/input-group"

interface LoginFormProps {
  formType: {
    set: Dispatch<SetStateAction<"login" | "signup">>
  }
}

export function LoginForm({ formType }: LoginFormProps) {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  const handleLogin = async (e: FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })
    if (error) {
      setError(error.message)
      setLoading(false)
    } else if (data.session && data.user) {
      // Verifica se o usuário está confirmado
      if (data.user.confirmed_at || data.user.email_confirmed_at) {
        localStorage.setItem("user", JSON.stringify(data.user))
        localStorage.setItem("session", JSON.stringify(data.session))
        router.push("/")
        // Não chama setLoading(false) aqui para manter o spinner até o redirect
      } else {
        setError("Confirme seu e-mail antes de fazer login.")
        setLoading(false)
      }
    } else {
      setError("Usuário ou senha inválidos.")
      setLoading(false)
    }
  }

  return (
    <form className="flex flex-col h-full" onSubmit={handleLogin}>
      <FieldSet className="h-1/2 flex flex-col">
        <FieldGroup className="flex flex-col gap-4">
          <Field>
            <FieldLabel htmlFor="email" className="text-soil-800">
              E-mail
            </FieldLabel>
            <InputGroup className="bg-white">
              <InputGroupInput
                id="email"
                type="text"
                placeholder="Digite seu email"
                className="text-soil-800 "
                autoComplete="off"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
              <InputGroupAddon className="">
                <Mail className="w-5 h-5 text-herb-200/70" />
              </InputGroupAddon>
            </InputGroup>
          </Field>

          <Field>
            <FieldLabel htmlFor="password" className="text-soil-800">
              Senha
            </FieldLabel>
            <InputGroup className="bg-white">
              <InputGroupInput
                id="password"
                type="password"
                placeholder="Digite sua senha"
                className="text-soil-800 "
                autoComplete="off"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <InputGroupAddon className="">
                <Lock className="w-5 h-5 text-herb-200/70" />
              </InputGroupAddon>
            </InputGroup>
          </Field>
        </FieldGroup>

        <Button
          className="bg-soil-800 text-soil-900 hover:bg-soil-800/90 font-semibold w-1/2"
          type="submit"
          disabled={loading}
        >
          {loading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin mr-2" /> Entrando...
            </>
          ) : (
            "Entrar"
          )}
        </Button>
        {error && <span className="text-red-500 mt-2">{error}</span>}

        <div className="flex gap-1 items-center pt-2 text-soil-800">
          <p>Não tem uma conta?</p>
          <Button
            type="button"
            variant="link"
            className="font-bold text-soil-800 text-md p-0 h-fit"
            onClick={() => formType.set("signup")}
          >
            Cadastre-se
          </Button>
        </div>
      </FieldSet>
    </form>
  )
}
