import React from "react";

import { cn } from "@/lib/utils";
import { useParams, usePathname, useRouter } from "next/navigation";


export const InfoPanel = ({ children }: { children: React.ReactNode }) => {
    const pathname = usePathname();
    const router = useRouter();
    const { problemSlug } = useParams<{ problemSlug: string }>();

    const name = pathname.split("/").at(-1);

    return (
        <div className="w-full h-full flex flex-col">
            <div className="flex text-xs p-3 border-b sticky backdrop-blur-md transition-all duration-200">
                <button
                    className={cn("py-1 px-8 cursor-pointer flex items-center justify-center gap-2",
                        name === "descriptions" ?
                            "bg-muted" :
                            "text-muted-foreground bg-transparent ",
                    )}
                    onClick={() => router.push(`/problems/${problemSlug}/descriptions`)}
                >
                    Descriptions
                </button>
                <button
                    className={cn("py-1 px-8 cursor-pointer flex items-center justify-center gap-2",
                        name === "solutions" ?
                            "bg-muted" :
                            "text-muted-foreground bg-transparent ",
                    )}
                    onClick={() => router.push(`/problems/${problemSlug}/solutions`)}
                >
                    Solutions
                </button>
            </div>
            <div className="flex-1 overflow-auto p-4">
                {children}
            </div>
        </div>
    )
}
