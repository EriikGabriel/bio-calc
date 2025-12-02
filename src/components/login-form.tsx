import { Lock, Mail } from "lucide-react"
import type { Dispatch, SetStateAction } from "react"
import { Button } from "./ui/button"
import { Field, FieldGroup, FieldLabel, FieldSet } from "./ui/field"
import { InputGroup, InputGroupAddon, InputGroupInput } from "./ui/input-group"

interface LoginFormProps {
  formType: {
    set: Dispatch<SetStateAction<"login" | "signup">>
  }
}

export function LoginForm({ formType }: LoginFormProps) {
  return (
    <form className="flex flex-col h-full">
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
              />
              <InputGroupAddon className="">
                <Lock className="w-5 h-5 text-herb-200/70" />
              </InputGroupAddon>
            </InputGroup>
          </Field>
        </FieldGroup>

        <Button className="bg-soil-800 text-soil-900 hover:bg-soil-800/90 font-semibold w-1/2">
          Entrar
        </Button>

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
