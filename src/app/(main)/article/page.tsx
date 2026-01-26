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
import { errorAlert, successAlert } from "@/src/lib/alerts";
import { Article } from "@/src/utils/types/article";
import { useCollectionApi } from "../collection/shared/useCollection.api";

export default function ArticlesPage() {
    const { getArticles, createArticle, updateArticle, deleteArticle } = useArticleApi();
    const {getAllCollections} = useCollectionApi();

    const [loading, setLoading] = useState(false);
    const [isOpen, setIsOpen] = useState(false);
    const [editOpen, setEditOpen] = useState(false);
    const [formData, setFormData] = useState<any>({});
    const [articlesSearch, setArticlesSearch] = useState<any[]>([]);
    const [articles, setArticles] = useState<Article[]>([]);
    const [collections, setCollections] = useState<any[]>([]);

    const loadArticles = async () => {
        try {
            const data = await getArticles();
            setArticles(data);
            const CollectionsData = await getAllCollections();
            setCollections(CollectionsData);
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
                errorAlert("Erreur", e.message);
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
        let newArticles : Article = {art_name: formData.name, art_price: formData.price, art_collectionId: Number(formData.collectionId)};
        try{
            await createArticle(newArticles);
            successAlert("Article créé"," L'article a été créé avec succès.");
            setArticles([...articles, newArticles]);
            setFormData({});
        }catch(e:any){
            errorAlert("Erreur", e.message);
        }
        setIsOpen(false)
    }
    const handleUpdate = async (data: any) => {
        setFormData(data)
        setEditOpen(true)
    }
    const handleUpdateSubmit = async () => {
        let updated : Article = {art_id: formData.art_id, art_name: formData.name, art_price: formData.price, art_collectionId: Number(formData.collectionId)};
        try{
            await updateArticle(updated.art_id ?? 0, updated);
            successAlert("Article mis à jour"," L'article a été mis à jour avec succès.");
        }catch(e:any){
            errorAlert("Erreur", e.message);
            return;
        }
        setArticles(articles.map(a => a.art_id === updated.art_id ? updated : a));
        setFormData({})
        setEditOpen(false)
    }
    
    
    const handleDelete = async (data: Article) => {
        if(!confirm(`Supprimer l'article ${data.art_name} ?`)) return;

        try{
            await deleteArticle(data.art_id ?? 0);
            successAlert("Article supprimé"," L'article a été supprimé avec succès.");
        }catch(e:any){
            errorAlert("Erreur", e.message);
            return;
        }
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
                const collection = collections.find(c => c.id === row.original.art_collectionId);
                return <Badge>{collection ? collection.name : "N/A"}</Badge>;
            }
        },
        {
            header: "Actions",
            cell: ({ row }) => (
            <div className="flex gap-2">
                <Button variant="outline" onClick={() => handleUpdate(row.original)}>
                Modifier
                </Button>
                <Button variant="destructive" onClick={() => handleDelete(row.original)}>
                Supprimer
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
                    onChange={setFormData}
                    onClose={() => setEditOpen(false)}
                    onSubmit={handleUpdateSubmit}
                />
            </Modal>
        </div>
    )
}