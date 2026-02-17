"use client";

import { useEffect, useState } from "react";
import { ColumnDef } from "@tanstack/react-table";
import { createColumns, DataTable } from "@/src/shared/components/data-table";
import { Spinner } from "@/src/shared/components/spinner";
import { Button } from "@/src/shared/components/ui/button";
import { Badge } from "@/src/shared/components/ui/badge";
import { Pencil, Eye, CheckCircle, Lock } from "lucide-react";
import { errorAlert } from "@/src/lib/alerts";

import { useDevisApi } from "./shared/hooks/useDevisApi.api";
import { EditDevisModal } from "../gestionnaire/shared/components/edit-devis/EditDevisModal";
import { ValidateDevisModal } from "../gestionnaire/shared/components/ValidateDevisModal";
import { Modal } from "@/src/shared/components/modal";
import { DevisApercu } from "../gestionnaire/shared/components/devisApercu";
import { toast } from "sonner";

function formatDate(d?: string | Date | null) {
  if (!d) return "—";
  const dt = new Date(d);
  if (isNaN(dt.getTime())) return "—";
  return dt.toLocaleDateString("fr-FR");
}

function formatMoney(v: any) {
  const n = Number(v);
  if (!Number.isFinite(n)) return "0 F";
  return `${n.toLocaleString("fr-FR")} F`;
}

