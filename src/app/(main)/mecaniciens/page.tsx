"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { MapPin, Wrench, User } from "lucide-react";

import { Button } from "@/src/shared/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/src/shared/components/ui/select";
import { Spinner } from "@/src/shared/components/spinner";
import { errorAlert, successAlert } from "@/src/lib/alerts";
import { useClients } from "../mecanicien/shared/useClient.api";
import { useBases } from "../mecanicien/shared/useBases.api";

type MechanicPosition = {
  usr_id: string;
  usr_name: string;
  usr_clientId: string | null;
  usr_baseId: string | null;
  usr_client: { cli_name: string } | null;
  usr_base: { bas_location: string } | null;
};

export default function MecaniciensPage() {
  const { data: session } = useSession();
  const role = session?.user?.role ?? null;
  const currentUserId = session?.user?.id ?? null;

  const [mechanics, setMechanics] = useState<MechanicPosition[]>([]);
  const [loading, setLoading] = useState(true);

  const loadMechanics = () => {
    setLoading(true);
    fetch("/api/mechanics/position")
      .then((res) => res.json())
      .then((data) => setMechanics(Array.isArray(data) ? data : []))
      .catch((err) => console.error("Erreur chargement mécaniciens :", err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadMechanics();
  }, []);

  const currentMechanic = mechanics.find((m) => m.usr_id === currentUserId);

  return (
    <div className="bg-zinc-50 min-h-screen p-4 sm:p-8">
      <div className="bg-white rounded-2xl shadow-sm p-6 flex flex-col gap-6">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-blue-100 text-blue-700">
            <MapPin />
          </div>
          <h1 className="text-2xl font-bold">Localisation des mécaniciens</h1>
        </div>

        {role === "MECHANIC" && currentMechanic && (
          <PositionEditor
            mechanic={currentMechanic}
            onUpdated={loadMechanics}
          />
        )}

        <div className="divide-y">
          {loading && (
            <p className="text-sm text-zinc-500 py-4">Chargement...</p>
          )}

          {!loading && mechanics.length === 0 && (
            <p className="text-sm text-zinc-500 py-4">Aucun mécanicien</p>
          )}

          {!loading &&
            mechanics.map((m) => (
              <div
                key={m.usr_id}
                className={`flex items-center gap-3 py-1.5 ${
                  m.usr_id === currentUserId ? "bg-blue-50/60 -mx-2 px-2 rounded-lg" : ""
                }`}
              >
                <div className="flex items-center gap-2">
                  <div className="h-7 w-7 rounded-full bg-zinc-100 flex items-center justify-center text-zinc-600">
                    <User size={14} />
                  </div>
                  <span className="font-medium text-zinc-800 text-sm">
                    {m.usr_name}
                    {m.usr_id === currentUserId && (
                      <span className="ml-2 text-xs text-blue-600 font-normal">(vous)</span>
                    )}
                  </span>
                </div>

                {m.usr_client || m.usr_base ? (
                  <span className="ml-2 text-sm text-zinc-500">
                    <span className="text-zinc-400">— </span>
                    {m.usr_client?.cli_name ?? "—"}
                    {m.usr_base?.bas_location && (
                      <span className="text-zinc-400"> • {m.usr_base.bas_location}</span>
                    )}
                  </span>
                ) : (
                  <span className="ml-2 text-sm text-zinc-400 italic">Non affecté</span>
                )}
              </div>
            ))}
        </div>
      </div>
    </div>
  );
}

function PositionEditor({
  mechanic,
  onUpdated,
}: {
  mechanic: MechanicPosition;
  onUpdated: () => void;
}) {
  const { clients } = useClients();
  const [clientId, setClientId] = useState(mechanic.usr_clientId ?? "");
  const { bases } = useBases(clientId || undefined);
  const [baseId, setBaseId] = useState(mechanic.usr_baseId ?? "");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setClientId(mechanic.usr_clientId ?? "");
    setBaseId(mechanic.usr_baseId ?? "");
  }, [mechanic.usr_clientId, mechanic.usr_baseId]);

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await fetch("/api/mechanics/position", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ clientId: clientId || null, baseId: baseId || null }),
      });
      const data = await res.json();

      if (!res.ok) {
        errorAlert("Erreur", data?.error ?? "Échec de la mise à jour");
        return;
      }

      successAlert("Position mise à jour");
      onUpdated();
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="rounded-xl border border-blue-200 bg-blue-50/50 p-4 flex flex-col gap-3">
      <div className="flex items-center gap-2 text-sm font-medium text-blue-900">
        <Wrench size={16} />
        Ma position actuelle
      </div>

      <div className="flex flex-col sm:flex-row gap-2.5">
        <Select
          value={clientId || "none"}
          onValueChange={(value) => {
            const next = value === "none" ? "" : value;
            setClientId(next);
            setBaseId("");
          }}
        >
          <SelectTrigger className="w-full sm:w-[170px] sm:flex-none bg-white">
            <SelectValue placeholder="Client" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="none">Non affecté</SelectItem>
            {clients.map((c) => (
              <SelectItem key={c.id} value={c.id}>
                {c.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          value={baseId || "none"}
          onValueChange={(value) => setBaseId(value === "none" ? "" : value)}
          disabled={!clientId}
        >
          <SelectTrigger className="w-full sm:w-[170px] sm:flex-none bg-white">
            <SelectValue placeholder="Agence" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="none">Non précisée</SelectItem>
            {bases.map((b) => (
              <SelectItem key={b.id} value={b.id}>
                {b.location}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Button onClick={handleSave} disabled={saving} className="sm:w-auto">
          {saving ? <Spinner className="size-4" /> : "Enregistrer"}
        </Button>
      </div>
    </div>
  );
}
