"use client";

import SettingsAvatar from "@/components/settings/account/avatar";
import DeleteAccount from "@/components/settings/account/delete";
import DisplayName from "@/components/settings/account/display-name";

export default function Account() {
    return (
        <main className="flex-1 overflow-y-auto">
            <div className="container mx-auto px-0 py-4 md:py-6 md:pl-6">
                <div className="flex flex-col gap-4 md:gap-6">
                    {/* Avatar Card */}
                    <SettingsAvatar />
                    {/* Display Name Card */}
                    <DisplayName />


                    {/* Delete Account Card */}
                    <DeleteAccount />
                </div>
            </div>
        </main>
  );
}
