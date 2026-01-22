"use client";

import { createColumns, DataTable } from "@/src/shared/components/data-table";
import { Modal } from "@/src/shared/components/modal";
import { Spinner } from "@/src/shared/components/spinner";
import { Button } from "@/src/shared/components/ui/button";
import { useEffect, useState } from "react";
import { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/src/shared/components/ui/badge";
import { ArticleForm } from "./forms/article-form";

export default function ArticlesPage() {
    const [loading, setLoading] = useState(false);
    const [isOpen, setIsOpen] = useState(false);
    const [editOpen, setEditOpen] = useState(false);
    const [formData, setFormData] = useState<any>({});
    const [articlesSearch, setArticlesSearch] = useState<any[]>([]);
    const [articles, setArticles] = useState<any[]>([]);
    const [collections, setCollections] = useState<any[]>([]);

    useEffect(() => {
        setLoading(true);
        setTimeout(() => setLoading(false), 1000);
        setCollections([
            { id: 1, name: "Collection A", familleId: 1 },
            { id: 2, name: "Collection B", familleId: 2 },
            { id: 3, name: "Collection C", familleId: 3 },
        ]);
        setArticles([
            { id: 1, name: "Article A", collectionId: 1 },
            { id: 2, name: "Article B", collectionId: 2 },
            { id: 3, name: "Article C", collectionId: 3 },
        ]);
    }, []);

    useEffect(() => {
        setArticlesSearch(articles);
    },[articles]);

    const columns: ColumnDef<any>[] = [
        {
            accessorKey: "name",
            header: "Nom",
        },
        {
            accessorKey: "collectionId",
            header: "Collection",
            cell: ({ row }) => {
                const collection = collections.find(c => c.id === row.original.collectionId);
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

    const handleSearch = (e: string) => {
        const filtered = articles.filter((article) =>
            article.name.toLowerCase().includes(e.toLowerCase())
        );
        setArticlesSearch(filtered);
    }
    const handleCreate = async () => {
        debugger
        let newArticles = [...articles, {id: articles.length + 1, name: formData.name, collectionId: Number(formData.collectionId)}]
        setArticles(newArticles)
        setIsOpen(false)
    }
    const handleUpdate = async (data: any) => {
        setFormData(data)
        setEditOpen(true)
    }
    const handleUpdateSubmit = async () => {
        debugger;
        let updated = articles.map(a =>
            a.id === formData.id
            ? {
                ...a,
                name: formData.name,
                collectionId: Number(formData.collectionId),
                }
            : a
        );
        setArticles(updated)
        setFormData({})
        setEditOpen(false)
    }

    const handleDelete = async (data: any) => {
        if(!confirm(`Supprimer l'article ${data.name} ?`)) return;
        let filteredArticles = articles.filter(a=>a.id !== data.id)
        setArticles(filteredArticles)
    }

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