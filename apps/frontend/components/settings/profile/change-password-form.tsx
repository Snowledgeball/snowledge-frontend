"use client";

import { 
  Button, 
  Label,
  Input,
} from "@repo/ui";

export default function ChangePasswordForm() {
    return (
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
    );
}
