"use client"

import { useState, useMemo } from "react"
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  DragOverlay,
  type DragStartEvent,
  type DragEndEvent,
} from "@dnd-kit/core"
import { SortableContext, useSortable, verticalListSortingStrategy } from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import { GripVertical, Link, Database, Trophy, Mail, Gift, Trash2, Columns, Square } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { cn } from "@/lib/utils"
import { nanoid } from "nanoid"
import type { Layout } from "./edit-project-modal"

const componentMap = {
  links: { name: "Links Group", icon: Link },
  baseProfile: { name: "Base Profile", icon: Database },
  talentProtocol: { name: "Talent Protocol", icon: Trophy },
  contactForm: { name: "Contact Form", icon: Mail },
  donations: { name: "Donations", icon: Gift },
}

function DraggableItem({ id, isOverlay }: { id: string; isOverlay?: boolean }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id })
  const style = { transform: CSS.Transform.toString(transform), transition }
  const { name, icon: Icon } = componentMap[id] || { name: "Unknown", icon: Link }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        "mb-2 flex items-center rounded-lg border bg-white p-3 shadow-sm",
        isDragging && !isOverlay && "opacity-30",
        isOverlay && "shadow-lg",
      )}
    >
      <div {...attributes} {...listeners} className="cursor-grab touch-none p-1">
        <GripVertical className="h-5 w-5 text-silver-400" />
      </div>
      <Icon className="mx-2 h-5 w-5 text-text-secondary" />
      <span className="text-sm font-medium text-text-primary">{name}</span>
    </div>
  )
}

function DroppableColumn({ id, items }: { id: string; items: string[] }) {
  return (
    <SortableContext id={id} items={items} strategy={verticalListSortingStrategy}>
      <div className="min-h-[150px] w-full rounded-lg border-2 border-dashed bg-silver-50 p-4">
        {items.map((item) => (
          <DraggableItem key={item} id={item} />
        ))}
        {items.length === 0 && (
          <div className="flex h-full items-center justify-center">
            <p className="text-sm text-silver-400">Drop here</p>
          </div>
        )}
      </div>
    </SortableContext>
  )
}

