import { redirect } from "next/navigation"
import { CreateItemPage } from "@/features/items/create-item-page"

interface CreatePageProps {
  searchParams: Promise<{ space?: string }>
}

export default async function CreatePage({ searchParams }: CreatePageProps) {
  const { space } = await searchParams
  if (!space) redirect("/spaces")
  return <CreateItemPage spaceId={space} />
}
