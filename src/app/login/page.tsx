"use client"

import { LoginForm } from "@/components/login-form"
import { SignupForm } from "@/components/signup-form"
import { DotLottieReact } from "@lottiefiles/dotlottie-react"
import { useState } from "react"

export default function LoginPage() {
  const [formType, setFormType] = useState<"login" | "signup">("login")

  return (
    <main className="bg-herb-300 text-white h-dvh w-dvw flex justify-center items-center relative overflow-hidden">
      <div className="absolute w-140 h-140 bg-herb-200/30 blur-3xl rounded-full -z-10 top-10"></div>

      <div className="bg-forest-600/90 border-cedar-700/40 border backdrop-blur-xl h-3/5 w-1/4 rounded-2xl p-8 flex flex-col gap-10 shadow-2xl shadow-black/40 relative z-10 animate-[fadeUp_0.7s_ease-out] transition-all duration-300 ">
        <div>
          <h1 className="text-3xl font-bold tracking-wide">BioCalc</h1>
          <h2 className="text-xl text-soil-800 font-semibold">
            {formType === "login" ? "Entrar" : "Cadastre-se"}
          </h2>
        </div>

        {formType === "login" ? (
          <LoginForm formType={{ set: setFormType }} />
        ) : (
          <SignupForm formType={{ set: setFormType }} />
        )}
      </div>

      <div className="absolute bottom-0 left-1/2 -translate-x-1/2">
        <DotLottieReact
          src="https://lottie.host/e1a28ccd-2211-4d33-95e2-82bc56ec0708/CuqGranOiy.lottie"
          autoplay
          speed={0.25}
          className="h-80 opacity-85"
        />
      </div>
    </main>
  )
}
