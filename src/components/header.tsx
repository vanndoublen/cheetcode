import Image from "next/image"
import { ThemeToggle } from "./theme-toggle"
import { Button } from "./ui/button"
import Link from "next/link"
import { SignedIn, SignedOut, UserButton } from "@clerk/nextjs"
import { NavBar } from "./nav-bar"
import { cn } from "@/lib/utils";

export const Header = () => {
    return (
        <header className="h-14 w-full sticky border-b top-0 z-40 backdrop-blur-md transition-all duration-200">
            <div className="bg-transparent h-full flex items-center justify-between px-24">
                <Link href="/">
                    <Image src="/logo.svg" alt="Cheetcode" height={32} width={32} />
                </Link>

                <NavBar />

                <div className="flex items-center justify-center gap-3">
                    <ThemeToggle />
                    <SignedOut>
                        <Button asChild>
                            <Link href="/sign-in">
                                Sign In
                            </Link>
                        </Button>
                        <Button asChild variant="outline">
                            <Link href="/sign-up">
                                Sign Up
                            </Link>
                        </Button>
                    </SignedOut>

                    <SignedIn>
                        <UserButton />
                    </SignedIn>
                </div>
            </div>
        </header>
    )
}