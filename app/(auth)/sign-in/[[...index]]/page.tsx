"use client"
import { SignIn } from "@clerk/nextjs"

export default function SignInPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="w-full max-w-md rounded-2xl border border-border bg-card p-8 shadow-lg">
        <SignIn routing="path" path="/sign-in" afterSignInUrl="/" afterSignUpUrl="/" />
      </div>
    </main>
  )
}
