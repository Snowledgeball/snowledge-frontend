"use client";

import SignInForm from "@/components/sign-in/sign-in-form";
import SignInImage from "@/components/sign-in/sign-in-image";
export default function SignIn() {
  return (
    <div className="md:flex md:min-h-screen bg-background md:p-6 py-6 gap-x-6">
      {/* Left side: Sign-in form */}
        <SignInForm />
      {/* Right side: Image (hidden on mobile) */}
        <SignInImage />
    </div>
  );
}
