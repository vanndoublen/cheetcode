"use client";

import { startTransition, useEffect, useState } from "react";

import { useTags } from "../../tags/hooks/use-tags";

import { HugeiconsIcon } from "@hugeicons/react"
import { Checkbox } from "@/components/ui/checkbox";
import { CheckListIcon, Loading03FreeIcons } from "@hugeicons/core-free-icons"
import { useProblemsParams } from "@/features/problems/hooks/use-problems-params";

export const TagsFilter = () => {
    const { data, isLoading } = useTags();
    const [params, setParams] = useProblemsParams();
    const [value, setValue] = useState<string[]>([]);

    useEffect(() => {
        setValue(params.tags ?? value);
    }, [params.tags]);

    const handleChange = (v: string) => {
        setValue([...value, v]); // instant UI update

        startTransition(() => {
            if (params.tags.includes(v)) {
                const tags = params.tags.filter((t) => t !== v) || []; // already checked, if click again means uncheck
                setParams({ tags: tags })
            } else {
                setParams({ tags: value })
            }
        });
    };

    return (
        <div className="flex flex-col gap-y-4">
            {isLoading ? (
                <div className="flex items-center justify-center p-4">
                    <HugeiconsIcon icon={Loading03FreeIcons} strokeWidth={2} className="animate-spin" />
                </div>
            ) : (
                data?.map((tag) => (
                    <div
                        key={tag.id}
                        className="flex items-center justify-between cursor-pointer"
                        onClick={() => handleChange(tag.name)}
                    >
                        <p className="text-xs">{tag.name}</p>
                        <Checkbox
                            checked={params.tags?.includes(tag.name)}
                            onCheckedChange={() => handleChange(tag.name)}
                            className="border-primary/50!"
                        />
                    </div>
                ))

            )}
        </div>
    )
}