import { Card, CardContent } from "@/src/shared/components/ui/card"
import { AlertCircle, Search } from "lucide-react"

interface EmptyStateProps {
  searchQuery: string
}

export default function EmptyState({ searchQuery }: EmptyStateProps) {
  return (
    <Card className="border-dashed border-2 border-gray-300 bg-gray-50">
      <CardContent className="py-16 text-center">
        {searchQuery ? (
          <>
            <Search className="mx-auto text-gray-400 mb-4" size={48} />
            <h3 className="text-lg font-semibold text-gray-700 mb-2">Aucune intervention trouvée</h3>
            <p className="text-gray-500 max-w-md mx-auto">
              Aucune intervention ne correspond à votre recherche "<span className="font-medium">{searchQuery}</span>"
            </p>
            <p className="text-sm text-gray-400 mt-3">
              Essayez avec d'autres termes ou vérifiez l'orthographe
            </p>
          </>
        ) : (
          <>
            <AlertCircle className="mx-auto text-gray-400 mb-4" size={48} />
            <h3 className="text-lg font-semibold text-gray-700 mb-2">Aucune intervention enregistrée</h3>
            <p className="text-gray-500">
              Vous n'avez pas encore d'intervention avec ce filtre de statut
            </p>
          </>
        )}
      </CardContent>
    </Card>
  )
}