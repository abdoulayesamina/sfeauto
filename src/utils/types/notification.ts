export type NotificationInterventionRef = {
  int_id: string;
  int_accordNumber: string | null;
  int_status: string | null;
  int_workDescription: string | null;
};

export type AppNotification = {
  not_id: string;
  not_title: string;
  not_message: string;
  not_url: string | null;
  not_type: "INTERVENTION_CREATED" | "INTERVENTION_UPDATED" | "INTERVENTION_CANCELLED";
  not_isRead: boolean;
  not_userId: string;
  not_interventionId: string | null;
  not_createdAt: string;
  intervention?: NotificationInterventionRef | null;
};
