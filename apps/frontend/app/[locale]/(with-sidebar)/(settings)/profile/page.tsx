"use client";

import BasicInformationText from "@/components/settings/profile/basic-information-text";
import BasicInformationForm from "@/components/settings/profile/basic-information-form";
import ChangePasswordText from "@/components/settings/profile/change-password-text";
import ChangePasswordForm from "@/components/settings/profile/change-password-form";
import AdvancedSettingsText from "@/components/settings/profile/advanced-settings-text";
import AdvancedSettingsForm from "@/components/settings/profile/advanced-settings-form";
import { Separator } from "@repo/ui";
import EmailValidate from "@/components/settings/profile/email-validate";
import { useSearchParams } from "next/navigation";
import { useEffect } from "react";



export default function Settings() {
    const searchParams = useSearchParams();
    const token = searchParams.get('token');
    useEffect(() => {
        verifyToken()
    }, [])
    const verifyToken = async () => {
            console.log('submit')
    
            try {
                const response = await fetch('http://localhost:4000/auth/verify-token', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ token: token}),
                });
                if (!response.ok) {
                    throw new Error("Failed. Please try again.");
                }
                const data = await response.json();
                console.log(data);

            } catch (err: any) {
                setError(err.message || "An unexpected error occurred.");
            }
        }
    return (
        <>
          {/* Main content */}
            <main className="flex-1 overflow-y-auto">
                {(token) && <EmailValidate />}
                <div className="container mx-auto px-0 py-4 md:py-6 md:pl-6">
                    {/* Basic information section */}
                    <section className="grid grid-cols-1 lg:grid-cols-8 gap-4 mb-8">
                        <BasicInformationText />
                        <BasicInformationForm />
                    </section>

                    <Separator className="my-6" />

                    {/* Change password section */}
                    <section className="grid grid-cols-1 lg:grid-cols-8 gap-4 mb-8">
                        <ChangePasswordText />
                        <ChangePasswordForm />
                    </section>

                    <Separator className="my-6" />

                    {/* Advanced settings section */}
                    <section className="grid grid-cols-1 lg:grid-cols-8 gap-4 mb-8">
                        <AdvancedSettingsText />
                        <AdvancedSettingsForm />
                    </section>
                </div>
            </main>
        </>
    );
}
function setError(arg0: any) {
    throw new Error("Function not implemented.");
}

