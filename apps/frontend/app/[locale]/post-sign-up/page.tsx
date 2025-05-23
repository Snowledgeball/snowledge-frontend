"use client";

import Link from "next/link";
import { PlusCircle, Users } from "lucide-react";
import { useState } from "react";
import { Button } from "@repo/ui";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@repo/ui";
import { Input } from "@repo/ui";
import { useAllCommunities } from "@/hooks/use-all-communities";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useTranslations } from "next-intl";

export default function PostSignUp() {
  const [communityInput, setCommunityInput] = useState("");
  const [inputError, setInputError] = useState(false);
  const [notFound, setNotFound] = useState(false);
  const { data: communities } = useAllCommunities();
  const router = useRouter();
  const t = useTranslations("postSignUp");

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
    <div className="flex min-h-screen flex-col items-center justify-center bg-background p-4">
      <Card className="mx-auto w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">{t("title")}</CardTitle>
          <CardDescription>{t("description")}</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-6">
          <div className="flex flex-col gap-3">
            <Button asChild size="lg" className="h-16 gap-2 text-lg">
              <Link href="/create-community">
                <PlusCircle className="h-5 w-5" />
                {t("create_button")}
              </Link>
            </Button>
            <p className="text-sm text-muted-foreground px-1">
              {t("create_description")}
            </p>
          </div>

          <div className="flex flex-col gap-3">
            <Button
              asChild
              variant="outline"
              size="lg"
              className="h-16 gap-2 text-lg cursor-pointer"
              onClick={() => {
                handleJoinCommunity();
              }}
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
        </CardContent>
      </Card>
    </div>
  );
}
