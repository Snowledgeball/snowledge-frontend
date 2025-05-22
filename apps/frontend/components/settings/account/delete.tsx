"use client";

import { 
    Avatar, 
    AvatarImage,
    Button,
    Card 
} from "@repo/ui";
import { Upload } from "lucide-react";


export default function DeleteAccount() {
    return (
        <Card className="border border-destructive rounded-lg shadow-sm">
            <div className="p-4 md:p-6">
                <div className="space-y-1">
                    <h2 className="text-xl font-semibold">
                        Delete account
                    </h2>
                    <p className="text-sm text-muted-foreground">
                        This will permanently delete your Personal Account.
                        Please note that this action is irreversible, so
                        proceed with caution.
                    </p>
                </div>
            </div>
            <div className="py-4 px-4 md:px-6 border-t flex flex-col md:flex-row items-start md:items-center gap-3 justify-between bg-destructive/10">
                <p className="text-sm text-destructive">
                This action cannot be undone!
                </p>
                <Button variant="destructive">Delete account</Button>
            </div>
        </Card>
    );
}
