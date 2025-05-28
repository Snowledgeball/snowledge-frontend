"use client";

import {
    Switch,
    Toggle,
    ToggleGroup
} from "@repo/ui";

export default function NotificationGeneral() {
    return (
        <div className="space-y-4 rounded-md">
            <div className="space-y-1">
                <h2 className="text-lg md:text-xl font-semibold text-card-foreground">
                      General notifications
                </h2>
                <p className="text-sm text-muted-foreground">
                    General notifications keep you updated on key account
                    events and activities.
                </p>
            </div>

            {[
            "New notification in app",
            "receive emails",
            ].map((title) => (
                <div
                    key={title}
                    className="flex flex-col md:flex-row items-start md:items-center gap-3 justify-between"
                >
                    <span className="text-sm font-semibold">{title}</span>
                    <div
                        className="space-x-1 md:flex-row"
                    >
                        <Switch id="airplane-mode" />
                    </div>
                </div>
            ))}
        </div>
    );
}


