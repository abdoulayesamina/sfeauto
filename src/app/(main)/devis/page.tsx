"use client";

import { useEffect, useState } from "react";
import { ColumnDef } from "@tanstack/react-table";
import { createColumns, DataTable } from "@/src/shared/components/data-table";
import { Spinner } from "@/src/shared/components/spinner";
import { Button } from "@/src/shared/components/ui/button";
import { Pencil, Eye } from "lucide-react";
import { useDevisApi } from "./shared/hooks/useDevisApi.api";
import { EditDevisModal } from "../gestionnaire/shared/components/edit-devis/EditDevisModal";
import { Modal } from "@/src/shared/components/modal";
import { DevisApercu } from "../gestionnaire/shared/components/devisApercu";
import { toast } from "sonner";
import { formatLicensePlate } from "@/src/utils/formatters"

function formatDate(d?: string | Date | null) {
  if (!d) return "—";
  const dt = new Date(d);
  if (isNaN(dt.getTime())) return "—";
  return dt.toLocaleDateString("fr-FR");
}

function formatMoney(v: any) {
  const n = Number(v);
  if (!Number.isFinite(n)) return "0 €";

  return new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency: "EUR",
  }).format(n);
}

export default function DevisPage() {
  const { listDevis } = useDevisApi();

  const [loading, setLoading] = useState(false);
  const [rows, setRows] = useState<any[]>([]);
  const [rowsSearch, setRowsSearch] = useState<any[]>([]);

  const [selectedDevis, setSelectedDevis] = useState<any>(null);
  const [editOpen, setEditOpen] = useState(false);

  const [openApercu, setOpenApercu] = useState(false);
  const [targetDevisIdForApercu, setTargetDevisIdForApercu] = useState<any>(null);

  const handleViewDevisApercu = (devis: any) => {
    setOpenApercu(true);
    setTargetDevisIdForApercu(devis.dev_id);
  };

  const load = async () => {
    setLoading(true);
    try {
      const res = await listDevis();
      if (!res.ok) throw new Error(res.error || "Erreur chargement devis");

      const list = res.data?.devis ?? [];

      setRows(list);
      setRowsSearch(list);
    } catch (e: any) {
      toast.error("Erreur", {
        description: e.message,
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
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
      const brand = String(d?.vehicle?.brand?.name ?? "").toLowerCase();
      const model = String(d?.vehicle?.model?.name ?? "").toLowerCase();
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
      cell: ({ row }) => (
        <span className="font-semibold">{row.original.dev_numdevis}</span>
      ),
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
            {/* <span className="font-medium">{v.licensePlate}</span> */}
            <span className="font-medium">
              {formatLicensePlate(v.licensePlate || "")}
            </span>
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
      cell: ({ row }) => (
        <span className="font-semibold">
          {formatMoney(row.original?.dev_totalttc)}
        </span>
      ),
    },
    {
      accessorKey: "dev_datecreation",
      header: "Créé le",
      cell: ({ row }) => formatDate(row.original?.dev_datecreation),
    },
    {
      header: "Actions",
      cell: ({ row }) => {
        const d = row.original;

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

            <Button variant="outline" onClick={() => handleViewDevisApercu(d)}>
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

      {selectedDevis && (
        <EditDevisModal
          open={editOpen}
          onClose={() => setEditOpen(false)}
          devis={selectedDevis}
          onUpdated={(updated) => {
            const d = updated?.devis ?? updated;

            setRows((prev) => prev.map((x) => (x.dev_id === d.dev_id ? d : x)));
            setRowsSearch((prev) =>
              prev.map((x) => (x.dev_id === d.dev_id ? d : x))
            );
          }}
        />
      )}

      <Modal open={openApercu} onClose={() => setOpenApercu(false)} modalTitle="">
        <DevisApercu
          devisId={targetDevisIdForApercu}
          onClose={() => setOpenApercu(false)}
        />
      </Modal>
    </div>
  );
}