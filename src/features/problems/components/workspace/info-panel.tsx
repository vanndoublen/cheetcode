import React from "react";

import { cn } from "@/lib/utils";
import { useParams, usePathname, useRouter } from "next/navigation";
import { useUserProblemProgress } from "@/features/submissions/hooks/use-submissions";
import { CheckCircle, HeartRemoveFreeIcons } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";


export const InfoPanel = ({ children }: { children: React.ReactNode }) => {
    const pathname = usePathname();
    const router = useRouter();
    const { problemSlug } = useParams<{ problemSlug: string }>();

    const { data: userProblemProgress } = useUserProblemProgress(problemSlug); 

    const name = pathname.split("/").at(-1);

    return (
        <div className="w-full h-full flex flex-col">
            <div className="flex justify-between text-xs p-3 border-b sticky backdrop-blur-md transition-all duration-200">
                <div className="flex">
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

                    <button
                        className={cn("py-1 px-8 cursor-pointer flex items-center justify-center gap-2",
                            name === "submissions" ?
                                "bg-muted" :
                                "text-muted-foreground bg-transparent ",
                        )}
                        onClick={() => router.push(`/problems/${problemSlug}/submissions`)}
                    >
                        Submissions
                    </button>
                </div>

                <div className="flex items-center gap-x-2 justify-center  px-1 text-xs">
                    {/* <span>{userProblemProgress?.status === "SOLVED" ? "Solved" : "Attempted"}</span> */}
                    {userProblemProgress?.status === "SOLVED" && <HugeiconsIcon icon={CheckCircle} strokeWidth={2} className="size-4 " />}
                    {userProblemProgress?.status === "ATTEMPTED" && <HugeiconsIcon icon={HeartRemoveFreeIcons} strokeWidth={2} className="size-4 " />}
                </div>
            </div>
            <div className="flex-1 overflow-auto p-4">
                {children}
            </div>
        </div>
    )
}
