import { redirect } from "next/navigation"
import { CreateItemPage } from "@/features/items/create-item-page"
import { CreateCircleItem } from "@/features/circles/create-circle-item"

interface CreatePageProps {
  searchParams: Promise<{ space?: string; circle?: string }>
}

export default async function CreatePage({ searchParams }: CreatePageProps) {
  const { space, circle } = await searchParams
  if (circle) return <CreateCircleItem circleId={circle} />
  if (space) return <CreateItemPage spaceId={space} />
  redirect("/spaces")
}
