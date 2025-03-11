import { NotificationType } from "@/types/notification";
import { db } from "@/lib/firebaseConfig";
import {
  collection,
  addDoc,
  serverTimestamp,
  writeBatch,
  doc,
} from "firebase/firestore";


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
