import { Input, Button } from "@repo/ui";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Users } from "lucide-react";
import { Community } from "@/types/community";

interface CommunityJoinFormProps {
  communities: Community[] | undefined;
  t: (key: string) => string;
}

export function CommunityJoinForm({ communities, t }: CommunityJoinFormProps) {
  const [communityInput, setCommunityInput] = useState("");
  const [inputError, setInputError] = useState(false);
  const [notFound, setNotFound] = useState(false);
  const router = useRouter();

  const handleJoinCommunity = () => {
    setInputError(false);
    setNotFound(false);

    const input = communityInput.trim();
    if (!input) {
      setInputError(true);
      return;
    }

    let community =
      communities?.find((c) => String(c.id) === input) ||
      communities?.find((c) => c.name === input) ||
      communities?.find((c) => c.slug === input);

    if (!community) {
      const match = input.match(/communities\/([^/\s]+)/i);
      if (match && match[1]) {
        community = communities?.find((c) => c.slug === match[1]);
      }
    }

    if (community) {
      toast.success(t("success_joined"));
      router.push(`/${community.slug}`);
    } else {
      setNotFound(true);
    }
  };

  return (
    <>
      <div className="flex flex-col gap-3">
        <Button
          asChild
          variant="outline"
          size="lg"
          className="h-16 gap-2 text-lg cursor-pointer"
          onClick={handleJoinCommunity}
        >
          <div className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            {t("join_button")}
          </div>
        </Button>
        <p className="text-sm text-muted-foreground px-1">
          {t("join_description")}
        </p>
      </div>
      <div className="mt-2">
        <Input
          placeholder={t("placeholder")}
          className={`w-full ${inputError ? "placeholder:text-red-600 font-bold" : ""}`}
          value={communityInput}
          onChange={(e) => {
            setCommunityInput(e.target.value);
            setInputError(false);
            setNotFound(false);
          }}
        />
        {inputError && (
          <p className="text-red-600 text-sm mt-1 font-semibold">
            {t("error_empty")}
          </p>
        )}
        {notFound && (
          <p className="text-red-600 text-sm mt-1 font-semibold">
            {t("error_not_found")}
          </p>
        )}
      </div>
    </>
  );
}
