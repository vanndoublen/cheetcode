import Link from "next/link"
import { Button } from "./ui/button"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"

const navBarContents = [
    {
        slug: "home",
        name: "Home",
        url: "/home",
    },
    {
        slug: "problems",
        name: "Problems",
        url: "/problems",
    },

]

export const NavBar = () => {
    const pathname = usePathname();

    return (
        <div className="h-full max-w-3xl mx-auto flex items-center justify-center">
            {navBarContents.map((item) => {
                const isActive = pathname === item.url || pathname.startsWith(`${item.url}/`)
                return (

                    <div key={item.slug}>
                        <Button
                            asChild
                            variant="outline"
                            className={cn(
                                "w-20 transition-colors border-0 bg-transparent! hover:bg-transparent!",
                                "text-muted-foreground hover:text-foreground",
                                isActive &&
                                "border-b transition-all duration-100 border-primary text-foreground"
                            )}
                        >
                            <Link href={item.url} prefetch>
                                {item.name}
                            </Link>
                        </Button>
                    </div>
                )
            })}
        </div >
    )
}