"use client";

import { 
  Button, 
  Label,
  Input,
} from "@repo/ui";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@repo/ui";
import { Search } from "lucide-react";
import { Navbar } from "./navbar";



export function Settings() {
  return (
    <div className="min-h-screen bg-background">
      {/* Use the inline Navbar component */}
      <Navbar />
      <div className="bg-background border-b border-border">
        <div className="container mx-auto px-4 md:px-6 py-4 md:py-6 flex flex-col ">
          {/* Main content */}
          <div className="flex justify-between md:items-center gap-3 md:flex-row flex-col">
            <div className="space-y-2">
              <h1 className="text-2xl md:text-3xl font-bold tracking-tight">
                Settings
              </h1>
            </div>
            {/* Search */}
            <div className="relative md:max-w-xs w-full">
              <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              {/* <Input type="search" placeholder="Search" className="pl-8" /> */}
            </div>
            {/* Mobile-only dropdown */}
            <div className="md:hidden">
              <Select defaultValue="profile">
                <SelectTrigger>
                  <SelectValue placeholder="Select setting" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="profile">Profile</SelectItem>
                  <SelectItem value="account">Account</SelectItem>
                  <SelectItem value="members">Members</SelectItem>
                  <SelectItem value="billing">Billing</SelectItem>
                  <SelectItem value="invoices">Invoices</SelectItem>
                  <SelectItem value="api">API</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 md:px-6">
        <div className="flex flex-col md:flex-row">
          {/* Sidebar - hidden on mobile, no border */}
          <aside className="hidden md:block w-64 py-6 pr-6 border-r border-border">
            <ul className="space-y-1 -ml-3">
              <li className="hover:bg-accent-foreground/10 bg-accent-foreground/5 rounded-md px-3 py-2 text-sm text-accent-foreground font-medium cursor-pointer">
                <a>Profile</a>
              </li>
              <li className="hover:bg-accent-foreground/10 rounded-md px-3 py-2 text-sm text-muted-foreground font-medium cursor-pointer">
                <a>Account</a>
              </li>
              <li className="hover:bg-accent-foreground/10 rounded-md px-3 py-2 text-sm text-muted-foreground font-medium cursor-pointer">
                <a>Members</a>
              </li>
              <li className="hover:bg-accent-foreground/10 rounded-md px-3 py-2 text-sm text-muted-foreground font-medium cursor-pointer">
                <a>Billing</a>
              </li>
              <li className="hover:bg-accent-foreground/10 rounded-md px-3 py-2 text-sm text-muted-foreground font-medium cursor-pointer">
                <a>Invoices</a>
              </li>
              <li className="hover:bg-accent-foreground/10 rounded-md px-3 py-2 text-sm text-muted-foreground font-medium cursor-pointer">
                <a>API</a>
              </li>
            </ul>
          </aside>

          {/* Main content */}
          <main className="flex-1 overflow-y-auto">
            <div className="container mx-auto px-0 py-4 md:py-6 md:pl-6">
              {/* Basic information section */}
              <section className="grid grid-cols-1 lg:grid-cols-8 gap-4 mb-8">
                <div className="col-span-8 lg:col-span-4">
                  <h2 className="text-lg font-semibold mb-1">
                    Basic information
                  </h2>
                  <p className="text-sm text-muted-foreground">
                    View and update your personal details and account
                    information.
                  </p>
                </div>
                <div className="col-span-8 lg:col-span-4 space-y-4 md:space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="username">Username</Label>
                    <Input id="username" value="nicol43" readOnly />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="firstname">First name</Label>
                    <Input id="firstname" value="Stephanie" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lastname">Last name</Label>
                    <Input id="lastname" value="Nicol" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email address</Label>
                    <Input
                      id="email"
                      type="email"
                      value="stephanie_nicol@mail.com"
                    />
                  </div>
                  <Button>Save</Button>
                </div>
              </section>

              {/* <Separator className="my-6" /> */}

              {/* Change password section */}
              <section className="grid grid-cols-1 lg:grid-cols-8 gap-4 mb-8">
                <div className="col-span-8 lg:col-span-4">
                  <h2 className="text-lg font-semibold mb-1">
                    Change password
                  </h2>
                  <p className="text-sm text-muted-foreground">
                    Update your password to keep your account secure.
                  </p>
                </div>
                <div className="col-span-8 lg:col-span-4 space-y-4 md:space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="current-password">
                      Verify current password
                    </Label>
                    <Input
                      id="current-password"
                      type="password"
                      value="••••••••••"
                    />
                  </div>
                  <div className="flex flex-col gap-2">
                    <div className="space-y-2">
                      <Label htmlFor="new-password">New password</Label>
                      <Input
                        id="new-password"
                        type="password"
                        value="••••••••••"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="confirm-password">Confirm password</Label>
                    <Input
                      id="confirm-password"
                      type="password"
                      value="••••••••••"
                    />
                  </div>
                  <Button>Save</Button>
                </div>
              </section>

              {/* <Separator className="my-6" /> */}

              {/* Advanced settings section */}
              <section className="grid grid-cols-1 lg:grid-cols-8 gap-4 mb-8">
                <div className="col-span-8 lg:col-span-4">
                  <h2 className="text-lg font-semibold mb-1">
                    Advanced settings
                  </h2>
                  <p className="text-sm text-muted-foreground">
                    Configure detailed account preferences and security options.
                  </p>
                </div>
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
              </section>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}
