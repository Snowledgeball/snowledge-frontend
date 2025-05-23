"use client";

import { Gender } from "@/shared/enums/Gender";
import { FormDataSignUp, ISignUp } from "@/shared/interfaces/ISignUp";
import { getEnumKeys } from "@/utils/get-enum-keys";
import { Logo, Button, Checkbox, Input, Label, Select, SelectTrigger, SelectValue, SelectItem, SelectContent, Popover, PopoverTrigger, PopoverContent, Calendar } from "@repo/ui";
import { cn } from "@workspace/ui/lib/utils";
import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";
import React, { useState } from 'react';


export default function SignUpForm() {
    
    const [formData, setFormData] = useState<FormDataSignUp>({
        gender: undefined,
        firstname: '',
        lastname: '',
        pseudo: '',
        email: '',
        age: undefined,
        password: '',
        confirmPwd: '',
    });
    const [termsAccepted, setTermsAccepted] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({
            ...formData,
            [event.target.name]: event.target.value,
        });
    };
    const validateForm = () => {
        const { gender, firstname, lastname, pseudo, email, age, password, confirmPwd } = formData;
        if (!gender || !firstname || !lastname || !pseudo || !email || !age || !password || !confirmPwd) {
            return "All fields are required.";
        }
        if (password.length < 8) {
            return "Password must be at least 8 characters.";
        }
        if (password !== confirmPwd) {
            return "Passwords do not match.";
        }
        if (!termsAccepted) {
            return "You must accept the Terms & Conditions.";
        }
        return null;
    };
    const submitRegistration = async () => {
        console.log('submit')
        setError("");
        setSuccess("");

        const validationError = validateForm();
        if (validationError) {
            setError(validationError);
            return;
        }

        try {
            const { confirmPwd, ...rest } = formData;
            const signUp: ISignUp = rest;
            const response = await fetch('http://localhost:4000/auth/sign-up', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(signUp),
            });
            if (!response.ok) {
                throw new Error("Registration failed. Please try again.");
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
            <div className="flex md:items-center justify-center min-h-screen bg-background">
            {/* Content wrapper with max width */}
                <div className="w-full max-w-md p-8 space-y-8">
                    {/* Header section with logo and text */}
                    <div className="text-center flex flex-col items-center gap-6">
                        <Logo />
                        {/* Title and subtitle */}
                        <div className="space-y-3">
                            <h2 className="text-2xl md:text-3xl font-bold">
                                Create an account
                            </h2>
                            <p className="text-sm text-muted-foreground">
                                Let's get started. Fill in the details below to create your
                                account.
                            </p>
                        </div>
                    </div>

                    {/* Form inputs section */}
                    <div className="space-y-4">

                        <Select 
                            value={formData.gender !== undefined ? Gender[formData.gender] : ""} 
                            onValueChange={(value: keyof typeof Gender) => 
                                setFormData({
                                    ...formData,
                                    gender: Gender[value],
                                }) 
                            }
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="Select a gender" />
                            </SelectTrigger>
                            <SelectContent>
                                {
                                    getEnumKeys(Gender).map((key, index) =>(
                                        <SelectItem key={index} value={key}>{key}</SelectItem>
                                    ))
                                }
                                {/* Add more states as needed */}
                            </SelectContent>
                        </Select>
                        {/* Name input field */}
                        <Input 
                            type="text" 
                            name="firstname" 
                            placeholder="Firstname" 
                            value={formData.firstname}
                            onChange={handleInputChange} 
                        />
                        <Input 
                            type="text" 
                            name="lastname" 
                            placeholder="Lastname" 
                            value={formData.lastname}
                            onChange={handleInputChange} 
                        />
                        <Input 
                            type="text" 
                            name="pseudo" 
                            placeholder="Pseudo" 
                            value={formData.pseudo}
                            onChange={handleInputChange} 
                        />
                        <Popover>
                            <PopoverTrigger asChild>
                                <Button
                                variant={"outline"}
                                className={cn(
                                    "w-[240px] justify-start text-left font-normal",
                                    !formData.age && "text-muted-foreground"
                                )}
                                >
                                <CalendarIcon />
                                {formData.age ? format(formData.age, "PPP") : <span>Pick a date</span>}
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0" align="start">
                                <Calendar
                                    mode="single"
                                    selected={formData.age}
                                    onSelect={value => setFormData({
                                        ...formData,
                                        age: value,
                                    })}
                                    initialFocus
                                />
                            </PopoverContent>
                        </Popover>
                        {/* Email input field */}
                        <Input 
                            type="email" 
                            name="email" 
                            placeholder="Email" 
                            value={formData.email}
                            onChange={handleInputChange}                             
                        />

                        {/* Password input field with helper text */}
                        <div className="space-y-2">
                            <Input 
                                type="password" 
                                name="password" 
                                placeholder="Password"
                                value={formData.password}
                                onChange={handleInputChange} 
                            />
                            <p className="text-sm text-muted-foreground">
                            Minimum 8 characters.
                            </p>
                        </div>
                        <div className="space-y-2">
                            <Input 
                                type="password" 
                                name="confirmPwd" 
                                placeholder="Confirm password" 
                                value={formData.confirmPwd}
                                onChange={handleInputChange} 
                            />
                        </div>
                        {/* Terms and conditions checkbox with link */}
                        <div className="flex items-center space-x-2">
                            <Checkbox id="terms" checked={termsAccepted} onCheckedChange={() => setTermsAccepted((prev) => !prev)}/>
                            <label htmlFor="terms" className="text-sm leading-none ">
                                I agree to the{" "}
                                <Link href="/cgu" target="_blank" rel="noreferrer" className="underline">
                                    Terms & Conditions
                                </Link>
                            </label>
                        </div>
                    </div>

                    {/* Footer section with sign up button and sign in link */}
                    <div className="space-y-6">
                        {error && <p className="text-sm text-red-500">{error}</p>}
                        {success && <p className="text-sm text-green-600">{success}</p>}
                        <Button className="w-full" onClick={submitRegistration}>Sign up</Button>
                        <p className="text-sm text-center text-muted-foreground">
                            Already have an account?{" "}
                            <Link href="#" className="text-primary underline">
                                Sign in
                            </Link>
                        </p>
                    </div>
                </div>
            </div>
        </>
    );
}
