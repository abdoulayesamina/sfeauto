import { Button } from "@/src/shared/components/ui/button"
import { SearchX, ArrowLeft, PlusCircle } from "lucide-react"

type VehicleNotFoundProps = {
  onBack: () => void
  onCreate: () => void
}

export function VehicleNotFound({ onBack, onCreate }: VehicleNotFoundProps) {
  return (
    <div className="w-full lg:w-[70%] mt-14 mx-auto rounded-2xl border bg-white/70 backdrop-blur shadow-lg p-16 flex flex-col items-center gap-6">
      
      <div className="w-20 h-20 flex items-center justify-center rounded-full bg-red-50 text-red-500">
        <SearchX size={42} />
      </div>

      <h1 className="text-2xl font-semibold text-zinc-800">
        Véhicule introuvable
      </h1>

      <p className="text-zinc-500 text-center max-w-md">
        Aucun véhicule ne correspond à votre recherche.
      </p>

      <div className="flex flex-col lg:flex-row gap-4 mt-4">
        <Button
          variant="outline"
          className="flex items-center gap-2"
          onClick={onBack}
        >
          <ArrowLeft size={18} />
          Revenir à la recherche
        </Button>

        <Button
          className="flex items-center gap-2"
          onClick={onCreate}
        >
          <PlusCircle size={18} />
          Créer un nouveau véhicule
        </Button>
      </div>

    </div>
  )
}
