"use client";

import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Difficulty } from "@/generated/prisma/enums";
import { useProblemsParams } from "../hooks/use-problems-params";

export const DifficultiesSelectFilter = () => {
    const [params, setParams] = useProblemsParams();
    const handleChange = (value: string) => {
        if (value === "all") {
            setParams({ difficulty: undefined });
        } else {
            setParams({ difficulty: value as Difficulty });
        }
    };
    return (
        <Select
            value={params.difficulty ?? "all"}
            onValueChange={handleChange}
        >
            <SelectTrigger id="small-form-role" className="w-full">
                <SelectValue placeholder="Select a role" />
            </SelectTrigger>
            <SelectContent className="bg-transparent backdrop-blur-sm!">
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