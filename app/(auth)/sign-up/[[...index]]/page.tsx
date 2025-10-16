"use client"
import { SignUp } from "@clerk/nextjs"

export default function SignUpPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="w-full max-w-md rounded-2xl border border-border bg-card p-8 shadow-lg">
        <SignUp routing="path" path="/sign-up" afterSignUpUrl="/" afterSignInUrl="/" />
      </div>
    </main>
  )
}
