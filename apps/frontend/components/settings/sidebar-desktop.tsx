"use client";

import Link from "next/link";
import { usePathname } from 'next/navigation';
import { useEffect, useState } from "react";

export default function SettingsSideBarDesktop() {
    const pathname = usePathname();
    const [page, setPage] = useState('');

    useEffect(() => {
        if(pathname.split('/').length > 2){
            setPage(pathname.split('/')[2]);
        }
    }, [pathname])
    return (
        <ul className="space-y-1 -ml-3">
            <Link href="/profile">
                <li className={`hover:bg-accent-foreground/10 ${page === 'profile' && "bg-accent-foreground/5"} rounded-md px-3 py-2 text-sm text-accent-foreground font-medium cursor-pointer`}>
                    Profile
                </li>
            </Link>
            <Link href="/account">
                <li className={`hover:bg-accent-foreground/10 ${page === 'account' && "bg-accent-foreground/5"} rounded-md px-3 py-2 text-sm text-accent-foreground font-medium cursor-pointer`}>
                    Account
                </li>
            </Link>
            <Link href="/notifications">
                <li className={`hover:bg-accent-foreground/10 ${page === 'notifications' && "bg-accent-foreground/5"} rounded-md px-3 py-2 text-sm text-accent-foreground font-medium cursor-pointer`}>
                    Notifications
                </li>
            </Link>
        </ul>
    );
}
