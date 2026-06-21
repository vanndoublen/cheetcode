import { redirect } from 'next/navigation'

export default async function Page({
    params,
}: {
    params: Promise<{ problemSlug: string }>
}) {
    const { problemSlug } = await params
    redirect(`/problems/${problemSlug}/descriptions`)
}