"use client";

import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useProblemsParams } from "../hooks/use-problems-params";
import { startTransition, useEffect, useState } from "react";
import { PAGINATION } from "@/configs/constants";

const types = [
    "NeetCode75",
    "NeetCode150",
] as const;

type Type = typeof types[number];

const getDisplayType: Record<Type, string> = {
    "NeetCode75": "NeetCode Blind 75",
    "NeetCode150": "NeetCode 150",
}

export const TypesSelectFilter = () => {
    const [params, setParams] = useProblemsParams();
    const [value, setValue] = useState(params.type ?? "all");

    useEffect(() => {
        setValue(params.type ?? "all");
    }, [params.type]);

    const handleChange = (v: string) => {
        setValue(v); // instant UI update

        startTransition(() => {
            if (v === "all") {
                setParams({ type: null, page: PAGINATION.DEFAULT_PAGE });
            } else {
                setParams({ type: v as Type, page: PAGINATION.DEFAULT_PAGE });
            }
        });
    };
    return (
        <Select value={value} onValueChange={handleChange}>
            <SelectTrigger id="small-form-role" className="w-full">
                <SelectValue placeholder="Select a type" />
            </SelectTrigger>
            <SelectContent className="bg-transparent backdrop-blur-sm!">
                <SelectGroup>
                    <SelectItem value="all">All</SelectItem>
                    {types.map(c => (
                        <SelectItem key={c} value={c}>{getDisplayType[c]}</SelectItem>
                    ))}
                </SelectGroup>
            </SelectContent>
        </Select>
    )
}