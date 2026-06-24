export interface NotificationPayload {
  receiverId: string;
  receiverEmail?: string;
  creatorId?: string;
  title: string;
  message: string;
  redirect_link?: string;
  channels: ("email" | "push" | "inapp")[];
  meta?: Record<string, any>;
  emailTemplate?: string; // 👈 add this
  type?: string; // optional, e.g. "PROPERTY_CREATED"
}