export default function DevisPage() {
  const { listDevis } = useDevisApi();

  const [loading, setLoading] = useState(false);
  const [rows, setRows] = useState<any[]>([]);
  const [rowsSearch, setRowsSearch] = useState<any[]>([]);

  const [selectedDevis, setSelectedDevis] = useState<any>(null);
  const [editOpen, setEditOpen] = useState(false);

  const [validateOpen, setValidateOpen] = useState(false);
  const [devisToValidate, setDevisToValidate] = useState<any>(null);

  const [openApercu,setOpenApercu] = useState(false);
  const [targetDevisIdForApercu, setTargetDevisIdForApercu ] = useState<any>(null);

  const handleViewDevisApercu = (devis:any) =>{
    setOpenApercu(true)
    setTargetDevisIdForApercu(devis.dev_id);
  }

  const load = async () => {
    setLoading(true);
    try {
      const res = await listDevis();
      if (!res.ok) throw new Error(res.error || "Erreur chargement devis");

      const list = res.data?.devis ?? [];

      setRows(list);
      setRowsSearch(list);
    } catch (e: any) {
      toast.error("Erreur", e.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSearch = (q: string) => {
    const s = q.toLowerCase().trim();

    if (!s) {
      setRowsSearch(rows);
      return;
    }

    const filtered = rows.filter((d) => {
      const num = String(d?.dev_numdevis ?? "").toLowerCase();
      const client = String(d?.client?.name ?? "").toLowerCase();
      const plate = String(d?.vehicle?.licensePlate ?? "").toLowerCase();
      const brand = String(d?.vehicle?.brand ?? "").toLowerCase();
      const model = String(d?.vehicle?.model ?? "").toLowerCase();
      const desc = String(d?.invoice?.workDescription ?? "").toLowerCase();
      const accord = String(d?.dev_accordNumber ?? "").toLowerCase();

      return (
        num.includes(s) ||
        client.includes(s) ||
        plate.includes(s) ||
        brand.includes(s) ||
        model.includes(s) ||
        desc.includes(s) ||
        accord.includes(s)
      );
    });

    setRowsSearch(filtered);
  };

  const columns: ColumnDef<any>[] = [
    {
      accessorKey: "dev_numdevis",
      header: "N° Devis",
      cell: ({ row }) => <span className="font-semibold">{row.original.dev_numdevis}</span>,
    },
    {
      accessorKey: "client",
      header: "Client",
      cell: ({ row }) => row.original?.client?.name ?? "—",
    },
    {
      accessorKey: "vehicle",
      header: "Véhicule",
      cell: ({ row }) => {
        const v = row.original?.vehicle;
        if (!v) return "—";
        const brandModel = `${v.brand?.name ?? ""} ${v.model?.name ?? ""}`.trim();
        return (
          <span>
            <span className="font-medium">{v.licensePlate}</span>
            {brandModel ? ` — ${brandModel}` : ""}
          </span>
        );
      },
    },
    {
      accessorKey: "invoice",
      header: "Intervention",
      cell: ({ row }) => row.original?.invoice?.workDescription ?? "—",
    },
    {
      accessorKey: "dev_totalttc",
      header: "Total TTC",
      cell: ({ row }) => <span className="font-semibold">{formatMoney(row.original?.dev_totalttc)}</span>,
    },
    {
      accessorKey: "dev_datecreation",
      header: "Créé le",
      cell: ({ row }) => formatDate(row.original?.dev_datecreation),
    },
    {
      header: "Statut",
      cell: ({ row }) => {
        const d = row.original;

        if (d?.dev_accordNumber) {
          return (
            <Badge className="bg-green-600 text-white flex items-center gap-1">
              <CheckCircle size={14} />
              Validé
            </Badge>
          );
        }

        return (
          <Badge variant="secondary" className="flex items-center gap-1">
            <Lock size={14} />
            En attente
          </Badge>
        );
      },
    },
    {
      header: "Actions",
      cell: ({ row }) => {
        const d = row.original;
        const isValidated = !!d?.dev_accordNumber;

        return (
          <div className="flex gap-2 flex-wrap">
            <Button
              variant="outline"
              onClick={() => {
                setSelectedDevis(d);
                setEditOpen(true);
              }}
            >
              <span className="flex items-center gap-2">
                <Pencil size={16} />
                Modifier
              </span>
            </Button>

            {!isValidated && (
              <Button
                onClick={() => {
                  setDevisToValidate(d);
                  setValidateOpen(true);
                }}
              >
                <span className="flex items-center gap-2">
                  <CheckCircle size={16} />
                  Valider
                </span>
              </Button>
            )}

            <Button variant="outline" onClick={()=>handleViewDevisApercu(d)}>
              <span className="flex items-center gap-2">
                <Eye size={16} />
                Voir
              </span>
            </Button>
          </div>
        );
      },
    },
  ];

  const tableColumns = createColumns({ columns });

  return (
    <div className="p-10">
      <div className="flex justify-between mb-2 p-6 items-center">
        <h2 className="font-bold text-2xl">Liste des devis</h2>
      </div>

      {loading && (
        <div className="px-6 flex justify-center mb-4">
          <Spinner className="size-6" />
        </div>
      )}

      <DataTable
        data={rowsSearch}
        columnsProps={tableColumns}
        handleSearch={(e) => handleSearch(e)}
      />

      {/* EDIT */}
      {selectedDevis && (
        <EditDevisModal
          open={editOpen}
          onClose={() => setEditOpen(false)}
          devis={selectedDevis}
          onUpdated={(updated) => {
            const d = updated?.devis ?? updated;

            setRows((prev) => prev.map((x) => (x.dev_id === d.dev_id ? d : x)));
            setRowsSearch((prev) => prev.map((x) => (x.dev_id === d.dev_id ? d : x)));
          }}
        />
      )}

      {/* VALIDATE */}
      {devisToValidate && (
        <ValidateDevisModal
          open={validateOpen}
          onClose={() => setValidateOpen(false)}
          devis={devisToValidate}
          onValidated={(updated) => {
            const d = updated?.devis ?? updated;

            setRows((prev) => prev.map((x) => (x.dev_id === d.dev_id ? d : x)));
            setRowsSearch((prev) => prev.map((x) => (x.dev_id === d.dev_id ? d : x)));
          }}
        />
      )}

      <Modal open={openApercu} onClose={()=>setOpenApercu(false)} modalDescription="Aperçu du devis">
        <DevisApercu devisId={targetDevisIdForApercu} onClose={()=>setOpenApercu(false)} />
      </Modal>
    </div>
  );
}
