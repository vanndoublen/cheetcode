import { SignUp } from "@clerk/nextjs"

export const SignUpView = () => {
    return (
        <div className="h-screen flex items-center justify-center">
            <SignUp />
        </div>
    )
}