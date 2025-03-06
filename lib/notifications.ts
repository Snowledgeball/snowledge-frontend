import { NotificationType } from "@/types/notification";
import { db } from "@/lib/firebaseConfig";
import {
  collection,
  addDoc,
  serverTimestamp,
  writeBatch,
  doc,
} from "firebase/firestore";

export async function createNotification({
  userId,
  title,
  message,
  type,
  link,
  metadata,
}: {
  userId: string;
  title: string;
  message: string;
  type: NotificationType;
  link?: string;
  metadata?: Record<string, any>;
}) {
  try {
    const response = await fetch("/api/notifications", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        userId,
        title,
        message,
        type,
        link,
        metadata,
      }),
    });

    if (!response.ok) {
      throw new Error("Erreur lors de la création de la notification");
    }

    return await response.json();
  } catch (error) {
    console.error("Erreur:", error);
    throw error;
  }
}

export async function createBulkNotifications({
  userIds,
  title,
  message,
  type,
  link,
  metadata,
}: {
  userIds: number[];
  title: string;
  message: string;
  type: NotificationType;
  link?: string;
  metadata?: Record<string, any>;
}) {
  try {
    const batch = writeBatch(db);
    const notificationsRef = collection(db, "notifications");

    for (const userId of userIds) {
      const notificationData = {
        userId,
        title,
        message,
        type,
        link,
        metadata,
        createdAt: serverTimestamp(),
        read: false,
      };

      const newNotifRef = doc(notificationsRef);
      batch.set(newNotifRef, notificationData);
    }

    await batch.commit();

    return { success: true, count: userIds.length };
  } catch (error) {
    console.error(
      "Erreur lors de la création des notifications en masse:",
      error
    );
    throw error;
  }
}
