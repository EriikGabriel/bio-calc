import { supabase } from "@/services/supabase"
import { Lock, Mail, User } from "lucide-react"
import type { Dispatch, FormEvent, SetStateAction } from "react"
import { useState } from "react"
import { Button } from "./ui/button"
import { Field, FieldGroup, FieldLabel, FieldSet } from "./ui/field"
import { InputGroup, InputGroupAddon, InputGroupInput } from "./ui/input-group"

interface SignupFormProps {
  formType: {
    set: Dispatch<SetStateAction<"login" | "signup">>
  }
}

export function SignupForm({ formType }: SignupFormProps) {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [username, setUsername] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSignup = async (e: FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { displayName: username } },
    })
    if (error) {
      setError(error.message)
    } else {
      formType.set("login")
    }
    setLoading(false)
  }

  return (
    <form className="flex flex-col h-full" onSubmit={handleSignup}>
      <FieldSet className="h-1/2 flex flex-col">
        <FieldGroup className="flex flex-col gap-4">
          <Field>
            <FieldLabel htmlFor="user" className="text-soil-800">
              Usuário
            </FieldLabel>
            <InputGroup className="bg-white">
              <InputGroupInput
                id="user"
                type="text"
                placeholder="Digite seu nome de usuário"
                className="text-soil-800 "
                autoComplete="off"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              />
              <InputGroupAddon className="">
                <User className="w-5 h-5 text-herb-200/70" />
              </InputGroupAddon>
            </InputGroup>
          </Field>

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
          {loading ? "Cadastrando..." : "Cadastrar"}
        </Button>
        {error && <span className="text-red-500 mt-2">{error}</span>}

        <div className="flex gap-1 items-center pt-2 text-soil-800">
          <p>Já tem uma conta?</p>
          <Button
            type="button"
            variant="link"
            className="font-bold text-soil-800 text-md p-0 h-fit"
            onClick={() => formType.set("login")}
          >
            Entre
          </Button>
        </div>
      </FieldSet>
    </form>
  )
}
