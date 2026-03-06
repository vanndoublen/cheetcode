import { Suspense } from "react";
import { type SearchParams } from "nuqs/server";
import { ErrorBoundary } from "react-error-boundary";

import { HydrateClient } from "@/trpc/server";
import { ProblemsContainer } from "@/features/problems/components/problems-container";
import { prefetchProblems } from "@/features/problems/server/prefetch";
import { problemsParamsLoader } from "@/features/problems/server/params-loader";
import { ProblemLoading, ProblemsList } from "@/features/problems/components/problems-list";

interface Props {
    searchParams: Promise<SearchParams>
}

const Page = async ({ searchParams }: Props) => {
    const params = await problemsParamsLoader(searchParams);
    prefetchProblems({ ...params, difficulty: params.difficulty ?? undefined, });
    return (
        <ProblemsContainer>
            <HydrateClient>
                <ErrorBoundary fallback={<p>Error...</p>}>
                    <Suspense key={`${params.page}-${params.search}-${params.difficulty}-${params.category}`} fallback={<ProblemLoading />}>
                        <ProblemsList />
                    </Suspense>
                </ErrorBoundary>
            </HydrateClient>
        </ProblemsContainer>
    )
}

export default Page;