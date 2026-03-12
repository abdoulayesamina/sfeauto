import { NextResponse } from "next/server"
import { prisma } from "@/src/lib/prisma"
import { normalizePlate } from "@/src/lib/normalizePlate"

function mapEnergy(e?: string) {
  if (!e) return undefined

  const map: Record<string, string> = {
    DIESEL: "GAZOLE",
    ESSENCE: "ESSENCE",
    ELECTRIQUE: "ELECTRIQUE",
    HYBRIDE: "HYBRIDE",
    GPL: "GPL"
  }

  return map[e.toUpperCase()] ?? undefined
}

function mapGearbox(v?: string) {
  if (!v) return undefined

  const upper = v.toUpperCase()

  if (upper.includes("AUTO")) return "BVA"
  if (upper.includes("MAN")) return "BVM"

  return undefined
}

export async function GET(
  request: Request,
  context: { params: Promise<{ plate: string }> }
) {

  const { plate } = await context.params

  if (!plate) {
    return NextResponse.json(
      { error: "Plate is required" },
      { status: 400 }
    )
  }

  const normalized = normalizePlate(plate)

  // 1️⃣ Lookup DB
  const vehicle = await prisma.vehicle.findUnique({
    where: {
      normalizedPlate: normalized
    },
    include: {
      brand: true,
      model: true
    }
  })

  if (vehicle) {
    return NextResponse.json({
      found: true,
      vehicle
    })
  }

  // 2️⃣ Appel RapidAPI
  const apiResponse = await fetch(
    `https://api-de-plaque-d-immatriculation-france.p.rapidapi.com/?plaque=${normalized}`,
    {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "plaque": normalized,
        "X-RapidAPI-Key": process.env.RAPIDAPI_KEY!,
        "X-RapidAPI-Host": "api-de-plaque-d-immatriculation-france.p.rapidapi.com"
      }
    }
  )

  if (!apiResponse.ok) {
    const text = await apiResponse.text()

    return NextResponse.json({
      found: false,
      error: "Erreur API immatriculation",
      status: apiResponse.status,
      details: text
    })
  }

  let apiData: any

  try {
    apiData = await apiResponse.json()

    if (process.env.NODE_ENV === "development") {
      console.log("API RAW RESPONSE:", apiData)
    }

  } catch {
    return NextResponse.json({
      found: false,
      error: "Erreur lecture API"
    })
  }

  if (!apiData || apiData.error) {
    return NextResponse.json({
      found: false,
      error: "Aucune donnée trouvée pour cette plaque"
    })
  }

  const d = apiData.data

  // 3️⃣ Mapping
  const mapped = {
    brandName: d.AWN_marque?.toUpperCase(),
    modelName: d.AWN_modele?.toUpperCase(),

    year: d.AWN_date_mise_en_circulation_us
      ? new Date(d.AWN_date_mise_en_circulation_us).getFullYear()
      : undefined,

    color:
      d.AWN_couleur && d.AWN_couleur !== "INC."
        ? d.AWN_couleur
        : undefined,

    energy: mapEnergy(d.AWN_energie),

    doorsCount: d.AWN_nbr_portes
      ? Number(d.AWN_nbr_portes)
      : undefined,

    gearboxType: mapGearbox(d.AWN_type_boite_vites),

    realPowerHp: d.AWN_puissance_chevaux
      ? Number(d.AWN_puissance_chevaux)
      : undefined,

    registrationCardDate: d.AWN_date_cg
      ? new Date(d.AWN_date_cg.split("-").reverse().join("-"))
      : undefined,

    fiscalPowerCv: d.AWN_puissance_fiscale
      ? Number(d.AWN_puissance_fiscale)
      : undefined,

    version: d.AWN_version,

    firstRegistrationDate: d.AWN_date_mise_en_circulation_us
      ? new Date(d.AWN_date_mise_en_circulation_us)
      : undefined,

    bodyType: d.AWN_style_carrosserie
      ? d.AWN_style_carrosserie.split(" ")[0]
      : d.AWN_carrosserie
  }

  if (process.env.NODE_ENV === "development") {
    console.log("MAPPED DATA:", mapped)
  }

  let brand = null
  let model = null

  // 4️⃣ find/create brand
  if (mapped.brandName) {

    brand = await prisma.brand.findUnique({
      where: { name: mapped.brandName }
    })

    if (!brand) {
      brand = await prisma.brand.create({
        data: { name: mapped.brandName }
      })
    }
  }

  // 5️⃣ find/create model
  if (brand && mapped.modelName) {

    model = await prisma.model.findFirst({
      where: {
        name: mapped.modelName,
        brandId: brand.id
      }
    })

    if (!model) {
      model = await prisma.model.create({
        data: {
          name: mapped.modelName,
          brandId: brand.id
        }
      })
    }
  }

  // 6️⃣ réponse frontend
  return NextResponse.json({
    found: false,
    source: "api",
    data: {
      brandId: brand?.id,
      brandName: mapped.brandName,

      modelId: model?.id,
      modelName: mapped.modelName,

      year: mapped.year,
      color: mapped.color,

      energy: mapped.energy,
      doorsCount: mapped.doorsCount,

      registrationCardDate: mapped.registrationCardDate,

      gearboxType: mapped.gearboxType,
      bodyType: mapped.bodyType,

      realPowerHp: mapped.realPowerHp,
      fiscalPowerCv: mapped.fiscalPowerCv,

      version: mapped.version,

      firstRegistrationDate: mapped.firstRegistrationDate
    }
  })
}