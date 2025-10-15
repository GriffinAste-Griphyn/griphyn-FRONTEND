import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import { ClerkProvider, SignedIn, SignedOut, SignInButton, SignUpButton } from "@clerk/nextjs"
import { SignIn } from "@clerk/nextjs"
import { Suspense } from "react"
import "./globals.css"
import { DashboardHeader } from "@/components/dashboard-header"
import { Sidebar } from "@/components/sidebar"
import { AssistantPanel } from "@/components/assistant-panel"
import { LoadingSpinner } from "@/components/loading-spinner"
import AppProviders from "@/components/app-providers"

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
})

export const metadata: Metadata = {
  title: "GRIPHYN Dashboard",
  description: "Manage your brand partnerships and sponsorships",
  generator: "v0.app",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <ClerkProvider>
      <html lang="en" className={inter.variable}>
        <body className="font-sans">
          <SignedIn>
            <Suspense
              fallback={
                <div className="flex min-h-screen w-full items-center justify-center">
                  <LoadingSpinner />
                </div>
              }
            >
              <div className="min-h-screen bg-background">
                <DashboardHeader />

                <div className="flex">
                  <Sidebar />

                  <main className="flex-1 px-4 md:px-6 py-6 md:py-8 w-full">
                    <AppProviders>{children}</AppProviders>
                  </main>
                </div>

                <AssistantPanel />
              </div>
            </Suspense>
          </SignedIn>

          <SignedOut>
            <div className="min-h-screen bg-background text-foreground">
              <div className="mx-auto flex min-h-screen max-w-4xl flex-col items-center justify-center gap-10 px-6 py-12 text-center">
                <div className="space-y-4">
                  <p className="inline-flex items-center rounded-full bg-primary/10 px-4 py-1 text-sm font-medium text-primary">
                    Meet your AI talent agent
                  </p>
                  <h1 className="text-4xl font-semibold md:text-5xl">Grow brand deals with Griphyn</h1>
                  <p className="text-base text-muted-foreground md:text-lg">
                    Sign in to manage your pipeline, automate outreach, and keep every deliverable on track.
                  </p>
                </div>

                <div className="flex flex-col items-center gap-3 sm:flex-row">
                  <SignUpButton mode="modal">
                    <button className="rounded-full bg-primary px-6 py-2 text-sm font-semibold text-primary-foreground shadow-sm transition hover:bg-primary/90">
                      Get started
                    </button>
                  </SignUpButton>
                  <SignInButton mode="modal">
                    <button className="rounded-full border border-border px-6 py-2 text-sm font-semibold text-foreground transition hover:bg-muted">
                      I already have an account
                    </button>
                  </SignInButton>
                </div>

                <div className="w-full max-w-sm rounded-2xl border border-border bg-card/80 p-6 shadow-lg backdrop-blur">
                  <SignIn routing="hash" />
                </div>
              </div>
            </div>
          </SignedOut>
        </body>
      </html>
    </ClerkProvider>
  )
}
