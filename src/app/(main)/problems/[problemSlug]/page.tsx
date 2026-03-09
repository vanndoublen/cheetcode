import { ProblemWorkspaceView } from "@/features/problems/components/workspace/problem-workspace-view";
import { prefetchProblemWorkspace } from "@/features/problems/server/prefetch";

interface Props {
    params: Promise<{
        problemSlug: string;
    }>
}

const Page = async ({ params }: Props) => {
    const { problemSlug } = await params;
    prefetchProblemWorkspace(problemSlug);

    return (
        <ProblemWorkspaceView slug={problemSlug} />
    )
}

export default Page;