import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  Button,
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from "@repo/ui";
import { MoreVertical } from "lucide-react";
import { useState } from "react";

export function MemberActions({
  member,
  promoteMutation,
  deleteMutation,
  t,
}: {
  member: any;
  promoteMutation: any;
  deleteMutation: any;
  t: any;
}) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon">
            <MoreVertical className="w-4 h-4" />
            <span className="sr-only">{t("actions")}</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuItem
            onClick={() => {
              promoteMutation.mutate({
                userId: member.user.id,
                isContributor: !member.isContributor,
              });
            }}
          >
            {member.isContributor ? t("demote") : t("promote")}
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => setOpen(true)}
            className="text-destructive"
          >
            {t("delete")}
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t("confirm_delete_title")}</DialogTitle>
            <DialogDescription>
              {t("confirm_delete_desc", {
                name: `${member.user.firstname} ${member.user.lastname}`,
              })}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">{t("cancel")}</Button>
            </DialogClose>
            <Button
              variant="destructive"
              onClick={() => {
                deleteMutation.mutate(member.user.id);
                setOpen(false);
              }}
              disabled={deleteMutation.isPending}
            >
              {t("delete")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
