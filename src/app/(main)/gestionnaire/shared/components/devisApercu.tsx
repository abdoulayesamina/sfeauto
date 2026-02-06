import { useEffect, useState } from "react";
import { useDevisApi } from "../hooks/useDevisApi.api";
import { Button } from "@/src/shared/components/ui/button";
import { Devis } from "@/src/utils/types/devis";
import { Article } from "@/src/utils/types/article";

type DevisApercuProps = {
  devisId: number;
  onClose: ()=>void;
};

export function DevisApercu({ devisId, onClose }: DevisApercuProps) {
    
    const { getDevisById } = useDevisApi();

    const [devis, setDevis] = useState<Devis | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    function imprimerDiv(): void {
        window.print();
    }

    useEffect(() => {
        async function loadDevis() {
             
            setLoading(true);
            setError(null);

            try {
                const res : any = await getDevisById(devisId);

                if (res.ok && res.data) {
                    setDevis(res.data.devis);
                    console.log("Devis data : ", res.data);
                }
            } catch {
                setError("Impossible de charger le devis");
            } finally {
                setLoading(false);
            }
        }

        if (devisId) loadDevis();
    }, [devisId]);

    useEffect(()=>{
        console.log("Devis recup : ", devis)
    },[devis])

    if (loading) {
        return <div className="p-6 text-center">Chargement du devis…</div>;
    }

    if (error) {
        return <div className="p-6 text-red-600">{error}</div>;
    }

    if (!devis) return null;

    return (
        <div className="max-w-[900px]">
            {devis ? 
                <div id="imprime" className="print:block bg-white text-sm text-gray-800 p-6 w-full max-w-5xl mx-auto">
                    {/* ===== EN-TÊTE ===== */}
                    <div className="flex flex-col mb-6">
                        {/* Garage */}
                        <div>
                            <h2 className="font-bold text-lg">SFEAUTO</h2>
                            <p>5 RUE FERDINAND DE LESSEPS</p>
                            <p>95190 GOUSSAINVILLE</p>
                            <p>Tél : 01 39 35 74 22</p>
                        </div>

                        {/* Client */}
                        <div className="flex justify-end">
                            <div className="relative p-3 w-full max-w-[50%]">
                                <div>
                                    <div className="w-[10px] h-[10px] border-black border-l-[2px] border-t-[2px] absolute top-0 left-0"></div>
                                    <div className="w-[10px] h-[10px] border-black border-r-[2px] border-t-[2px] absolute top-0 right-0"></div>
                                    <div className="w-[10px] h-[10px] border-black border-l-[2px] border-b-[2px] absolute bottom-0 left-0"></div>
                                    <div className="w-[10px] h-[10px] border-black border-r-[2px] border-b-[2px] absolute bottom-0 right-0"></div>
                                </div>
                                <p className="font-semibold uppercase">
                                    {devis.client?.name ?? "Client"}
                                </p>
                                <p>{devis.client?.email}</p>
                                <p>{devis.client?.phone}</p>
                            </div>
                        </div>
                    </div>

                    {/* ===== INFOS DEVIS ===== */}
                    <div className="pt-3 mb-1 grid grid-cols-2">
                        <div className="border">
                            <p className="font-semibold bg-[#000033] text-white text-center p-1">
                                DEVIS N° {devis.dev_numdevis}
                            </p>
                            <p className="text-end p-1 pr-4">
                                Date : {new Date(devis?.dev_datecreation ?? "").toLocaleDateString()}
                            </p>
                        </div>

                        <div className="border flex flex-col p-1">
                            <div className="grid grid-cols-2 gap-2">
                                <p>Client : {devis?.client?.cli_numClient ?? "..."}</p>
                                <p>TVA intra : {devis?.client?.cli_tvaIntraCommunautaire ?? "..."}</p>
                            </div>
                            <div className="grid grid-cols-2 gap-2">
                                <p>Règlement : —</p>
                                <p>Échéance : —</p>
                            </div>
                        </div>

                        <div>
                        </div>
                    </div>

                    {/* ===== VEHICULE ===== */}
                    <div className="border mb-2">
                        <div className="bg-[#000033] text-white p-1">
                            Véhicule
                        </div>
                        <div className="mb-6 grid grid-cols-2 gap-4">
                            <div>
                                <p><span className="font-semibold">Immatriculation :</span> {devis.vehicle?.licensePlate}</p>
                                <p><span className="font-semibold">Marque :</span> {devis.vehicle?.brand}</p>
                                <p><span className="font-semibold">Modèle :</span> {devis.vehicle?.model}</p>
                            </div>

                            <div>
                                <p><span className="font-semibold">Couleur :</span> {devis.vehicle?.color}</p>
                                <p><span className="font-semibold">Kilométrage :</span> {devis.vehicle?.version}</p> {/** <---- kilometrage */}
                            </div>
                        </div>
                    </div>

                    {/* ===== LIGNES ARTICLES ===== */}
                    <div className="overflow-hidden border-b-[2px] border-b-black">
                        {/* Header */}
                        <div className="grid grid-cols-12 font-semibold px-3 py-2 bg-[#000033] text-white">
                            <div className="col-span-2 text-center">Référence</div>
                            <div className="col-span-4 text-center">Désignation</div>
                            <div className="col-span-2 text-center">Qté/Temps</div>
                            <div className="col-span-2 text-center">Prix unit</div>
                            <div className="col-span-2 text-center">Montant HT</div>
                        </div>

                        {/* Lignes */}
                        {devis.articles?.map((line: any, idx: number) => (
                            <div
                                key={idx}
                                className="grid grid-cols-12"
                            >
                                <div className="col-span-2 bg-[#ffcc99] p-1 border-x-[2px] border-black">
                                    {line.dea_art_reference ?? 1}
                                </div>

                                <div className="col-span-4 p-1 border-r-[2px] border-black">
                                    {line.article?.art_name}
                                </div>

                                <div className="col-span-2 text-right p-1 bg-[#ffcc99] border-r-[2px] border-black">
                                    {line.dea_quantite ?? 1}
                                </div>

                                <div className="col-span-2 text-right p-1 border-r-[2px] border-black">
                                    {line.dea_prixunitaire} €
                                </div>

                                <div className="col-span-2 text-right p-1 bg-[#ffcc99] border-r-[2px] border-black">
                                    {line.dea_prixtotalht} €
                                </div>

                            </div>
                        ))}
                    </div>
                    <div className="border-x p-1 text-[12px] border-x-[2px] border-gray-400">
                        Le garage vous remercie de votre confiance
                    </div>
                    
                    {/* ===== TOTAUX =====*/}
                    <div className="grid grid-cols-[250px_1fr] gap-2">
                        <div className="flex flex-col">
                            <div className="grid grid-cols-3 text-[12px] bg-[#000033] text-white">
                                <div className=" text-center">Libellé</div>
                                <div className=" text-center">Qté/Temps</div>
                                <div className=" text-center">Montant HT</div>
                            </div>
                            <table className="border-collapse w-full flex-1">
                                <tr>
                                    <td className="border border-black">......</td>
                                    <td className="border border-black">......</td>
                                    <td className="border border-black">......</td>
                                </tr>
                            </table>
                        </div>
                        <div className="grid grid-cols-[1fr_130px]">
                            <div>
                                <div className="grid grid-cols-4 text-[12px] bg-[#000033] text-white">
                                    <div className=" text-center">T</div>
                                    <div className=" text-center">Base H.T</div>
                                    <div className=" text-center">Tva</div>
                                    <div className=" text-center">Mt.Tva</div>
                                </div>
                                <table className="border-collapse w-full min-h-[80px]">
                                    <tr>
                                        <td className="border border-black">......</td>
                                        <td className="border border-black">{devis.dev_totalht}</td>
                                        <td className="border border-black">{devis.dev_tva}</td>
                                        <td className="border-y border-black">{devis.dev_totaltva}</td>
                                    </tr>
                                </table>
                            </div>
                            <div>
                                <div className="flex flex-col">
                                    <span className="bg-[#000033] text-white text-center">Total HT</span>
                                    <span className="text-end p-2 border border-black">{devis.dev_totalht} €</span>
                                </div>
                                <div className="flex flex-col">
                                    <span className="bg-[#000033] text-white text-center">TVA</span>
                                    <span className="text-end p-2 border border-black">{devis.dev_totaltva} €</span>
                                </div>
                                <div className="flex flex-col">
                                    <span className="bg-[#000033] text-white text-center">NET À PAYER TTC</span>
                                    <span className="text-center font-bold p-2 border border-black">{devis.dev_totalttc} €</span>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="text-sm mt-2 text-[11px]">
                        Lorem ipsum dolor, sit amet consectetur adipisicing elit. Dolores doloremque officia autem atque eius. Maxime quidem at quis nemo odit, eligendi doloremque aut, facere repudiandae neque voluptatum laborum sequi fugit.
                    </div>
                    <div className="mt-6 border-t pt-4 flex justify-end no-print">
                        <div className="flex gap-2 w-full max-w-[50%]">
                            <Button variant={"outline"} onClick={()=>imprimerDiv()} className="w-full p-4 text-lg " >Imprimer</Button>
                            <Button onClick={()=>{onClose(); setDevis(null)}} className="w-full p-4 text-lg ">Fermer</Button>
                        </div>
                    </div>
                </div>
                : <div className="border shadow p-6 italic text-gray-500 text-sm">Pas de devis</div>
            }
        </div>
    );
}















