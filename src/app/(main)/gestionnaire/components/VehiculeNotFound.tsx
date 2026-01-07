import { Button } from "@/src/shared/components/ui/button"
import { SearchX, ArrowLeft, PlusCircle } from "lucide-react"

export function VehiculeNotFound({
  onBack,
  onCreate,
}: {
  onBack: () => void
  onCreate: () => void
}) {
  return (
    <div className="mt-14 mx-auto p-12 text-center border rounded-lg">
      <SearchX size={48} className="mx-auto text-red-500" />
      <h2 className="text-2xl font-bold mt-4">Véhicule introuvable</h2>

      <div className="flex gap-4 justify-center mt-6">
        <Button variant="outline" onClick={onBack}>
          <ArrowLeft /> Retour
        </Button>
        <Button onClick={onCreate}>
          <PlusCircle /> Nouveau véhicule
        </Button>
      </div>
    </div>
  )
}
