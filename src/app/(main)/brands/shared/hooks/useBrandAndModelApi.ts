import { Brand, Model } from "../../page";

export function useBrandAndModelApi() {

    // ================= LOAD =================
    const getAllBrands = async (): Promise<Brand[]> => {
        const res = await fetch("/api/brands");
        if (!res.ok) throw new Error("Erreur lors du chargement des brands");
        return res.json();
    };

    const getModelsByBrand = async (brandId: string): Promise<Model[]> => {
        const res = await fetch(`/api/models?brandId=${brandId}`);
        if (!res.ok) throw new Error("Erreur lors du chargement des modèles");
        return res.json();
    };

    // ================= GET BY ID =================
    const getBrandById = async (id: string): Promise<Brand> => {
        const res = await fetch(`/api/brands/${id}`);
        if (!res.ok) {
            const data = await res.json().catch(() => ({}));
            throw new Error(data.error || "Erreur lors de la récupération de la marque");
        }
        return res.json();
    };

    const getModelById = async (id: string): Promise<Model> => {
        const res = await fetch(`/api/models/${id}`);
        if (!res.ok) {
            const data = await res.json().catch(() => ({}));
            throw new Error(data.error || "Erreur lors de la récupération du modèle");
        }
        return res.json();
    };

    // ================= CREATE =================
    const createBrand = async (name: string) => {
        if (!name.trim()) return;
        const res = await fetch("/api/brands", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ name }),
        });
        if (!res.ok) {
            const data = await res.json();
            throw new Error(data.error || "Erreur lors de la création de la brand");
        }
    };

    const createModel = async (name: string, brandId: string) => {
        if (!name.trim()) return;
        const res = await fetch("/api/models", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ name, brandId }),
        });
        if (!res.ok) {
            const data = await res.json();
            throw new Error(data.error || "Erreur lors de la création du model");
        }
    };

    // ================= DELETE =================
    const deleteBrand = async (id: string) => {
        const res = await fetch(`/api/brands/${id}`, { method: "DELETE" });
        if (!res.ok) {
            const data = await res.json();
            throw new Error(data.error || "Erreur lors de la suppression de la brand");
        }
    };

    const deleteModel = async (id: string) => {
        const res = await fetch(`/api/models/${id}`, { method: "DELETE" });
        if (!res.ok) {
            const data = await res.json();
            throw new Error(data.error || "Erreur lors de la suppression du model");
        }
    };

    return {
        getAllBrands,
        getModelsByBrand,
        createBrand,
        createModel,
        deleteBrand,
        deleteModel,
        getBrandById,
        getModelById,
    };
}