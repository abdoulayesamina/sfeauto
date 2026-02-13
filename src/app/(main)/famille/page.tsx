"use client";

import { createColumns, DataTable } from "@/src/shared/components/data-table";
import { Modal } from "@/src/shared/components/modal";
import { Spinner } from "@/src/shared/components/spinner";
import { Button } from "@/src/shared/components/ui/button";
import { useEffect, useState } from "react";
import { ColumnDef } from "@tanstack/react-table";
import { FamilleForm } from "./forms/famille-form";
import { useFamilleApi } from "./shared/useFamille.api";
import { Famille } from "@/src/utils/types/famille";
import { confirmAlert, errorAlert, successAlert } from "@/src/lib/alerts";
import { toast } from "sonner";

export default function FamillePage() {
    const { getAllFamilles, createFamille, updateFamille, deleteFamille } = useFamilleApi();

    const [loading, setLoading] = useState(false);
    const [isOpen, setIsOpen] = useState(false);
    const [editOpen, setEditOpen] = useState(false);
    const [formData, setFormData] = useState<Famille>({fam_name: ""});
    const [familleSearch, setfamilleSearch] = useState<Famille[]>([]);
    const [familles, setFamilles] = useState<Famille[]>([]);
    const [loadingFamilles, setLoadingFamilles] = useState(false);
    const [idToDelete, setIdToDelete] = useState<number | null>(null);

    const loadFamilles = async () => {
        try {
            const data = await getAllFamilles();
            setFamilles(data);
        }catch (e: any) {
           throw new Error(e);
        }
    };

    useEffect(() => {
        const init = async () => {
            setLoading(true);
            try {
                await loadFamilles();
            }
            catch (e: any) {
                toast.error("Erreur", e.message);
                return;
            }
            finally {
                setLoading(false);
            }
        };
        init();
    }, []);

    useEffect(() => {
        setfamilleSearch(familles);
    },[familles]);

    const columns: ColumnDef<any>[] = [
        {
            accessorKey: "fam_name",
            header: "Nom",
        },
        {
            header: "Actions",
            cell: ({ row }) => (
            <div className="flex gap-2">
                <Button variant="outline" onClick={() => handleUpdate(row.original)} disabled={idToDelete === row.original.art_id}>
                    Modifier
                </Button>
                <Button variant="destructive" onClick={() => handleDelete(row.original)} disabled={idToDelete === row.original.fam_id}>
                    <span className="flex items-center gap-2">
                        {idToDelete === row.original.fam_id ? <Spinner className="size-4" /> : ""}
                        Supprimer
                    </span>
                </Button>
            </div>
            ),
        },
    ];

    const tableColumns = createColumns({columns});

    const handleSearch = (e: string) => {
        const filtered = familles.filter((famille) =>
            famille.fam_name.toLowerCase().includes(e.toLowerCase())
        );
        setfamilleSearch(filtered);
    }
    const handleCreate = async () => {
        let newFamilles : Famille = {fam_name: formData.fam_name};
        setLoadingFamilles(true);
        try{
            const res = await createFamille(newFamilles)

            let newFamillesList = [...familles, res.famille];
            setFamilles(newFamillesList)
            successAlert("Famille créée", "La famille a étée créée avec succès !")
        }catch(e:any){
            errorAlert("Erreur", e.message);
            setLoadingFamilles(false);
            return;
        }
        setFormData({fam_name: ""});
        setLoadingFamilles(false);
        setIsOpen(false)
    }
    const handleUpdate = async (data: Famille) => {
         
        setFormData(data)
        setEditOpen(true)
    }
    const handleUpdateSubmit = async () => {
         
        let updatedFamilles : Famille = {fam_id: formData.fam_id, fam_name: formData.fam_name};
        let updatedFamillesList = familles.map(f =>
            f.fam_id === formData.fam_id ? updatedFamilles : f
        );
        setLoadingFamilles(true);
        try{
            await updateFamille(updatedFamilles)
            successAlert("Famille modifiée", "La famille a étée modifiée avec succès !")
        }catch(e:any){
            errorAlert("Erreur", e.message);
            return;
        }

        setFamilles(updatedFamillesList)
        setLoadingFamilles(false);
        setFormData({fam_name: ""});
        setEditOpen(false)
    }

    const handleDelete = async (data: any) => {
        const confirmed = await confirmAlert("Suprimer la famille",`Voulez-vous vraiment supprimer la famille ${data.fam_name} ?`)
        if (!confirmed) return;

        setIdToDelete(data.fam_id);
        try{
            await deleteFamille(data.fam_id)
            successAlert("Famille supprimée", "La famille a étée supprimée avec succès !")
        }catch(e:any){
            errorAlert("Erreur", e.message);
            setIdToDelete(null);
            return;
        }
        setIdToDelete(null);
        let filteredFamilles = familles.filter(f=>f.fam_id !== data.fam_id)
        setFamilles(filteredFamilles)
    }

    return(
        <div className="p-10">
            <div className="flex justify-between mb-2 p-6 items-center">
                <h2 className="font-bold text-2xl">Gestion des familles articles</h2>
                <Button onClick={() => setIsOpen(true)}>Ajouter une famille</Button>
            </div>
            
            {loading && <div className="px-6 flex justify-center mb-4">
                <Spinner className="size-6" />
            </div>}

            {<DataTable data={familleSearch} columnsProps={tableColumns} handleSearch={(e)=>handleSearch(e)}/>}

            {/* CREATE */}
            <Modal open={isOpen} modalTitle="Nouvelle famille" onClose={() => setIsOpen(false)}>
                <FamilleForm
                    mode="create"
                    data={formData}
                    onChange={setFormData}
                    loading={loadingFamilles}
                    onClose={() => {
                        setIsOpen(false)
                        setFormData({fam_name: ""});
                    }}
                    onSubmit={handleCreate}
                />
            </Modal>

            {/* EDIT */}
            <Modal open={editOpen} modalTitle="Modifier famille" onClose={() => setEditOpen(false)}>
                <FamilleForm
                    mode="edit"
                    data={formData}
                    onChange={setFormData}
                    loading={loadingFamilles}
                    onClose={() => {
                        setFormData({fam_name: ""});
                        setEditOpen(false)
                    }}
                    onSubmit={handleUpdateSubmit}
                />
            </Modal>
        </div>
    )
}