import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/src/lib/prisma";
import {
  intervention_status,
  statushistory_sth_sth_newStatus,
  statushistory_sth_sth_previousStatus,
} from "@/generated/prisma";
import { logError } from "@/src/lib/logger";
import { notifyAdmins } from "@/src/lib/notifications";

type Ctx = { params: Promise<{ id: string }> | { id: string } };

function isPromise<T>(v: unknown): v is Promise<T> {
  return !!v && typeof v === "object" && typeof (v as any).then === "function";
}

async function getParamId(ctx: Ctx): Promise<string> {
  const p = isPromise<{ id: string }>(ctx.params) ? await ctx.params : ctx.params;
  return p?.id;
}

function isValidStatus(value: unknown): value is intervention_status {
  return typeof value === "string" && Object.values(intervention_status).includes(value as intervention_status);
}

function isValidStatusTransition(
  currentStatus: intervention_status,
  newStatus: intervention_status
): boolean {
  const transitions: Record<intervention_status, intervention_status[]> = {
    WAITING_FOR_PARTS: [
      intervention_status.FIXING_STARTED,
      intervention_status.FIXING_FINISHED,
    ],
    FIXING_STARTED: [
      intervention_status.WAITING_FOR_PARTS,
      intervention_status.FIXING_FINISHED,
    ],
    FIXING_FINISHED: [
      intervention_status.FIXING_STARTED,
      intervention_status.WAITING_FOR_PARTS,
    ],
  };

  if (currentStatus === newStatus) return true;
  return transitions[currentStatus]?.includes(newStatus) ?? false;
}

function toHistoryPreviousStatus(value: intervention_status): statushistory_sth_sth_previousStatus {
  return value as unknown as statushistory_sth_sth_previousStatus;
}

function toHistoryNewStatus(value: intervention_status): statushistory_sth_sth_newStatus {
  return value as unknown as statushistory_sth_sth_newStatus;
}

