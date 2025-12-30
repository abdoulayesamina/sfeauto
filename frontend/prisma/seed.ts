import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("🧹 Cleaning database...");

  // Clear all existing data in correct order (respecting foreign keys)
  await prisma.statusHistory.deleteMany();
  await prisma.invoice.deleteMany();
  await prisma.vehicle.deleteMany();
  await prisma.user.deleteMany();
  await prisma.base.deleteMany();
  await prisma.client.deleteMany();

  console.log("✅ Database cleaned");
  console.log("\n🌱 Starting database seed...\n");

  // ============================================
  // CLIENTS (Rental Car Companies)
  // ============================================

  const europcar = await prisma.client.create({
    data: {
      name: "Europcar",
      email: "flotte@europcar.fr",
      phone: "+33 1 45 00 08 06",
    },
  });

  const hertz = await prisma.client.create({
    data: {
      name: "Hertz",
      email: "flotte@hertz.fr",
      phone: "+33 1 41 91 95 25",
    },
  });

  const sixt = await prisma.client.create({
    data: {
      name: "Sixt",
      email: "flotte@sixt.fr",
      phone: "+33 1 44 38 55 55",
    },
  });

  const avis = await prisma.client.create({
    data: {
      name: "Avis",
      email: "flotte@avis.fr",
      phone: "+33 1 55 38 23 23",
    },
  });

  const enterprise = await prisma.client.create({
    data: {
      name: "Enterprise",
      email: "flotte@enterprise.fr",
      phone: "+33 1 70 36 03 12",
    },
  });

  console.log("✅ Created 5 clients: Europcar, Hertz, Sixt, Avis, Enterprise");

  // ============================================
  // BASES (Locations / Agencies)
  // ============================================

  // Europcar bases
  const europcarCDG = await prisma.base.create({
    data: { clientId: europcar.id, location: "Aéroport Paris-CDG Terminal 2" },
  });
  const europcarOrly = await prisma.base.create({
    data: { clientId: europcar.id, location: "Aéroport Paris-Orly" },
  });
  const europcarGareNord = await prisma.base.create({
    data: { clientId: europcar.id, location: "Paris Gare du Nord" },
  });
  const europcarLyon = await prisma.base.create({
    data: { clientId: europcar.id, location: "Lyon Part-Dieu" },
  });

  // Hertz bases
  const hertzCDG = await prisma.base.create({
    data: { clientId: hertz.id, location: "Aéroport Paris-CDG Terminal 1" },
  });
  const hertzNice = await prisma.base.create({
    data: { clientId: hertz.id, location: "Aéroport Nice Côte d'Azur" },
  });
  const hertzMarseille = await prisma.base.create({
    data: { clientId: hertz.id, location: "Aéroport Marseille-Provence" },
  });

  // Sixt bases
  const sixtCDG = await prisma.base.create({
    data: { clientId: sixt.id, location: "Aéroport Paris-CDG Terminal 2E" },
  });
  const sixtBordeaux = await prisma.base.create({
    data: { clientId: sixt.id, location: "Aéroport Bordeaux-Mérignac" },
  });

  // Avis bases
  const avisCDG = await prisma.base.create({
    data: { clientId: avis.id, location: "Aéroport Paris-CDG Terminal 2F" },
  });
  const avisToulouse = await prisma.base.create({
    data: { clientId: avis.id, location: "Aéroport Toulouse-Blagnac" },
  });

  // Enterprise bases
  const enterpriseOrly = await prisma.base.create({
    data: { clientId: enterprise.id, location: "Aéroport Paris-Orly Sud" },
  });
  const enterpriseNantes = await prisma.base.create({
    data: { clientId: enterprise.id, location: "Aéroport Nantes Atlantique" },
  });

  console.log("✅ Created 13 bases across France");

  // ============================================
  // USERS
  // ============================================

  const adminPassword = await bcrypt.hash("admin123", 10);
  const admin = await prisma.user.create({
    data: {
      email: "admin@gestcars.com",
      name: "Adil",
      password: adminPassword,
      role: "ADMIN",
    },
  });

  const managerPassword = await bcrypt.hash("manager123", 10);
  const manager = await prisma.user.create({
    data: {
      email: "manager@gestcars.com",
      name: "Nadia",
      password: managerPassword,
      role: "MANAGER",
    },
  });

  const mechanicPassword = await bcrypt.hash("mechanic123", 10);
  const mechanic = await prisma.user.create({
    data: {
      email: "mechanic@gestcars.com",
      name: "Karim",
      password: mechanicPassword,
      role: "MECHANIC",
    },
  });

  // Client users for different rental companies
  const clientPassword = await bcrypt.hash("client123", 10);

  const clientEuropcar = await prisma.user.create({
    data: {
      email: "client@gestcars.com",
      name: "Sophie (Europcar CDG)",
      password: clientPassword,
      role: "CLIENT",
      clientId: europcar.id,
      baseId: europcarCDG.id,
    },
  });

  const clientHertz = await prisma.user.create({
    data: {
      email: "hertz@gestcars.com",
      name: "Thomas (Hertz CDG)",
      password: clientPassword,
      role: "CLIENT",
      clientId: hertz.id,
      baseId: hertzCDG.id,
    },
  });

  const clientSixt = await prisma.user.create({
    data: {
      email: "sixt@gestcars.com",
      name: "Camille (Sixt CDG)",
      password: clientPassword,
      role: "CLIENT",
      clientId: sixt.id,
      baseId: sixtCDG.id,
    },
  });

  console.log("✅ Created 6 users (1 admin, 1 manager, 1 mechanic, 3 clients)");

  // ============================================
  // VEHICLES & INTERVENTIONS
  // ============================================

  // --- EUROPCAR VEHICLES ---

  // Vehicle 1: Renault Clio - Multiple interventions
  const v1 = await prisma.vehicle.create({
    data: {
      licensePlate: "FG-234-HJ",
      brand: "Renault",
      model: "Clio V",
      year: 2023,
      color: "Blanc Glacier",
      clientId: europcar.id,
      baseId: europcarCDG.id,
      handledById: manager.id,
      entryDate: new Date("2025-01-10"),
    },
  });

  await prisma.invoice.create({
    data: {
      vehicleId: v1.id,
      workDescription: "Réparation pare-chocs avant suite à accrochage parking. Débosselage et peinture complète.",
      didOrderParts: true,
      ordersDetails: "Pare-chocs avant Clio V (ref: 620226835R)\nPeinture Blanc Glacier QNJ",
      comments: "Véhicule prioritaire - client VIP",
      invoiceConfirmed: true,
      accordNumber: "EUR-2025-0001",
      dateOfConfirmation: new Date("2025-01-11"),
      status: "FIXING_FINISHED",
      handledById: manager.id,
    },
  });

  await prisma.invoice.create({
    data: {
      vehicleId: v1.id,
      workDescription: "Révision des 30 000 km + changement plaquettes frein avant",
      didOrderParts: true,
      ordersDetails: "Kit plaquettes AV (ref: 410601186R)\nFiltre huile\nFiltre air\nHuile 5W30 5L",
      comments: "Prévoir 3h de main d'oeuvre",
      invoiceConfirmed: true,
      accordNumber: "EUR-2025-0015",
      dateOfConfirmation: new Date("2025-02-01"),
      status: "WAITING_FOR_PARTS",
      handledById: manager.id,
    },
  });

  // Vehicle 2: Peugeot 3008
  const v2 = await prisma.vehicle.create({
    data: {
      licensePlate: "GH-456-KL",
      brand: "Peugeot",
      model: "3008 GT",
      year: 2022,
      color: "Gris Artense",
      clientId: europcar.id,
      baseId: europcarCDG.id,
      handledById: manager.id,
      entryDate: new Date("2025-01-20"),
    },
  });

  await prisma.invoice.create({
    data: {
      vehicleId: v2.id,
      workDescription: "Remplacement pare-brise fissuré (impact autoroute)",
      didOrderParts: true,
      ordersDetails: "Pare-brise Peugeot 3008 avec capteur pluie (ref: 8115PZ)",
      comments: "Calibration caméra ADAS nécessaire après pose",
      invoiceConfirmed: true,
      accordNumber: "EUR-2025-0008",
      dateOfConfirmation: new Date("2025-01-21"),
      status: "FIXING_STARTED",
      handledById: manager.id,
    },
  });

  // Vehicle 3: Citroën C3
  const v3 = await prisma.vehicle.create({
    data: {
      licensePlate: "HK-789-MN",
      brand: "Citroën",
      model: "C3 Aircross",
      year: 2023,
      color: "Bleu Voltaic",
      clientId: europcar.id,
      baseId: europcarOrly.id,
      handledById: manager.id,
      entryDate: new Date("2025-02-05"),
    },
  });

  await prisma.invoice.create({
    data: {
      vehicleId: v3.id,
      workDescription: "Diagnostic voyant moteur allumé + réparation système AdBlue",
      didOrderParts: false,
      comments: "Code défaut P20E8 - Pompe AdBlue probablement défaillante",
      invoiceConfirmed: true,
      accordNumber: "EUR-2025-0022",
      dateOfConfirmation: new Date("2025-02-06"),
      status: "CONFIRMED_IN_PLANNING",
      handledById: manager.id,
    },
  });

  // Vehicle 4: Toyota Yaris (Europcar Lyon)
  const v4 = await prisma.vehicle.create({
    data: {
      licensePlate: "JM-012-NP",
      brand: "Toyota",
      model: "Yaris Hybride",
      year: 2024,
      color: "Rouge Intense",
      clientId: europcar.id,
      baseId: europcarLyon.id,
      handledById: manager.id,
      entryDate: new Date("2025-01-25"),
    },
  });

  await prisma.invoice.create({
    data: {
      vehicleId: v4.id,
      workDescription: "Réparation aile arrière gauche + feu arrière suite à accrochage",
      didOrderParts: true,
      ordersDetails: "Feu arrière gauche (ref: 81561-K0190)\nAile ARG à réparer",
      comments: "Peinture à raccorder sur portière",
      invoiceConfirmed: true,
      accordNumber: "EUR-2025-0019",
      dateOfConfirmation: new Date("2025-01-26"),
      status: "FIXING_STARTED",
      handledById: manager.id,
    },
  });

  // Vehicle 5: No intervention
  await prisma.vehicle.create({
    data: {
      licensePlate: "KP-345-QR",
      brand: "Renault",
      model: "Captur",
      year: 2023,
      color: "Orange Valencia",
      clientId: europcar.id,
      baseId: europcarGareNord.id,
      handledById: manager.id,
      entryDate: new Date("2025-02-10"),
    },
  });

  console.log("✅ Created 5 Europcar vehicles");

  // --- HERTZ VEHICLES ---

  // Vehicle 6: Mercedes Classe A
  const v6 = await prisma.vehicle.create({
    data: {
      licensePlate: "LR-678-ST",
      brand: "Mercedes",
      model: "Classe A 180d",
      year: 2023,
      color: "Noir Cosmos",
      clientId: hertz.id,
      baseId: hertzCDG.id,
      handledById: manager.id,
      entryDate: new Date("2025-01-15"),
    },
  });

  await prisma.invoice.create({
    data: {
      vehicleId: v6.id,
      workDescription: "Réparation jante alu rayée + changement pneu crevé AVD",
      didOrderParts: true,
      ordersDetails: "Pneu Michelin Primacy 4 225/45R17\nRénovation jante AMG",
      comments: "Client a roulé sur trottoir",
      invoiceConfirmed: true,
      accordNumber: "HER-2025-0003",
      dateOfConfirmation: new Date("2025-01-16"),
      status: "FIXING_FINISHED",
      handledById: manager.id,
    },
  });

  // Vehicle 7: BMW Série 1
  const v7 = await prisma.vehicle.create({
    data: {
      licensePlate: "MS-901-UV",
      brand: "BMW",
      model: "118i",
      year: 2022,
      color: "Blanc Alpin",
      clientId: hertz.id,
      baseId: hertzNice.id,
      handledById: manager.id,
      entryDate: new Date("2025-02-01"),
    },
  });

  await prisma.invoice.create({
    data: {
      vehicleId: v7.id,
      workDescription: "Climatisation HS - Diagnostic et recharge gaz réfrigérant",
      didOrderParts: false,
      comments: "Vérifier absence de fuite avant recharge",
      invoiceConfirmed: true,
      accordNumber: "HER-2025-0011",
      dateOfConfirmation: new Date("2025-02-02"),
      status: "FIXING_STARTED",
      handledById: manager.id,
    },
  });

  // Vehicle 8: Audi A3
  const v8 = await prisma.vehicle.create({
    data: {
      licensePlate: "NV-234-WX",
      brand: "Audi",
      model: "A3 Sportback",
      year: 2023,
      color: "Gris Daytona",
      clientId: hertz.id,
      baseId: hertzMarseille.id,
      handledById: manager.id,
      entryDate: new Date("2025-02-08"),
    },
  });

  await prisma.invoice.create({
    data: {
      vehicleId: v8.id,
      workDescription: "Remplacement rétroviseur extérieur droit arraché",
      didOrderParts: true,
      ordersDetails: "Rétroviseur complet électrique chauffant rabattable (ref: 8Y0857410)",
      comments: "Commande urgente - délai 48h",
      invoiceConfirmed: true,
      accordNumber: "HER-2025-0018",
      dateOfConfirmation: new Date("2025-02-09"),
      status: "WAITING_FOR_PARTS",
      handledById: manager.id,
    },
  });

  // Vehicle 9: No intervention
  await prisma.vehicle.create({
    data: {
      licensePlate: "PW-567-YZ",
      brand: "Volkswagen",
      model: "Golf 8",
      year: 2024,
      color: "Bleu Atlantique",
      clientId: hertz.id,
      baseId: hertzCDG.id,
      handledById: manager.id,
      entryDate: new Date("2025-02-12"),
    },
  });

  console.log("✅ Created 4 Hertz vehicles");

  // --- SIXT VEHICLES ---

  // Vehicle 10: BMW X1
  const v10 = await prisma.vehicle.create({
    data: {
      licensePlate: "QX-890-AB",
      brand: "BMW",
      model: "X1 xDrive25e",
      year: 2023,
      color: "Gris Brooklyn",
      clientId: sixt.id,
      baseId: sixtCDG.id,
      handledById: manager.id,
      entryDate: new Date("2025-01-18"),
    },
  });

  await prisma.invoice.create({
    data: {
      vehicleId: v10.id,
      workDescription: "Diagnostic batterie hybride + mise à jour logiciel groupe motopropulseur",
      didOrderParts: false,
      comments: "Passage chez BMW pour diagnostic approfondi si nécessaire",
      invoiceConfirmed: true,
      accordNumber: "SIX-2025-0005",
      dateOfConfirmation: new Date("2025-01-19"),
      status: "FIXING_FINISHED",
      handledById: manager.id,
    },
  });

  // Vehicle 11: Mini Cooper
  const v11 = await prisma.vehicle.create({
    data: {
      licensePlate: "RY-123-CD",
      brand: "Mini",
      model: "Cooper S",
      year: 2022,
      color: "Vert British Racing",
      clientId: sixt.id,
      baseId: sixtBordeaux.id,
      handledById: manager.id,
      entryDate: new Date("2025-02-03"),
    },
  });

  await prisma.invoice.create({
    data: {
      vehicleId: v11.id,
      workDescription: "Embrayage patine - Remplacement kit embrayage complet",
      didOrderParts: true,
      ordersDetails: "Kit embrayage LuK + volant moteur bimasse",
      comments: "Prévoir 6h de main d'oeuvre minimum",
      invoiceConfirmed: true,
      accordNumber: "SIX-2025-0014",
      dateOfConfirmation: new Date("2025-02-04"),
      status: "WAITING_FOR_PARTS",
      handledById: manager.id,
    },
  });

  console.log("✅ Created 2 Sixt vehicles");

  // --- AVIS VEHICLES ---

  // Vehicle 12: Ford Puma
  const v12 = await prisma.vehicle.create({
    data: {
      licensePlate: "SZ-456-EF",
      brand: "Ford",
      model: "Puma ST-Line",
      year: 2023,
      color: "Bleu Desert Island",
      clientId: avis.id,
      baseId: avisCDG.id,
      handledById: manager.id,
      entryDate: new Date("2025-01-22"),
    },
  });

  await prisma.invoice.create({
    data: {
      vehicleId: v12.id,
      workDescription: "Réparation carrosserie porte AVG + aile AVG suite collision",
      didOrderParts: true,
      ordersDetails: "Porte AVG (occasion garantie)\nTraitement anticorrosion\nPeinture Bleu code PN4HD",
      comments: "Expertise assurance validée",
      invoiceConfirmed: true,
      accordNumber: "AVI-2025-0007",
      dateOfConfirmation: new Date("2025-01-23"),
      status: "FIXING_STARTED",
      handledById: manager.id,
    },
  });

  // Vehicle 13: Fiat 500
  const v13 = await prisma.vehicle.create({
    data: {
      licensePlate: "TA-789-GH",
      brand: "Fiat",
      model: "500 électrique",
      year: 2024,
      color: "Rose Tropicale",
      clientId: avis.id,
      baseId: avisToulouse.id,
      handledById: manager.id,
      entryDate: new Date("2025-02-06"),
    },
  });

  await prisma.invoice.create({
    data: {
      vehicleId: v13.id,
      workDescription: "Problème charge batterie - Diagnostic prise de charge + connecteur",
      didOrderParts: false,
      comments: "Véhicule ne charge plus sur borne rapide",
      invoiceConfirmed: true,
      accordNumber: "AVI-2025-0020",
      dateOfConfirmation: new Date("2025-02-07"),
      status: "CONFIRMED_IN_PLANNING",
      handledById: manager.id,
    },
  });

  // Vehicle 14: No intervention
  await prisma.vehicle.create({
    data: {
      licensePlate: "UB-012-JK",
      brand: "Opel",
      model: "Corsa-e",
      year: 2023,
      color: "Jaune Mango",
      clientId: avis.id,
      baseId: avisCDG.id,
      handledById: manager.id,
      entryDate: new Date("2025-02-11"),
    },
  });

  console.log("✅ Created 3 Avis vehicles");

  // --- ENTERPRISE VEHICLES ---

  // Vehicle 15: Dacia Duster
  const v15 = await prisma.vehicle.create({
    data: {
      licensePlate: "VC-345-LM",
      brand: "Dacia",
      model: "Duster",
      year: 2023,
      color: "Kaki",
      clientId: enterprise.id,
      baseId: enterpriseOrly.id,
      handledById: manager.id,
      entryDate: new Date("2025-01-28"),
    },
  });

  await prisma.invoice.create({
    data: {
      vehicleId: v15.id,
      workDescription: "Révision complète + changement courroie distribution",
      didOrderParts: true,
      ordersDetails: "Kit distribution complet avec pompe à eau\nKit filtres\nHuile 5W40",
      comments: "Kilométrage: 89 500 km",
      invoiceConfirmed: true,
      accordNumber: "ENT-2025-0009",
      dateOfConfirmation: new Date("2025-01-29"),
      status: "FIXING_FINISHED",
      handledById: manager.id,
    },
  });

  // Vehicle 16: Skoda Octavia
  const v16 = await prisma.vehicle.create({
    data: {
      licensePlate: "WD-678-NP",
      brand: "Skoda",
      model: "Octavia Combi",
      year: 2022,
      color: "Gris Quartz",
      clientId: enterprise.id,
      baseId: enterpriseNantes.id,
      handledById: manager.id,
      entryDate: new Date("2025-02-04"),
    },
  });

  await prisma.invoice.create({
    data: {
      vehicleId: v16.id,
      workDescription: "Amortisseurs arrière HS - Remplacement + géométrie",
      didOrderParts: true,
      ordersDetails: "2x Amortisseurs AR Sachs\nKit coupelles + butées",
      comments: "Véhicule fait 120 000 km - vérifier aussi l'avant",
      invoiceConfirmed: true,
      accordNumber: "ENT-2025-0016",
      dateOfConfirmation: new Date("2025-02-05"),
      status: "FIXING_STARTED",
      handledById: manager.id,
    },
  });

  // Vehicle 17: Seat Leon
  const v17 = await prisma.vehicle.create({
    data: {
      licensePlate: "XE-901-QR",
      brand: "Seat",
      model: "Leon FR",
      year: 2023,
      color: "Rouge Desire",
      clientId: enterprise.id,
      baseId: enterpriseOrly.id,
      handledById: manager.id,
      entryDate: new Date("2025-02-09"),
    },
  });

  await prisma.invoice.create({
    data: {
      vehicleId: v17.id,
      workDescription: "Voyant ESP allumé - Diagnostic capteur angle volant",
      didOrderParts: false,
      comments: "Effacement codes + test route à prévoir",
      invoiceConfirmed: true,
      accordNumber: "ENT-2025-0021",
      dateOfConfirmation: new Date("2025-02-10"),
      status: "CONFIRMED_IN_PLANNING",
      handledById: manager.id,
    },
  });

  // Vehicle 18: No intervention
  await prisma.vehicle.create({
    data: {
      licensePlate: "YF-234-ST",
      brand: "Hyundai",
      model: "Tucson",
      year: 2024,
      color: "Blanc Atlas",
      clientId: enterprise.id,
      baseId: enterpriseNantes.id,
      handledById: manager.id,
      entryDate: new Date("2025-02-13"),
    },
  });

  console.log("✅ Created 4 Enterprise vehicles");

  // ============================================
  // SUMMARY
  // ============================================

  console.log("\n" + "=".repeat(50));
  console.log("🎉 DATABASE SEEDED SUCCESSFULLY!");
  console.log("=".repeat(50));

  console.log("\n📋 SUMMARY:");
  console.log("   • 5 Rental companies (clients)");
  console.log("   • 13 Agencies (bases) across France");
  console.log("   • 18 Vehicles total");
  console.log("   • 15 Active interventions");
  console.log("   • 6 Users");

  console.log("\n🔐 TEST CREDENTIALS:");
  console.log("   ┌─────────────┬──────────────────────────┬─────────────┐");
  console.log("   │ Role        │ Email                    │ Password    │");
  console.log("   ├─────────────┼──────────────────────────┼─────────────┤");
  console.log("   │ Admin       │ admin@gestcars.com       │ admin123    │");
  console.log("   │ Manager     │ manager@gestcars.com     │ manager123  │");
  console.log("   │ Mechanic    │ mechanic@gestcars.com    │ mechanic123 │");
  console.log("   │ Client (EU) │ client@gestcars.com      │ client123   │");
  console.log("   │ Client (HZ) │ hertz@gestcars.com       │ client123   │");
  console.log("   │ Client (SX) │ sixt@gestcars.com        │ client123   │");
  console.log("   └─────────────┴──────────────────────────┴─────────────┘");

  console.log("\n🏢 AGENCIES BY CLIENT:");
  console.log("   Europcar (4): CDG T2, Orly, Gare du Nord, Lyon Part-Dieu");
  console.log("   Hertz (3):    CDG T1, Nice, Marseille");
  console.log("   Sixt (2):     CDG T2E, Bordeaux");
  console.log("   Avis (2):     CDG T2F, Toulouse");
  console.log("   Enterprise (2): Orly Sud, Nantes");

  console.log("\n🚗 SAMPLE LICENSE PLATES TO TEST:");
  console.log("   FG-234-HJ  │ Renault Clio (Europcar CDG) - 2 interventions");
  console.log("   LR-678-ST  │ Mercedes Classe A (Hertz CDG) - Terminé");
  console.log("   NV-234-WX  │ Audi A3 (Hertz Marseille) - Attente pièces");
  console.log("   TA-789-GH  │ Fiat 500 électrique (Avis Toulouse) - À planifier");
}

main()
  .catch((e) => {
    console.error("❌ Error seeding database:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
