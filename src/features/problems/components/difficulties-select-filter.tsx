"use client";

import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Difficulty } from "@/generated/prisma/enums";
import { useProblemsParams } from "../hooks/use-problems-params";
import { startTransition, useEffect, useState } from "react";
import { PAGINATION } from "@/configs/constants";

export const DifficultiesSelectFilter = () => {
    const [params, setParams] = useProblemsParams();
    const [value, setValue] = useState(params.difficulty ?? "all");

    useEffect(() => {
        setValue(params.difficulty ?? "all");
    }, [params.difficulty]);

    const handleChange = (v: string) => {
        setValue(v); // instant UI update

        startTransition(() => {
            if (v === "all") {
                setParams({ difficulty: null, page: PAGINATION.DEFAULT_PAGE });
            } else {
                setParams({ difficulty: v as Difficulty, page: PAGINATION.DEFAULT_PAGE });
            }
        });
    };
    return (
        <Select value={value} onValueChange={handleChange}>
            <SelectTrigger id="small-form-role" className="w-full">
                <SelectValue placeholder="Select a difficulty" />
            </SelectTrigger>
            <SelectContent
                className="
                    bg-transparent backdrop-blur-sm"
            >
                <SelectGroup>
                    <SelectItem value="all">All</SelectItem>
                    {Object.values(Difficulty).map(d => (
                        <SelectItem key={d} value={d}>{d[0] + d.slice(1).toLowerCase()}</SelectItem>
                    ))}
                </SelectGroup>
            </SelectContent>
        </Select>
    )
}