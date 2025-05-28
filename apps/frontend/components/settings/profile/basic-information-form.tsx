"use client";

import { 
  Button, 
  Label,
  Input,
} from "@repo/ui";


export default function BasicInformationForm() {
  return (
        <div className="col-span-8 lg:col-span-4 space-y-4 md:space-y-6">
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
           
  );
}
