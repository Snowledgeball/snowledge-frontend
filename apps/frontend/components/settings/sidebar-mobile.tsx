"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@repo/ui";
import Link from "next/link";


export default function SettingsSideBarMobile() {
    return (
        <div className="md:hidden">
            <Select defaultValue="profile">
                <SelectTrigger>
                    <SelectValue placeholder="Select setting" />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="profile">
                        <Link href="/profile">Profile</Link>
                    </SelectItem>
                    <SelectItem value="account">
                        <Link href="/account">Account</Link>
                    </SelectItem>
                    <SelectItem value="notifications">
                        <Link href="/notifications">notifications</Link>
                    </SelectItem>
                    {/* <SelectItem value="billing">Billing</SelectItem>
                    <SelectItem value="invoices">Invoices</SelectItem>
                    <SelectItem value="api">API</SelectItem> */}
                </SelectContent>
            </Select>
        </div>
    );
}
