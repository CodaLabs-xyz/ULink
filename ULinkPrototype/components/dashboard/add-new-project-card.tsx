import Link from "next/link"
import { Plus } from "lucide-react"

export function AddNewProjectCard() {
  return (
    <Link
      href="/dashboard/project/new"
      className="flex h-full min-h-[218px] flex-col items-center justify-center rounded-2xl border-2 border-dashed border-silver-300 bg-silver-50 text-silver-500 transition-all duration-300 hover:border-primary-400 hover:bg-primary-50 hover:text-primary-600"
    >
      <Plus className="h-10 w-10" />
      <span className="mt-2 font-semibold">Add New Project</span>
    </Link>
  )
}
