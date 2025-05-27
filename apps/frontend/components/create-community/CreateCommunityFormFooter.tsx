import { CardFooter, Button } from "@repo/ui";

export function CreateCommunityFormFooter({ t }: any) {
  return (
    <CardFooter className="flex flex-col gap-2">
      <Button type="submit" className="w-full">
        {t("create.submit")}
      </Button>
      <p className="text-xs text-muted-foreground text-center">
        {t("create.footerHelp")}
      </p>
    </CardFooter>
  );
}
