"use client";

import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useProblemsParams } from "../hooks/use-problems-params";
import { startTransition, useEffect, useState } from "react";
import { PAGINATION } from "@/configs/constants";

const categories = [
    "Algorithms",
    "Graph Theory",
    "Data Structures",
    "Concurrency",
    "Database"
] as const;

type Category = typeof categories[number];

export const CategorySelectFilter = () => {
    const [params, setParams] = useProblemsParams();
    const [value, setValue] = useState(params.category ?? "all");

    useEffect(() => {
        setValue(params.category ?? "all");
    }, [params.category]);

    const handleChange = (v: string) => {
        setValue(v); // instant UI update

        startTransition(() => {
            if (v === "all") {
                setParams({ category: null, page: PAGINATION.DEFAULT_PAGE });
            } else {
                setParams({ category: v as Category, page: PAGINATION.DEFAULT_PAGE });
            }
        });
    };
    return (
        <Select value={value} onValueChange={handleChange}>
            <SelectTrigger id="small-form-role" className="w-full">
                <SelectValue placeholder="Select a category" />
            </SelectTrigger>
            <SelectContent className="bg-transparent backdrop-blur-sm!">
                <SelectGroup>
                    <SelectItem value="all">All</SelectItem>
                    {categories.map(c => (
                        <SelectItem key={c} value={c}>{c[0] + c.slice(1).toLowerCase()}</SelectItem>
                    ))}
                </SelectGroup>
            </SelectContent>
        </Select>
    )
}