export function DisplayLayoutEditor({
  layout,
  onLayoutChange,
  activeAddons,
}: {
  layout: Layout
  onLayoutChange: (newLayout: Layout) => void
  activeAddons: string[]
}) {
  const [activeId, setActiveId] = useState<string | null>(null)
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 10,
      },
    }),
  )

  const allAvailableComponents = useMemo(() => ["links", ...activeAddons], [activeAddons])
  const placedComponents = useMemo(
    () => layout.flatMap((section) => Object.values(section.columns).flatMap((col) => (col ? col : []))),
    [layout],
  )
  const componentBank = useMemo(
    () => allAvailableComponents.filter((comp) => !placedComponents.includes(comp)),
    [allAvailableComponents, placedComponents],
  )

  const findContainer = (id: string) => {
    if (componentBank.includes(id)) return "bank"
    for (const section of layout) {
      for (const colName in section.columns) {
        if (section.columns[colName]?.includes(id)) {
          return `section-${section.id}-${colName}`
        }
      }
    }
    return null
  }

  const handleDragStart = (event: DragStartEvent) => setActiveId(event.active.id as string)

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event
    setActiveId(null)
    if (!over || active.id === over.id) return

    const newLayout = JSON.parse(JSON.stringify(layout))
    const activeContainerId = findContainer(active.id as string)
    const overContainerId = over.data.current?.sortable?.containerId || over.id.toString()

    let movedItem = active.id as string

    // --- REMOVE FROM SOURCE ---
    if (activeContainerId && activeContainerId !== "bank") {
      const parts = activeContainerId.split("-")
      const colName = parts[parts.length - 1]
      const sectionId = parts.slice(1, -1).join("-")

      const sourceSection = newLayout.find((s) => s.id === sectionId)
      if (sourceSection && sourceSection.columns[colName]) {
        const sourceCol = sourceSection.columns[colName]
        const activeIndex = sourceCol.indexOf(active.id as string)
        if (activeIndex > -1) {
          ;[movedItem] = sourceCol.splice(activeIndex, 1)
        }
      }
    }

    // --- ADD TO DESTINATION ---
    if (overContainerId && overContainerId.startsWith("section-")) {
      const parts = overContainerId.split("-")
      const colName = parts[parts.length - 1]
      const sectionId = parts.slice(1, -1).join("-")

      const destSection = newLayout.find((s) => s.id === sectionId)
      if (destSection && destSection.columns[colName]) {
        const destCol = destSection.columns[colName]
        const overIndex = over.data.current?.sortable ? over.data.current.sortable.index : destCol.length
        destCol.splice(overIndex, 0, movedItem)
      }
    }
    // If overContainerId is 'bank', we do nothing, as the item was already removed from the layout.

    onLayoutChange(newLayout)
  }

  const addSection = (type: "single" | "double") => {
    const newSection = {
      id: nanoid(5),
      type,
      columns: type === "single" ? { main: [] } : { left: [], right: [] },
    }
    onLayoutChange([...layout, newSection])
  }

  const deleteSection = (sectionId: string) => {
    onLayoutChange(layout.filter((s) => s.id !== sectionId))
  }

  return (
    <div className="rounded-2xl border border-silver-200 bg-white p-6">
      <h2 className="text-xl font-bold font-display">Display Layout</h2>
      <p className="mt-1 text-sm text-text-secondary">Drag and drop to arrange your public page content.</p>
      <TooltipProvider>
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
        >
          <div className="mt-4 rounded-lg border bg-silver-50 p-4">
            <h3 className="mb-2 font-medium text-text-secondary">Available Components</h3>
            <SortableContext id="bank" items={componentBank}>
              <div className="min-h-[50px] space-y-2">
                {componentBank.map((id) => (
                  <DraggableItem key={id} id={id} />
                ))}
                {componentBank.length === 0 && <p className="text-sm text-silver-400">All components placed.</p>}
              </div>
            </SortableContext>
          </div>

          <div className="mt-4 flex items-center justify-between border-t border-silver-200 pt-4">
            <h3 className="font-medium text-text-secondary">Page Sections</h3>
            <div className="flex gap-2">
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="outline" size="icon" onClick={() => addSection("single")}>
                    <Square className="h-4 w-4" />
                    <span className="sr-only">Add Single Column Section</span>
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Add Single Column</p>
                </TooltipContent>
              </Tooltip>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="outline" size="icon" onClick={() => addSection("double")}>
                    <Columns className="h-4 w-4" />
                    <span className="sr-only">Add Double Column Section</span>
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Add Double Column</p>
                </TooltipContent>
              </Tooltip>
            </div>
          </div>

          <div className="mt-4 space-y-4">
            {layout.map((section) => (
              <div key={section.id} className="rounded-lg border p-4">
                <div className="mb-4 flex items-center justify-between">
                  <h4 className="font-semibold text-text-primary">
                    {section.type === "double" ? "Double Column Section" : "Single Column Section"}
                  </h4>
                  <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => deleteSection(section.id)}>
                    <Trash2 className="h-4 w-4 text-red-500" />
                  </Button>
                </div>
                {section.type === "double" ? (
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <DroppableColumn id={`section-${section.id}-left`} items={section.columns.left || []} />
                    <DroppableColumn id={`section-${section.id}-right`} items={section.columns.right || []} />
                  </div>
                ) : (
                  <DroppableColumn id={`section-${section.id}-main`} items={section.columns.main || []} />
                )}
              </div>
            ))}
          </div>

          <DragOverlay>{activeId ? <DraggableItem id={activeId} isOverlay /> : null}</DragOverlay>
        </DndContext>
      </TooltipProvider>
    </div>
  )
}
