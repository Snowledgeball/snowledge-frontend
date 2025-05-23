"use client";

import { FormDataSignIn } from "@/shared/interfaces/ISignIn";
import { Logo, Button, Checkbox, Input, Label } from "@repo/ui";
import Link from "next/link";
import { redirect } from "next/navigation";
import { useState } from "react";

export default function SignInForm() {
    const [formData, setFormData] = useState<FormDataSignIn>({
        email: '',
        password: '',
    });
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({
            ...formData,
            [event.target.name]: event.target.value,
        });
    };
    const submitSignIn = async () => {
        console.log('submit')
        setError("");
        setSuccess("");

        try {
            const response = await fetch('http://localhost:4000/auth/sign-in', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData),
            });
            if (!response.ok) {
                throw new Error("Login failed. Please try again.");
            }
            const data = await response.json();
            console.log(data);
            redirect('/');
        } catch (err: any) {
            setError(err.message || "An unexpected error occurred.");
        }
    }
    return (
        <>
            <div className="md:w-1/2 flex items-center justify-center">
                <div className="max-w-sm px-6 py-16 md:p-0 w-full ">
                {/* Header section with logo and title */}
                <div className="space-y-6 mb-6">
                    <Link href="https://www.shadcndesign.com/" target="_blank">
                        <Logo />
                    </Link>
                    {/* Title and description */}
                    <div className="flex flex-col gap-y-3">
                        <h1 className="text-2xl md:text-3xl font-bold">Sign in</h1>
                        <p className="text-muted-foreground text-sm">
                            Log in to unlock tailored content and stay connected with your
                            community.
                        </p>
                    </div>
                </div>
                {/* Sign-in form */}
                <div className="space-y-4 mb-6">
                    {/* Email input */}
                    <div className="space-y-2">
                        <Label htmlFor="email">Email</Label>
                        <Input 
                            id="email" 
                            name="email" 
                            placeholder="Email" 
                            type="email" 
                            value={formData.email}
                            onChange={handleInputChange}  
                        />
                    </div>
                    {/* Password input */}
                    <div className="space-y-2">
                        <Label htmlFor="password">Password</Label>
                        <Input
                            id="password"
                            name="password" 
                            placeholder="Password"
                            type="password"
                            value={formData.password}
                            onChange={handleInputChange} 
                        />
                    </div>
                    {/* Remember me checkbox and Forgot password link */}
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                            <Checkbox id="keep-signed-in" />
                            <Label htmlFor="keep-signed-in" className="text-sm font-medium">
                                Keep me signed in
                            </Label>
                        </div>
                        <Link
                            href=""
                            className="text-sm text-muted-foreground hover:text-foreground underline"
                        >
                            Forgot password?
                        </Link>
                    </div>
                </div>
                {/* Sign-in button and Sign-up link */}
                <div className="flex flex-col space-y-4">
                    {error && <p className="text-sm text-red-500">{error}</p>}
                    {success && <p className="text-sm text-green-600">{success}</p>}
                    <Button className="w-full"  onClick={submitSignIn}>Sign in</Button>
                        <p className="text-sm text-center text-muted-foreground">
                            Don&apos;t have an account?{" "}
                        <Link className="underline text-foreground" href="/sign-up">
                            Sign up
                        </Link>
                    </p>
                </div>
                </div>
            </div>
        </>
    );
}
