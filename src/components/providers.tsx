"use client";

import { shadcn } from "@clerk/themes";
import { ClerkProvider } from "@clerk/nextjs"
import { TRPCReactProvider } from "@/trpc/client"
import { TooltipProvider } from "@/components/ui/tooltip"

import { Header } from "./header";
import { ThemeProvider } from "./theme-provider"

import { NuqsAdapter } from "nuqs/adapters/next/app"


export const Providers = ({ children }: { children: React.ReactNode }) => {
    return (
        <ClerkProvider
            appearance={{
                signIn: { theme: shadcn },
                signUp: { theme: shadcn },
                userButton: { theme: shadcn },
                userProfile: { theme: shadcn }
            }}
        >
            <TRPCReactProvider>
                <NuqsAdapter>
                    <TooltipProvider>
                        <ThemeProvider
                            attribute="class"
                            defaultTheme="system"
                            enableSystem
                            disableTransitionOnChange
                        >
                            <main className="flex flex-col min-h-screen">
                                <Header />
                                <div className="flex-1">
                                    {children}
                                </div>
                            </main>
                        </ThemeProvider>
                    </TooltipProvider>
                </NuqsAdapter>
            </TRPCReactProvider>
        </ClerkProvider>
    )
}