"use client"

import { useEffect, useMemo, useState } from "react"
import { Button } from "@/src/shared/components/ui/button"
import { Input } from "@/src/shared/components/ui/input"
import { useBrandAndModelApi } from "./shared/hooks/useBrandAndModelApi"
import { toast } from "sonner"

export type Brand = {
  id: string
  name: string
}

export type Model = {
  id: string
  name: string
  brandId: string
}

export default function BrandsPage() {
  const [brands, setBrands] = useState<Brand[]>([]);
  const [models, setModels] = useState<Model[]>([]);
  const [selectedBrandId, setSelectedBrandId] = useState<string | null>(null);

  const [newBrand, setNewBrand] = useState("");
  const [newModel, setNewModel] = useState("");

  const [brandSearch, setBrandSearch] = useState("");
  const [modelSearch, setModelSearch] = useState("");

  const [deleteTarget, setDeleteTarget] = useState<{ type: "brand" | "model"; id: string } | null>(null);

  const {
    getAllBrands,
    getModelsByBrand,
    createBrand: apiCreateBrand,
    createModel: apiCreateModel,
    deleteBrand: apiDeleteBrand,
    deleteModel: apiDeleteModel,
  } = useBrandAndModelApi();

  // ================= LOAD =================
  const loadBrands = async () => setBrands(await getAllBrands());
  const loadModels = async (brandId: string) => setModels(await getModelsByBrand(brandId));

  useEffect(() => { loadBrands(); }, []);
  useEffect(() => {
    if (selectedBrandId) loadModels(selectedBrandId);
    else setModels([]);
  }, [selectedBrandId]);

  // ================= FILTER =================
  const filteredBrands = useMemo(
    () => brands.filter(b => b.name.toLowerCase().includes(brandSearch.toLowerCase())),
    [brands, brandSearch]
  );
  const filteredModels = useMemo(
    () => models.filter(m => m.name.toLowerCase().includes(modelSearch.toLowerCase())),
    [models, modelSearch]
  );

  // ================= CREATE =================
  const createBrand = async () => {
    try {
      await apiCreateBrand(newBrand);
      setNewBrand("");
      loadBrands();
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  const createModel = async () => {
    if (!selectedBrandId) return;
    try {
      await apiCreateModel(newModel, selectedBrandId);
      setNewModel("");
      loadModels(selectedBrandId);
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  // ================= DELETE =================
  const confirmDelete = async () => {
    if (!deleteTarget) return;
    try {
      if (deleteTarget.type === "brand") {
        await apiDeleteBrand(deleteTarget.id);
        if (deleteTarget.id === selectedBrandId) setSelectedBrandId(null);
        loadBrands();
      } else {
        await apiDeleteModel(deleteTarget.id);
        loadModels(selectedBrandId!);
      }
      setDeleteTarget(null);
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  // ================= UI =================
  return (
    <div className="text-sm grid grid-cols-1 lg:grid-cols-2 gap-10">

      {/* ===== MARQUES ===== */}
      <div className="space-y-4">
        <h1 className="text-base font-semibold">Marques</h1>

        <Input
          className="h-9 text-sm"
          placeholder="Rechercher..."
          value={brandSearch}
          onChange={(e) => setBrandSearch(e.target.value)}
        />

        <div className="flex gap-2">
          <Input
            className="h-9 text-sm"
            placeholder="Nouvelle marque"
            value={newBrand}
            onChange={(e) => setNewBrand(e.target.value)}
          />
          <Button size="sm" onClick={createBrand}>
            Ajouter
          </Button>
        </div>

        <div className="border rounded-md divide-y max-h-[400px] overflow-auto">
          {filteredBrands.map((b) => (
            <div
              key={b.id}
              className={`flex justify-between items-center px-3 py-2 ${
                selectedBrandId === b.id ? "bg-muted" : ""
              }`}
              onClick={() => setSelectedBrandId(b.id)}
            >
              <span className="cursor-pointer">{b.name}</span>

              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  className="text-xs"
                >
                  Modifier
                </Button>

                <Button
                  size="sm"
                  variant="destructive"
                  className="text-xs"
                  onClick={(e) => {
                    e.stopPropagation()
                    setDeleteTarget({ type: "brand", id: b.id })
                  }}
                >
                  Supprimer
                </Button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ===== MODELES ===== */}
      <div className="space-y-4">
        <h1 className="text-base font-semibold">Modèles</h1>

        {!selectedBrandId && (
          <p className="text-muted-foreground text-xs">
            Sélectionnez une marque
          </p>
        )}

        {selectedBrandId && (
          <>
            <Input
              className="h-9 text-sm"
              placeholder="Rechercher..."
              value={modelSearch}
              onChange={(e) => setModelSearch(e.target.value)}
            />

            <div className="flex gap-2">
              <Input
                className="h-9 text-sm"
                placeholder="Nouveau modèle"
                value={newModel}
                onChange={(e) => setNewModel(e.target.value)}
              />
              <Button size="sm" onClick={createModel}>
                Ajouter
              </Button>
            </div>

            <div className="border rounded-md divide-y max-h-[400px] overflow-auto">
              {filteredModels.map((m) => (
                <div
                  key={m.id}
                  className="flex justify-between items-center px-3 py-2"
                >
                  <span>{m.name}</span>

                  <div className="flex gap-2">
                    <Button size="sm" variant="outline" className="text-xs">
                      Modifier
                    </Button>

                    <Button
                      size="sm"
                      variant="destructive"
                      className="text-xs"
                      onClick={() =>
                        setDeleteTarget({ type: "model", id: m.id })
                      }
                    >
                      Supprimer
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      {/* ===== MODAL CONFIRMATION ===== */}
      {deleteTarget && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl w-[420px] p-8 text-center space-y-6 shadow-xl">

            {/* Icône */}
            <div className="flex justify-center">
              <div className="w-20 h-20 rounded-full border-4 border-orange-300 flex items-center justify-center">
                <span className="text-orange-400 text-4xl font-bold">!</span>
              </div>
            </div>

            {/* Titre */}
            <h2 className="text-2xl font-semibold text-gray-700">
              Supprimer{" "}
              {deleteTarget.type === "brand" ? "la marque" : "le modèle"}
            </h2>

            {/* Texte */}
            <p className="text-gray-500">
              Voulez-vous vraiment supprimer cet élément ?
            </p>

            {/* Boutons */}
            <div className="flex justify-center gap-4 pt-4">
              <Button
                className="bg-purple-600 hover:bg-purple-700 text-white px-6"
                onClick={confirmDelete}
              >
                Oui
              </Button>

              <Button
                className="bg-gray-500 hover:bg-gray-600 text-white px-6"
                onClick={() => setDeleteTarget(null)}
              >
                Non
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
