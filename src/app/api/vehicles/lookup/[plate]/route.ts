import { NextResponse } from "next/server"
import { normalizePlate } from "@/src/lib/normalizePlate"
import { prisma } from "@/src/lib/prisma"

function mapEnergy(e?: string) {
  if (!e) return undefined

  const upper = e.toUpperCase()

  if (upper.includes("DIESEL") || upper.includes("GAZOLE")) return "GAZOLE"
  if (upper.includes("ESSENCE")) return "ESSENCE"
  if (upper.includes("HYBRIDE")) return "HYBRIDE"
  if (upper.includes("ELECTRIQUE")) return "ELECTRIQUE"
  if (upper.includes("GPL")) return "GPL"

  return undefined
}

function mapGearbox(v?: string) {
  if (!v) return undefined

  const upper = v.toUpperCase()

  if (upper.includes("AUTO")) return "BVA"
  if (upper.includes("MAN") || upper.includes("MECANIQUE")) return "BVM"

  return undefined
}

function parseFrenchDate(date?: string) {
  if (!date) return undefined

  const parts = date.split("-")

  if (parts.length !== 3) return undefined

  const [day, month, year] = parts

  return `${year}-${month}-${day}`
}

export async function GET(
  request: Request,
  context: { params: Promise<{ plate: string }> }
) {
  try {

    const { plate } = await context.params

    if (!plate) {
      return NextResponse.json(
        { error: "Plate is required" },
        { status: 400 }
      )
    }

    const normalized = normalizePlate(plate)

    const apiResponse = await fetch(
      `${process.env.RAPIDAPI_URL}?plaque=${normalized}`,
      {
        headers: {
          "X-RapidAPI-Key": process.env.RAPIDAPI_KEY!,
          "X-RapidAPI-Host": process.env.RAPIDAPI_HOST!,
        },
      }
    )

    if (!apiResponse.ok) {
      const text = await apiResponse.text()

      return NextResponse.json({
        found: false,
        error: "Erreur API immatriculation",
        status: apiResponse.status,
        details: text,
      })
    }

    const apiData = await apiResponse.json()

    if (process.env.NODE_ENV === "development") {
      console.log("API RAW RESPONSE:", apiData)
    }

    if (!apiData || apiData.error) {
      return NextResponse.json({
        found: false,
        error: "Aucune donnée trouvée pour cette plaque",
      })
    }

    const d = apiData?.data

    if (!d) {
      return NextResponse.json({
        found: false,
        error: "Réponse API vide",
      })
    }

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

      fiscalPowerCv: d.AWN_puissance_fiscale
        ? Number(d.AWN_puissance_fiscale)
        : undefined,

      version: d.AWN_version,

      firstRegistrationDate: d.AWN_date_mise_en_circulation_us ?? undefined,

      registrationCardDate: parseFrenchDate(d.AWN_date_cg),

      bodyType: d.AWN_style_carrosserie
        ? d.AWN_style_carrosserie.split(" ")[0]
        : d.AWN_carrosserie ?? undefined,
    }

    if (process.env.NODE_ENV === "development") {
      console.log("MAPPED DATA:", mapped)
    }

    let brand = null
    let model = null

    if (mapped.brandName) {

      brand = await prisma.brand.findUnique({
        where: { name: mapped.brandName },
      })

      if (!brand) {
        brand = await prisma.brand.create({
          data: { name: mapped.brandName },
        })
      }
    }

    if (brand && mapped.modelName) {

      model = await prisma.model.findFirst({
        where: {
          name: mapped.modelName,
          brandId: brand.id,
        },
      })

      if (!model) {
        model = await prisma.model.create({
          data: {
            name: mapped.modelName,
            brandId: brand.id,
          },
        })
      }
    }

    return NextResponse.json({
      found: true,
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

        gearboxType: mapped.gearboxType,
        bodyType: mapped.bodyType,

        realPowerHp: mapped.realPowerHp,
        fiscalPowerCv: mapped.fiscalPowerCv,

        version: mapped.version,

        firstRegistrationDate: mapped.firstRegistrationDate,
        registrationCardDate: mapped.registrationCardDate,
      },
    })

  } catch (error) {

    console.error("LOOKUP ERROR:", error)

    return NextResponse.json(
      {
        error: "SERVER_ERROR",
        details: String(error),
      },
      { status: 500 }
    )
  }
}


