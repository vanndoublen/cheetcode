"use client";

import { ClerkProvider } from "@clerk/nextjs"
import { TRPCReactProvider } from "@/trpc/client"
import { TooltipProvider } from "@/components/ui/tooltip"

import { ThemeProvider } from "./theme-provider"
import { useTheme } from "next-themes";

import { dark, neobrutalism, shadcn } from "@clerk/themes";
import { useEffect } from "react";
import { Header } from "./header";

export const Providers = ({ children }: { children: React.ReactNode }) => {
    const { theme } = useTheme();

    useEffect(() => {
        console.log("asdf");
        console.log(theme);

    }, []);

    return (
        <ClerkProvider
            appearance={{
                signIn: {theme: shadcn},
                signUp: {theme: shadcn},
                userButton: {theme: shadcn},
                userProfile: {theme: shadcn}
            }}
        >
            <TRPCReactProvider>
                <TooltipProvider>
                    <ThemeProvider
                        attribute="class"
                        defaultTheme="system"
                        enableSystem
                        disableTransitionOnChange
                    >
                        <Header />
                        {children}
                    </ThemeProvider>
                </TooltipProvider>
            </TRPCReactProvider>
        </ClerkProvider>
    )
}