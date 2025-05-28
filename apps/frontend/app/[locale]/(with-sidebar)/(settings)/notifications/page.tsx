"use client";

import NotificationGeneral from "@/components/settings/notifications/general";
// import NotificationSummary from "@/components/settings/notifications/summary";
import NotificationTitle from "@/components/settings/notifications/title";
import { Separator } from "@repo/ui";

export default function Notifications() {
    return (
        <main className="flex-1 overflow-y-auto">
            <div className="container mx-auto px-0 py-4 md:py-6 md:pl-6">
                <div className="space-y-6 lg:space-y-8">
                    {/* Title */}
                    <NotificationTitle />

                    <Separator />

                    <NotificationGeneral />

                    {/* <Separator /> */}

                    {/* Summary notifications */}
                    {/* <NotificationSummary /> */}
                </div>
            </div>
        </main>
    );
}