/**
 * {
    "dev_id": 9,
    "dev_cli_id": "cmjr2fv850004kwficf1hjwuv",
    "dev_veh_id": "cmky3uibp0000jcfij7kvpvlb",
    "dev_invoice_id": "cml6mgnaz00034owfpbp0ooyv",
    "dev_user": "cmk6rgnuc0001qwwf573net4d",
    "dev_adressefacturation": null,
    "dev_numdevis": "DV-2026-353819",
    "dev_datecreation": "2026-02-03T13:55:55.467Z",
    "dev_totalht": "1800",
    "dev_totaltva": "360",
    "dev_totalttc": "2160",
    "dev_tva": "20",
    "dev_supprimee": false,
    "dev_accordNumber": null,
    "dev_dateAccord": null,
    "client": {
        "id": "cmjr2fv850004kwficf1hjwuv",
        "name": "Enterprise",
        "email": "flotte@enterprise.fr",
        "phone": "+33 1 70 36 03 12",
        "cli_adresseFacturation": null,
        "cli_numClient": null,
        "cli_tvaIntraCommunautaire": null,
        "createdAt": "2025-12-29T11:19:20.516Z",
        "updatedAt": "2026-01-15T17:11:24.648Z"
    },
    "vehicle": {
        "id": "cmky3uibp0000jcfij7kvpvlb",
        "licensePlate": "Thoman",
        "model": "Megane",
        "brand": "Renault",
        "year": 2026,
        "color": "rouge g",
        "firstRegistrationDate": "2026-01-27T00:00:00.000Z",
        "energy": "ESSENCE",
        "doorsCount": 4,
        "bodyType": "CABRIOLET",
        "realPowerHp": 124,
        "fiscalPowerCv": 5,
        "gearboxType": "BVM",
        "version": "122",
        "registrationCardDate": "2026-01-20T00:00:00.000Z",
        "entryDate": "2026-01-28T14:12:48.826Z",
        "exitDate": null,
        "createdAt": "2026-01-28T14:12:48.842Z",
        "updatedAt": "2026-01-28T14:12:48.842Z",
        "clientId": "cmjr2fv850004kwficf1hjwuv",
        "baseId": "cmjr2g264000gkwfiv2po0hik",
        "handledById": "cmk3twnnz0000s0fi89s42a4i"
    },
    "invoice": {
        "id": "cml6mgnaz00034owfpbp0ooyv",
        "accordNumber": null,
        "dateOfConfirmation": "2026-02-02T00:00:00.000Z",
        "invoiceConfirmed": true,
        "status": "WAITING_FOR_PARTS",
        "statusUpdatedAt": "2026-02-03T13:16:04.474Z",
        "workDescription": "ssss",
        "didOrderParts": true,
        "ordersDetails": "sss",
        "comments": "sss",
        "createdAt": "2026-02-03T13:16:04.474Z",
        "updatedAt": "2026-02-03T13:16:04.474Z",
        "vehicleId": "cmky3uibp0000jcfij7kvpvlb",
        "handledById": "cmk6rgnuc0001qwwf573net4d"
    },
    "user": {
        "id": "cmk6rgnuc0001qwwf573net4d",
        "email": "gest@gestcars.com",
        "name": "David",
        "role": "MANAGER",
        "password": "$2b$10$As4C2Q2U6ChybDfv0u9xv.UMamWdaEMlMnbuOb9ZDBsiGwQjAKEPa",
        "isSystemAccount": false,
        "createdAt": "2026-01-09T10:56:20.694Z",
        "updatedAt": "2026-01-09T10:56:20.694Z",
        "clientId": null,
        "baseId": null
    },
    "articles": [
        {
            "dea_id": 12,
            "dea_dev_id": 9,
            "dea_art_id": 2,
            "dea_art_designation": "Article 1",
            "dea_art_reference": "ssssssdede",
            "dea_prixunitaire": "1800",
            "dea_quantite": 1,
            "dea_tva": "20",
            "dea_pourcentageremise": 10,
            "dea_prixtotalht": "1800",
            "article": {
                "art_id": 2,
                "art_name": "Article 1",
                "art_price": 2000,
                "art_collectionId": 1,
                "collection": {
                    "col_id": 1,
                    "col_name": "Pneumatique 1",
                    "col_familleId": 1
                }
            }
        }
    ]
}
 */