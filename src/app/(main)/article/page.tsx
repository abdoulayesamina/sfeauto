"use client";

import { createColumns, DataTable } from "@/src/shared/components/data-table";
import { Modal } from "@/src/shared/components/modal";
import { Spinner } from "@/src/shared/components/spinner";
import { Button } from "@/src/shared/components/ui/button";
import { useEffect, useState } from "react";
import { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/src/shared/components/ui/badge";
import { ArticleForm } from "./forms/article-form";
import { useArticleApi } from "./shared/useAtricle.api";
import { confirmAlert, errorAlert, successAlert } from "@/src/lib/alerts";
import { Article } from "@/src/utils/types/article";
import { useCollectionApi } from "../collection/shared/useCollection.api";
import { Collection } from "@/src/utils/types/collection";
import { useFamilleApi } from "../famille/shared/useFamille.api";
import { Famille } from "@/src/utils/types/famille";
import { toast } from "sonner";
import { error } from "node:console";
import { Description } from "@radix-ui/react-dialog";

export default function ArticlesPage() {
    const { getArticles, createArticle, updateArticle, deleteArticle } = useArticleApi();
    const {getAllCollections} = useCollectionApi();
    const {getAllFamilles} = useFamilleApi();

    const [loading, setLoading] = useState(false);
    const [loadingArticles, setLoadingArticles] = useState(false);

    const [isOpen, setIsOpen] = useState(false);
    const [editOpen, setEditOpen] = useState(false);
    const [formData, setFormData] = useState<Article>({art_name: "", art_price: 0, art_collectionId: 0});
    const [articlesSearch, setArticlesSearch] = useState<Article[]>([]);
    const [articles, setArticles] = useState<Article[]>([]);
    const [collections, setCollections] = useState<Collection[]>([]);
    const [familles, setFammilles] = useState<Famille[]>([]);

    const [idToDelete, setIdToDelete] = useState<number | null>(null);

    const loadArticles = async () => {
        try {
            const data = await getArticles();
            setArticles(data);
            const CollectionsData = await getAllCollections();
            setCollections(CollectionsData);
            const FamillesData = await getAllFamilles();
            setFammilles(FamillesData);
        } catch (e: any) {
           throw new Error(e);
        }
    }

    useEffect(() => {
        const init = async () => {
            setLoading(true);
            try {
                await loadArticles(); 
                
            }catch (e: any) {
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
        setArticlesSearch(articles);
        console.log("articles : "+JSON.stringify(articles));

    },[articles]);

    const handleSearch = (e: string) => {
        const filtered = articles.filter((article) =>
            article.art_name.toLowerCase().includes(e.toLowerCase()) || article.art_price.toString().includes(e)
        );
        setArticlesSearch(filtered);
    }

    const handleCreate = async () => {
        let newArticles : Article = {art_name: formData.art_name, art_price: formData.art_price, art_collectionId: Number(formData.art_collectionId)};
        setLoadingArticles(true);
        try{
            const res = await createArticle(newArticles);
            toast.success("Article créé",
                {description:" L'article a été créé avec succès."}
            );
            setArticles([...articles, res.article]);
            setFormData({art_name: "", art_price: 0, art_collectionId: 0});
        }catch(e:any){
            setLoadingArticles(false);
            toast.error("Erreur", e.message);
            return;
        }

        setLoadingArticles(false);
        setFormData({art_name: "", art_price: 0, art_collectionId: 0});
        setIsOpen(false)
    }

    const handleUpdate = async (data: any) => {
        setFormData(data)
        setEditOpen(true)
    }

    const handleUpdateSubmit = async () => {
         
        let updated : Article = {art_id: formData.art_id, art_name: formData.art_name, art_price: formData.art_price, art_collectionId: Number(formData.art_collectionId)};
        setLoadingArticles(true);

        try{
            await updateArticle(updated.art_id ?? 0, updated);
            toast.success("Article mis à jour",
                {description:" L'article a été mis à jour avec succès."}
            );
        }catch(e:any){
            errorAlert("Erreur", e.message);
            setLoadingArticles(false);
            return;
        }
        setArticles(articles.map(a => a.art_id === updated.art_id ? updated : a));
        setFormData({art_name: "", art_price: 0, art_collectionId: 0});
        setLoadingArticles(false);
        setEditOpen(false)
    }
    
    
    const handleDelete = async (data: Article) => {
        const confirmed = await confirmAlert("Suprimer l'article",`Voulez-vous vraiment supprimer l'article ${data.art_name} ?`)
        if (!confirmed) return;
        
        setIdToDelete(data.art_id ?? null);
        try{
            await deleteArticle(data.art_id ?? 0);
            toast.success("Article supprimé",{description:" L'article a été supprimé avec succès."});
        }catch(e:any){
            toast.error("Erreur", e.message);
            setIdToDelete(null);
            return;
        }

        setIdToDelete(null);
        let filteredArticles = articles.filter(a=>a.art_id !== data.art_id)
        setArticles(filteredArticles)
    }

    const columns: ColumnDef<any>[] = [
        {
            accessorKey: "art_name",
            header: "Nom",
        },
        {
            accessorKey: "art_price",
            header: "Prix",
            cell: ({ row }) => <Badge className="bg-green-300 text-black">{row.original.art_price} €</Badge>,
        },
        {
            accessorKey: "art_collectionId",
            header: "Collection",
            cell: ({ row }) => {
                const collection = collections.find(c => c.col_id === row.original.art_collectionId);
                return <Badge>{collection ? collection.col_name : "N/A"}</Badge>;
            }
        },
        {
            header: "Famille",
            cell: ({ row }) => {
                const famille = familles.find(f => f.fam_id === collections.find(c => c.col_id === row.original.art_collectionId)?.col_familleId);
                return <Badge>{famille ? famille.fam_name : "N/A"}</Badge>;
            }
        },
        // {
        //     accessorKey: "art_codeArticle",
        //     header: "Code article",
        //     cell: ({ row }) => {
        //         return <Badge>{row.original.art_codeArticle}</Badge>;
        //     }
        // },
        {
            header: "Actions",
            cell: ({ row }) => (
            <div className="flex gap-2">
                <Button variant="outline" onClick={() => handleUpdate(row.original)} disabled={idToDelete === row.original.art_id}>
                    Modifier
                </Button>
                <Button variant="destructive" onClick={() => handleDelete(row.original)} disabled={idToDelete === row.original.art_id}>
                    <span className="flex items-center gap-2">
                        {idToDelete === row.original.art_id ? <Spinner className="size-4" /> : ""}
                        Supprimer
                    </span>
                </Button>
            </div>
            ),
        },
    ];

    const tableColumns = createColumns({columns});

    return(
        <div className="p-10">
            <div className="flex justify-between mb-2 p-6 items-center">
                <h2 className="font-bold text-2xl">Gestion des Articles</h2>
                <Button onClick={() => setIsOpen(true)}>Ajouter un article</Button>
            </div>
            
            {loading && <div className="px-6 flex justify-center mb-4">
                <Spinner className="size-6" />
            </div>}

            {<DataTable data={articlesSearch} columnsProps={tableColumns} handleSearch={(e)=>handleSearch(e)}/>}

            {/* CREATE */}
            <Modal open={isOpen} modalTitle="Nouveau article" onClose={() => setIsOpen(false)}>
                <ArticleForm
                    mode="create"
                    data={formData}
                    loading={loadingArticles}
                    onChange={setFormData}
                    onClose={() => setIsOpen(false)}
                    onSubmit={handleCreate}
                />
            </Modal>

            {/* EDIT */}
            <Modal open={editOpen} modalTitle="Modifier un article" onClose={() => setEditOpen(false)}>
                <ArticleForm
                    mode="edit"
                    data={formData}
                    loading={loadingArticles}
                    onChange={setFormData}
                    onClose={() => setEditOpen(false)}
                    onSubmit={handleUpdateSubmit}
                />
            </Modal>
        </div>
    )
}