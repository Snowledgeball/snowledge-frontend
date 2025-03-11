"use client";

import { useState, useEffect, useRef } from "react";
import { Bell, UserPlus, MessageCircle, Award, AlertCircle, Check, X, CheckCircle, AlertTriangle, Send, XCircle } from "lucide-react";
import { useSession } from "next-auth/react";
import { Notification, NotificationType } from "@/types/notification";
import { formatDistanceToNow } from "date-fns";
import { fr } from "date-fns/locale";
import Link from "next/link";
import Image from "next/image";
import { db } from "@/lib/firebaseConfig";
import {
  collection,
  query,
  where,
  orderBy,
  onSnapshot,
  updateDoc,
  doc,
  writeBatch,
} from "firebase/firestore";

export default function NotificationBell() {
  const { data: session } = useSession();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!session?.user?.id) return;

    console.log(session.user.id);

    const q = query(
      collection(db, "notifications"),
      where("userId", "==", parseInt(session.user.id)),
      orderBy("createdAt", "desc")
    );

    console.log(q);

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const notifs = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Notification[];

      setNotifications(notifs);
      console.log(notifs);
      setUnreadCount(notifs.filter((n) => !n.read).length);
    });

    return () => unsubscribe();
  }, [session?.user?.id]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const markAsRead = async (notificationId: string) => {
    try {
      const notifRef = doc(db, "notifications", notificationId);
      await updateDoc(notifRef, { read: true });
    } catch (error) {
      console.error("Erreur lors du marquage de la notification:", error);
    }
  };

  const markAllAsRead = async () => {
    try {
      const batch = writeBatch(db);
      notifications
        .filter((n) => !n.read)
        .forEach((notification) => {
          const notifRef = doc(db, "notifications", notification.id);
          batch.update(notifRef, { read: true });
        });
      await batch.commit();
    } catch (error) {
      console.error(
        "Erreur lors du marquage de toutes les notifications:",
        error
      );
    }
  };

  const getNotificationIcon = (type: NotificationType) => {
    switch (type) {
      case NotificationType.NEW_POST:
        return "📝";
      case NotificationType.NEW_POST_PENDING:
        return "⏳";
      case NotificationType.NEW_ENRICHMENT_PENDING:
        return "⏳";
      case NotificationType.ENRICHMENT_UPDATED:
        return "🔄";
      case NotificationType.ENRICHMENT_APPROVED:
        return "✅";
      case NotificationType.ENRICHMENT_REJECTED:
        return "❌";
      case NotificationType.COMMENT_ON_POST:
        return "💬";
      case NotificationType.REPLY_TO_COMMENT:
        return "↩️";
      case NotificationType.MENTION:
        return "📣";
      case NotificationType.COMMUNITY_INVITATION:
        return "🤝";
      case NotificationType.ROLE_CHANGE:
        return "👑";
      case NotificationType.BAN:
        return <X className="h-5 w-5 text-red-600" />;
      case NotificationType.CONTRIBUTOR_ACCEPTED:
        return "✅";
      case NotificationType.CONTRIBUTOR_REFUSED:
        return "❌";
      case NotificationType.CONTRIBUTOR_REQUEST:
        return <UserPlus className="h-5 w-5 text-blue-500" />;
      // case NotificationType.MESSAGE:
      //   return <MessageCircle className="h-5 w-5 text-green-500" />;
      // case NotificationType.ACHIEVEMENT:
      //   return <Award className="h-5 w-5 text-yellow-500" />;
      // case NotificationType.WARNING:
      //   return <AlertCircle className="h-5 w-5 text-red-500" />;
      // case NotificationType.APPROVAL:
      //   return <Check className="h-5 w-5 text-green-600" />;
      case NotificationType.APPROVAL:
        return <CheckCircle className="text-green-500" />;
      case NotificationType.WARNING:
        return <AlertTriangle className="text-yellow-500" />;
      case NotificationType.FEEDBACK:
        return <MessageCircle className="text-blue-500" />;
      case NotificationType.POST_READY_PUBLISH:
        return <Send className="text-purple-500" />; // Icône pour les posts prêts à être publiés
      case NotificationType.POST_REJECTED:
        return <XCircle className="text-red-500" />;
      default:
        return "🔔";
    }
  };

  if (!session) return null;

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 rounded-full hover:bg-gray-100 transition-colors"
        aria-label="Notifications"
      >
        <Bell className="h-6 w-6 text-gray-700" />
        {unreadCount > 0 && (
          <span className="absolute top-0 right-0 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white transform translate-x-1/2 -translate-y-1/2 bg-red-600 rounded-full">
            {unreadCount > 99 ? "99+" : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-xl z-50 max-h-[80vh] overflow-y-auto">
          <div className="p-4 border-b border-gray-200 flex justify-between items-center">
            <h3 className="text-lg font-semibold text-gray-900">
              Notifications
            </h3>
            {unreadCount > 0 && (
              <button
                onClick={markAllAsRead}
                className="text-sm text-blue-600 hover:text-blue-800"
              >
                Tout marquer comme lu
              </button>
            )}
          </div>

          <div className="divide-y divide-gray-200">
            {notifications.length === 0 ? (
              <div className="p-4 text-center text-gray-500">
                Aucune notification
              </div>
            ) : (
              notifications.map((notification) => (
                <Link
                  href={notification.link || "#"}
                  key={notification.id}
                  onClick={() => markAsRead(notification.id)}
                >
                  <div
                    className={`p-4 hover:bg-gray-50 transition-colors flex items-start space-x-3 ${!notification.read ? "bg-blue-50" : ""
                      }`}
                  >
                    <div className="flex-shrink-0 text-2xl">
                      {getNotificationIcon(notification.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900">
                        {notification.title}
                      </p>
                      <p className="text-sm text-gray-500 line-clamp-3">
                        {notification.message}
                      </p>
                      <p className="text-xs text-gray-400 mt-1">
                        {typeof notification.createdAt === "string"
                          ? formatDistanceToNow(
                            new Date(notification.createdAt),
                            {
                              addSuffix: true,
                              locale: fr,
                            }
                          )
                          : formatDistanceToNow(
                            (notification.createdAt as any).toDate(),
                            { addSuffix: true, locale: fr }
                          )}
                      </p>
                    </div>
                    {!notification.read && (
                      <div className="w-2 h-2 bg-blue-600 rounded-full flex-shrink-0"></div>
                    )}
                  </div>
                </Link>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
