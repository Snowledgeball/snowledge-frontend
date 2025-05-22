"use client";

import { 
    Avatar, 
    AvatarImage,
    Button,
    Card 
} from "@repo/ui";
import { Upload } from "lucide-react";


export default function SettingsAvatar() {
    return (
        <Card className="border border-border rounded-lg shadow-sm">
            <div className="p-4 md:p-6">
                <div className="space-y-1">
                <h2 className="text-lg md:text-xl font-semibold">
                    Avatar
                </h2>
                <p className="text-sm text-muted-foreground">
                    Avatar is your profile picture - everyone who visits
                    your profile will see this.
                </p>
                </div>
            </div>
            <div className="px-4 pb-6 md:px-6 flex items-start gap-4">
                <Avatar className="h-10 w-10">
                    <AvatarImage
                        src="https://github.com/shadcn.png"
                        alt="User avatar"
                    />
                </Avatar>
                <Button variant="outline">
                <Upload />
                    Upload
                </Button>
            </div>
            <div className="px-4 py-4 md:px-6 border-t flex items-center justify-start md:justify-end">
                <Button>Save</Button>
            </div>
        </Card>
    );
}
