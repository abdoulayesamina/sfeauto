"use client"
import { Button } from "@/src/shared/components/ui/button"
import { Input } from "@/src/shared/components/ui/input"

export function SearchBar({ onSearch }: { onSearch: () => void }) {
  return (
    <div className="flex p-4 shadow rounded mt-4 justify-center">
      <div className="flex gap-2 w-full md:w-[80%] flex-col md:flex-row">
        <Input className="flex-1" />
        <Button onClick={onSearch}>Rechercher</Button>
      </div>
    </div>
  )
}
