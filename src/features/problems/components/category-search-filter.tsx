"use client";

import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useProblemsParams } from "../hooks/use-problems-params";

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
    const handleChange = (value: string) => {
        if (value === "all") {
            setParams({ category: null });
        } else {
            setParams({ category: value as Category});
        }
    };
    return (
        <Select
            value={params.category ?? "all"}
            onValueChange={handleChange}
        >
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