export async function PATCH(request: NextRequest, context: Ctx) {
  try {
    const id = await getParamId(context);

    if (!id || typeof id !== "string") {
      return NextResponse.json(
        { error: "ID d'intervention invalide" },
        { status: 400 }
      );
    }

    const session = await auth();

    if (!session?.user) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    if (session.user.role !== "MECHANIC" && session.user.role !== "ADMIN") {
      return NextResponse.json(
        { error: "Seuls les mécaniciens ou admins peuvent modifier le statut" },
        { status: 403 }
      );
    }

    const body = await request.json();
    const newStatus = body?.status;

    if (!isValidStatus(newStatus)) {
      return NextResponse.json(
        { error: "Valeur de statut invalide" },
        { status: 400 }
      );
    }

    const intervention = await prisma.intervention_int.findUnique({
      where: { int_id: id },
      include: {
        int_vehicle: {
          include: {
            veh_client: {
              select: {
                cli_id: true,
                cli_name: true,
              },
            },
            veh_base: {
              select: {
                bas_id: true,
                bas_location: true,
              },
            },
          },
        },
        int_handledBy: {
          select: {
            usr_id: true,
            usr_name: true,
          },
        },
        history: {
          include: {
            sth_user: {
              select: {
                usr_name: true,
              },
            },
          },
          orderBy: {
            sth_changedAt: "asc",
          },
        },
      },
    });

    if (!intervention) {
      return NextResponse.json(
        { error: `Aucune intervention trouvée avec l'id ${id}` },
        { status: 404 }
      );
    }

    if (intervention.int_annulee) {
      return NextResponse.json(
        { error: "Intervention annulée : le statut ne peut plus être modifié" },
        { status: 409 }
      );
    }

    if (intervention.int_vehicle?.veh_absent) {
      return NextResponse.json(
        { error: "Véhicule absent : le statut ne peut plus être modifié" },
        { status: 409 }
      );
    }

    if (!intervention.int_accordNumber) {
      return NextResponse.json(
        {
          error:
            "Veuillez attribuer un numéro d'accord avant de modifier le statut de cette intervention.",
        },
        { status: 403 }
      );
    }

    if (!isValidStatusTransition(intervention.int_status, newStatus)) {
      return NextResponse.json(
        {
          error: `Transition de statut invalide de ${intervention.int_status} vers ${newStatus}`,
        },
        { status: 400 }
      );
    }

    const statusChanged = intervention.int_status !== newStatus;

    await prisma.$transaction(async (tx) => {
      if (statusChanged) {
        await tx.statushistory_sth.create({
          data: {
            sth_interventionId: id,
            sth_previousStatus: toHistoryPreviousStatus(intervention.int_status),
            sth_newStatus: toHistoryNewStatus(newStatus),
            sth_changedById: session.user.id,
          },
        });

        await tx.changehistory_chg.create({
          data: {
            chg_interventionId: id,
            chg_changedBy: session.user.id,
            chg_fieldName: "status",
            chg_oldValue: intervention.int_status,
            chg_newValue: newStatus,
            chg_changeType: "status_updated",
          },
        });
      }

      await tx.intervention_int.update({
        where: { int_id: id },
        data: {
          int_status: newStatus,
          int_statusUpdatedAt: new Date(),
        },
      });
    });

    const updated = await prisma.intervention_int.findUnique({
      where: { int_id: id },
      include: {
        int_vehicle: {
          include: {
            veh_client: {
              select: {
                cli_id: true,
                cli_name: true,
              },
            },
            veh_base: {
              select: {
                bas_id: true,
                bas_location: true,
              },
            },
          },
        },
        int_handledBy: {
          select: {
            usr_id: true,
            usr_name: true,
            usr_email: true,
          },
        },
        history: {
          include: {
            sth_user: {
              select: {
                usr_name: true,
              },
            },
          },
          orderBy: {
            sth_changedAt: "asc",
          },
        },
      },
    });

    if (!updated) {
      return NextResponse.json(
        { error: "Intervention non trouvée après mise à jour" },
        { status: 404 }
      );
    }

    const serialized = {
      id: updated.int_id,
      accordNumber: updated.int_accordNumber,
      dateOfConfirmation: updated.int_dateOfConfirmation?.toISOString(),
      status: updated.int_status,
      statusUpdatedAt: updated.int_statusUpdatedAt.toISOString(),
      workDescription: updated.int_workDescription,
      didOrderParts: updated.int_didOrderParts,
      ordersDetails: updated.int_ordersDetails,
      comments: updated.int_comments,
      createdAt: updated.int_createdAt.toISOString(),
      vehicle: updated.int_vehicle
        ? {
            id: updated.int_vehicle.veh_id,
            licensePlate: updated.int_vehicle.veh_licensePlate,
            brand: updated.int_vehicle.veh_brandId,
            model: updated.int_vehicle.veh_modelId,
            year: updated.int_vehicle.veh_year,
            color: updated.int_vehicle.veh_color,
            client: updated.int_vehicle.veh_client
              ? {
                  id: updated.int_vehicle.veh_client.cli_id,
                  name: updated.int_vehicle.veh_client.cli_name,
                }
              : null,
            base: updated.int_vehicle.veh_base
              ? {
                  id: updated.int_vehicle.veh_base.bas_id,
                  location: updated.int_vehicle.veh_base.bas_location,
                }
              : null,
          }
        : null,
      handledBy: updated.int_handledBy
        ? {
            id: updated.int_handledBy.usr_id,
            name: updated.int_handledBy.usr_name,
            email: updated.int_handledBy.usr_email,
          }
        : null,
      statusHistory: updated.history.map((h) => ({
        id: h.sth_id,
        previousStatus: h.sth_previousStatus,
        newStatus: h.sth_newStatus,
        changedAt: h.sth_changedAt.toISOString(),
        changedBy: h.sth_changedById,
        changedByUser: h.sth_user
          ? {
              name: h.sth_user.usr_name,
            }
          : null,
      })),
    };

    if (statusChanged) {
      await notifyAdmins({
        type: "INTERVENTION_UPDATED",
        title: "Statut d'intervention mis à jour",
        message: `Le statut de l'intervention du véhicule ${updated.int_vehicle?.veh_licensePlate ?? ""} est passé à « ${newStatus} ».`,
        interventionId: id,
        excludeUserId: session.user.id ?? null,
      });
    }

    return NextResponse.json(serialized);
  } catch (error: any) {
    logError("Failed to update intervention status", error);
    return NextResponse.json(
      { error: "Erreur serveur inconnue" },
      { status: 500 }
    );
  }
}