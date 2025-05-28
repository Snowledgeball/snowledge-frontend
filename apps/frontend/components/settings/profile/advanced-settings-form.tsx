"use client";

import { useRouter, useSearchParams } from 'next/navigation'
import { 
  Button,
} from "@repo/ui";
import { useEffect } from 'react';
import { useAuth } from '@/contexts/auth-context';

export default function AdvancedSettingsForm() {
    const router = useRouter();
    const verify = useSearchParams().get("verify");
    const { user, fetchDataUser } = useAuth();
    const routeDiscored = "https://discord.com/oauth2/authorize?client_id=1377001604179558491&response_type=code&redirect_uri=http%3A%2F%2Flocalhost%3A4000%2Fdiscord%2Flink&scope=identify+guilds+email+messages.read+connections";
    const discordAuth = () => {
        router.push(routeDiscored);
    }
    useEffect(()=>{
        if(verify === 'discord'){
            fetchDataUser();
        }
    }, [verify])

    return (
        <div className="col-span-8 lg:col-span-4 space-y-4 md:space-y-6">
            <div className="flex items-top space-x-2">
            {/* <Checkbox id="data-export" /> */}
            <div className="grid gap-1.5 leading-none">
                <label
                    htmlFor="data-export"
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                    Discord Access
                </label>
                <button onClick={discordAuth} disabled={user?.discordAccess} className="text-sm text-muted-foreground">
                    Connect discord
                </button>
            </div>
            </div>
            <div className="flex items-top space-x-2">
            {/* <Checkbox id="admin-add" /> */}
                <div className="grid gap-1.5 leading-none">
                    <label
                        htmlFor="admin-add"
                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                    >
                        Youtube Access
                    </label>
                    <p className="text-sm text-muted-foreground">
                        Connect youtube
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
