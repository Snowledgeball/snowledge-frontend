    import { useTranslations } from "next-intl";
    import { Input } from "@repo/ui/components/input";
    import {
    Select,
    SelectTrigger,
    SelectContent,
    SelectItem,
    SelectValue,
    } from "@repo/ui/components/select";
    import { MultiSelectCombobox } from "@repo/ui/components/combobox";
    import { Separator } from "@repo/ui/components/separator";
    import { Button } from "@repo/ui/components/button";
import { useState } from "react";
interface FormPOC  {
    firstname: string,
    lastname: string,
    email: string,
    expertise: string,
    communitySize: string,
    platforms: string[],
}
export function PocForm() {
    const tForm = useTranslations("form");
    const [formData, setFormData] = useState<FormPOC>({
        firstname: '',
        lastname: '',
        email: '',
        expertise: '',
        communitySize: '',
        platforms: [],
    });
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({
            ...formData,
            [event.target.name]: event.target.value,
        });
    };
    const submitFormPOC = async () => {
        const { firstname, lastname, expertise, email, communitySize, platforms } = formData;
        if (!firstname || !lastname || !expertise || !email || !communitySize || !platforms ) {
            return "All fields are required.";
        }
        try {

            const response = await fetch('http://localhost:4000/snow-test-register', {
                method: 'POST',
                credentials: 'include',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData),
            });
            if (!response.ok) {
                throw new Error("Registration failed. Please try again.");
            }
            // const data = await response.json();
            setSuccess('Registration made')
        } catch (err: any) {
            setError(err.message || "An unexpected error occurred.");
        }
    }
    return (
        <div className="flex flex-col gap-4 p-2">
            <div className="flex gap-2">
                <Input
                    name="lastname"
                    type="text"
                    placeholder={tForm("lastname")}
                    onChange={handleInputChange} 
                    value={formData.lastname}
                    required
                />
                <Input
                    name="firstname"
                    type="text"
                    placeholder={tForm("firstname")}
                    onChange={handleInputChange} 
                    value={formData.firstname}
                    required
                />
            </div>
            <Input 
                name="email" 
                type="email" 
                placeholder={tForm("email")} 
                onChange={handleInputChange} 
                value={formData.email}
                required 
            />
            <Separator className="my-4" />
            <div>
                <label className="block font-medium mb-1">{tForm("expertise")}</label>
                <Select 
                    value={formData.expertise ?? ''}
                    onValueChange={(value) => {
                        if(formData.expertise !== value) {
                            setFormData(prev => ({
                                ...prev,
                                expertise: value,
                            })) 
                        }
                    }}
                    name="expertise" 
                    // required
                >
                    <SelectTrigger className="w-full">
                        <SelectValue placeholder={tForm("expertise_placeholder")} />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="Tech">Tech</SelectItem>
                        <SelectItem value="Finance">Finance</SelectItem>
                        <SelectItem value="Business">Business</SelectItem>
                    </SelectContent>
                </Select>
            </div>
            <Separator className="my-4" />
            <div>
                <label className="block font-medium mb-1">
                    {tForm("community_size")}
                </label>
                <Select 
                    value={formData.communitySize ?? ''}
                    name="communitySize"
                    onValueChange={(value) => {
                        if(formData.communitySize !== value) {
                            setFormData(prev=>({
                                ...prev,
                                communitySize: value,
                            })) 
                        }
                    }}
                    required
                >
                    <SelectTrigger className="w-full">
                        <SelectValue placeholder={tForm("community_size_placeholder")} />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="0">
                        {tForm("community_size_less_than_100")}
                        </SelectItem>
                        <SelectItem value="100">
                        {tForm("community_size_more_than_100")}
                        </SelectItem>
                    </SelectContent>
                </Select>
            </div>
            <Separator className="my-4" />
            <div>
                <label className="block font-medium mb-1">{tForm("platforms")}</label>
                <MultiSelectCombobox
                    value={formData.platforms || []}
                    name="plateformes"
                    options={[
                        { value: "Discord", label: "Discord" },
                        { value: "WhatsApp", label: "WhatsApp" },
                        { value: "YouTube", label: "YouTube" },
                        { value: "LinkedIn", label: "LinkedIn" },
                        { value: "Spotify", label: "Spotify" },
                    ]}
                    placeholder={tForm("platforms_placeholder")}
                    onChange={(selected)=>{
                        if (JSON.stringify(formData.platforms) !== JSON.stringify(selected)) {
                            setFormData((prev) => ({ ...prev, platforms: selected }));
                        }
                    }}
                />
            </div>
            {error && <p className="text-sm text-red-500">{error}</p>}
            {success && <p className="text-sm text-green-600">{success}</p>}
            <Button onClick={submitFormPOC} className="w-full mt-2">
                {tForm("submit")}
            </Button>
        </div>
    );
}
