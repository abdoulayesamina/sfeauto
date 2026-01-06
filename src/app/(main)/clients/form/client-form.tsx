import { Button } from "@/src/shared/components/ui/button";
import { Input } from "@/src/shared/components/ui/input";
import { Label } from "@/src/shared/components/ui/label";

export function ClientForm({ onClose, onSubmit }: { onClose: () => void; onSubmit: () => void }) {

    return (
        <form className="">
            <div className="mb-4 flex flex-col gap-2 items-start"> 
                <Label htmlFor="name">Nom</Label>
                <Input className="h-16" id="name" type="text" placeholder="name" />
                <div className="mt-6 flex justify-end gap-4 w-full">
                    <Button type="button" variant="outline" onClick={onClose}>Annuler</Button>
                    <Button onClick={onSubmit} type="submit">Enregistrer</Button>
                </div>
            </div>
        </form>
    )
}