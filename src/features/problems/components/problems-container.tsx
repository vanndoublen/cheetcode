"use client";

import { FiltersView } from "./filters-view"
import { SearchInput } from "./search-input"
import { ProblemsPagination } from "./problems-pagination";
import { useSuspenseProblems } from "../hooks/use-problems";
import { useProblemsParams } from "../hooks/use-problems-params";

export const ProblemsContainer = ({ children }: { children: React.ReactNode }) => {
    const problems = useSuspenseProblems();
    const [params, setParams] = useProblemsParams();

    return (
        <div className="grid grid-cols-9 p-4">
            <div className="col-span-2">
                <FiltersView />
            </div>
            <div className="col-span-7">
                <div className="flex flex-col gap-y-4">
                    <SearchInput
                        placeholder="Search Problems"
                    />
                    <ProblemsPagination
                        disabled={problems.isPending}
                        totalPages={problems.data.totalPages}
                        page={problems.data.page}
                        onPageChange={(page) => setParams({ ...params, page })}
                    />
                    {children}
                </div>
            </div>
        </div>
    )
}