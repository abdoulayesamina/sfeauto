import { createColumns, DataTable } from "@/src/shared/components/data-table"
import { Badge } from "@/src/shared/components/ui/badge"
import { Button } from "@/src/shared/components/ui/button"
import { Remise } from "@/src/utils/types/remise"
import { ColumnDef } from "@tanstack/react-table"
import { useRemiseApi } from "../hooks/useRemise.api"
import { useEffect, useState } from "react"
import { Spinner } from "@/src/shared/components/spinner"
import { Article } from "@/src/utils/types/article"
import { confirmAlert, errorAlert, successAlert } from "@/src/lib/alerts"

type RemiseDatatableProps = {
    articleListe: Article[],
    refresh : number,
    handleEditSubmit: (data:Remise)=>void,
}

export function RemiseDataTable( {articleListe,refresh, handleEditSubmit} : RemiseDatatableProps){

    const {getAllRemises, deleteRemise} = useRemiseApi();
    const [remisesListe,setRemisesListe] = useState<Remise[]>([]);
    const [remisesListeFiltered,setRemisesListeFiltered] = useState<Remise[]>([]);
    const [loading, setLoading] = useState(true)
    const [idToDelete, setIdToDelete] = useState<number | null>(null)

    const handleSearch = (e:string)=>{
        let value = e.toLocaleLowerCase().trim()
        if(!value){
            setRemisesListeFiltered(remisesListe)
        return
        }
        
        let remiseFiltered = remisesListe.filter(r=>{
            const article = articleListe.find(a => a.art_id === r.rem_articleId);
            return article?.art_name.toLowerCase().includes(value) || String(r.rem_pourcentage).includes(value) || String(r.rem_prixremise).includes(value);
        })
        setRemisesListeFiltered(remiseFiltered);
    }

    const columns: ColumnDef<Remise>[] = [
        {
            header: "Article",
            cell: ({ row }) => (
                <div>
                    {articleListe.find(a => a.art_id === row.original.rem_articleId)?.art_name}
                </div>
            ),
        },
        {
            header: "Pourcentage",
            cell: ({ row }) => (
                <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-200">{row.original.rem_pourcentage || 0}</Badge>
            ),
        },
        {
            header: "Prix remisé",
            cell: ({ row }) => (
                <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-200">
                {row.original.rem_prixremise || 0}
                </Badge>
            ),
        },
        {
            header: "Actions",
            cell: ({ row }) => (
                <div className="flex gap-2">
                <Button variant="outline" onClick={() => handleEdit(row.original)}>
                    Modifier
                </Button>
                <Button variant="destructive" onClick={() => handleDelete(row.original)} disabled={idToDelete === row.original.rem_id}>
                    {idToDelete === row.original.rem_id ? <Spinner className="size-4" /> : ""}
                    Supprimer
                </Button>
                </div>
            ),
        },
    ]

    const handleEdit = (data : Remise) => {
        handleEditSubmit(data)
    }

    const handleDelete = async (data : Remise) => {
        const confirmed = await confirmAlert("Suprimer la remise",`Voulez-vous vraiment cette remise ?`)
        if (!confirmed) return;

        setIdToDelete(data.rem_id ?? 0);
        try{
            await deleteRemise(data.rem_id ?? 0)
            successAlert("Remise supprimée", "La remise a étée supprimée avec succès !")
        }catch(e:any){
            errorAlert("Erreur", e.message || e.error || "erreur lors de la supression !");
            setIdToDelete(null);
            return;
        }
        setIdToDelete(null);
        let filteredRemise = remisesListe.filter(r=>r.rem_id !== data.rem_id)
        setRemisesListe(filteredRemise)
    }


    const tableColumns = createColumns({ columns })

    const init = async ()=>{
        setLoading(true);
        try{
            const remises = await getAllRemises();
            setRemisesListe(remises);
        }catch(e:any){
            throw new Error(e.error)
        }finally{
            setLoading(false)
        }
    }

    useEffect(()=>{
        init();
    },[])
    useEffect(()=>{
        init();
    },[refresh])


    useEffect(()=>{
        setRemisesListeFiltered(remisesListe);
    },[remisesListe])

    return(
        <div>
            {loading && <div className="px-6 flex justify-center mb-4">
                <Spinner className="size-6" />
            </div>}

            <div>
                <DataTable data={remisesListeFiltered} columnsProps={tableColumns} handleSearch={(e)=>handleSearch(e)} title={"Liste des remises"}/>
            </div>
        </div>
    )
}


