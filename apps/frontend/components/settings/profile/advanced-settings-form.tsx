"use client";

import { 
  Button,
} from "@repo/ui";

export default function AdvancedSettingsForm() {
    return (
        <div className="col-span-8 lg:col-span-4 space-y-4 md:space-y-6">
            <div className="flex items-top space-x-2">
            {/* <Checkbox id="data-export" /> */}
            <div className="grid gap-1.5 leading-none">
                <label
                    htmlFor="data-export"
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                    Data Export Access
                </label>
                <p className="text-sm text-muted-foreground">
                    Allow export of personal data and backups.
                </p>
            </div>
            </div>
            <div className="flex items-top space-x-2">
            {/* <Checkbox id="admin-add" /> */}
                <div className="grid gap-1.5 leading-none">
                    <label
                        htmlFor="admin-add"
                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                    >
                        Allow Admin to Add Members
                    </label>
                    <p className="text-sm text-muted-foreground">
                        Admins can invite and manage members.
                    </p>
                </div>
            </div>
            <div className="flex items-top space-x-2">
            {/* <Checkbox id="two-factor" /> */}
                <div className="grid gap-1.5 leading-none">
                    <label
                        htmlFor="two-factor"
                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                    >
                        Enable Two-Factor Authentication
                    </label>
                    <p className="text-sm text-muted-foreground">
                        Require 2FA for added account security.
                    </p>
                </div>
            </div>
            <Button>Save</Button>
        </div>
    );
}
