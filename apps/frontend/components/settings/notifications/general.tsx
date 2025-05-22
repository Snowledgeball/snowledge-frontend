"use client";

import {
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
            "New messages",
            "Account activity",
            "Mentions in discussions",
            "Application updates",
            ].map((title) => (
                <div
                    key={title}
                    className="flex flex-col md:flex-row items-start md:items-center gap-3 justify-between"
                >
                    <span className="text-sm font-semibold">{title}</span>
                    <ToggleGroup
                        type="single"
                        defaultValue="all"
                        className="space-x-1 md:flex-row"
                    >
                        <Toggle
                          value="all"
                          variant="outline"
                          className="px-3 h-10"
                          defaultPressed
                        >
                            All
                        </Toggle>
                        <Toggle
                          value="email"
                          variant="outline"
                          className="px-3 h-10"
                        >
                            Email
                        </Toggle>
                        <Toggle
                          value="inapp"
                          variant="outline"
                          className="px-3 h-10"
                        >
                            In app
                        </Toggle>
                        <Toggle
                          value="none"
                          variant="outline"
                          className="px-3 h-10"
                        >
                            None
                        </Toggle>
                    </ToggleGroup>
                </div>
            ))}
        </div>
    );
}


