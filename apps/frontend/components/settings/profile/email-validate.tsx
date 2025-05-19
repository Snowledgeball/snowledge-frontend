"use client";

import { Card, CardContent } from "@repo/ui";
import { Terminal } from "lucide-react";

export default function EmailValidate() {
  return (
        <Card className="mb-4 bg-primary text-primary-foreground">
            <CardContent className="flex flex-col md:flex-row justify-between items-start md:items-center p-4 md:p-6">
                <div className="mb-4 md:mb-0">
                    <div className="flex items-center gap-2">
                        <Terminal className="h-5 w-5" />
                        <h3 className="font-semibold">Email Validate</h3>
                    </div>
                    <p className="text-sm mt-1 text-primary-foreground/80">
                        You can fully enjoy our platform now.
                    </p>
                </div>
            </CardContent>
        </Card>
    );
}
