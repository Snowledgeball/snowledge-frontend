"use client";

import Link from "next/link";


export default function SettingsSideBarDesktop() {
    return (
        <ul className="space-y-1 -ml-3">
            <li className="hover:bg-accent-foreground/10 bg-accent-foreground/5 rounded-md px-3 py-2 text-sm text-accent-foreground font-medium cursor-pointer">
                <Link href="/profile">Profile</Link>
            </li>
            <li className="hover:bg-accent-foreground/10 rounded-md px-3 py-2 text-sm text-muted-foreground font-medium cursor-pointer">
                <Link href="/account">Account</Link>
            </li>
            <li className="hover:bg-accent-foreground/10 rounded-md px-3 py-2 text-sm text-muted-foreground font-medium cursor-pointer">
                <Link href="/notifications">Notifications</Link>
            </li>
        </ul>
    );
}
