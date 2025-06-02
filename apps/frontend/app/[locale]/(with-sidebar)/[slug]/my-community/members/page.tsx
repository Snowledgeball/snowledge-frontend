"use client";
import { useParams } from "next/navigation";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  Input,
} from "@repo/ui";
import { useState } from "react";
import { useTranslations } from "next-intl";
import { useMemberMutations } from "@/components/manage-members/hooks/useMemberMutations";
import { MemberActions } from "@/components/manage-members/MemberActions";
import { useMembersQuery } from "@/components/manage-members/hooks/useMembersQuery";
import { Member } from "@/types/member";
import { features } from "@/config/features";
import { notFound } from "next/navigation";

export default function Page() {
  const { slug } = useParams();
  if (!features.community.myCommunity.members) {
    notFound();
  }
  const [search, setSearch] = useState("");
  const t = useTranslations("members");

  // Fetch des membres
  const {
    data: members = [],
    isLoading,
    isError,
  } = useMembersQuery(slug as string);

  const { deleteMutation, promoteMutation } = useMemberMutations(
    slug as string
  );

  // Filtrage
  const filteredMembers = members.filter((m: Member) => {
    const name = `${m.user.firstname} ${m.user.lastname}`.toLowerCase();
    return (
      name.includes(search.toLowerCase()) ||
      m.user.email.toLowerCase().includes(search.toLowerCase())
    );
  });

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-6">{t("title")}</h1>
      <div className="mb-4 flex items-center gap-4">
        <Input
          placeholder={t("search_placeholder")}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-64"
        />
      </div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>{t("role_member")}</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>{t("role_contributor")}</TableHead>
            <TableHead>{t("added_on")}</TableHead>
            <TableHead>{t("actions")}</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filteredMembers.map((member: Member) => (
            <TableRow key={member.id}>
              <TableCell>
                {member.user.firstname} {member.user.lastname}
              </TableCell>
              <TableCell>{member.user.email}</TableCell>
              <TableCell>
                <span className="capitalize">
                  {member.isContributor
                    ? t("role_contributor")
                    : t("role_member")}
                </span>
              </TableCell>
              <TableCell>
                {new Date(member.created_at).toLocaleDateString("fr-FR")}
              </TableCell>
              <TableCell>
                <MemberActions
                  member={member}
                  promoteMutation={promoteMutation}
                  deleteMutation={deleteMutation}
                  t={t}
                />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      {filteredMembers.length === 0 && !isLoading && (
        <div className="text-center text-muted-foreground mt-8">
          {t("no_member")}
        </div>
      )}
      {isLoading && <div>{t("loading")}</div>}
      {isError && <div className="text-red-500 mt-4">{t("error")}</div>}
    </div>
  );
}
