import { SignIn } from "@clerk/nextjs"

export const SignInView = () => {
    return (
        <div className="flex h-screen items-center justify-center">
            <SignIn />
        </div>
    )
}