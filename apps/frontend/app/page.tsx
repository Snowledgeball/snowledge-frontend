// app/page.tsx
"use client";

import { Settings } from "@/components/settings";

// import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
// import { useState } from "react";
// import { Setting } from "@repo/ui";
// interface User {
//   id: number;
//   name: string;
// }

// const fetchUsers = async () => {
//   const res = await fetch("http://localhost:4000/user");
//   return res.json();
// };

// const postUser = async (name: string) => {
//   const res = await fetch("http://localhost:4000/user", {
//     method: "POST",
//     headers: { "Content-Type": "application/json", "x-auth-token": "12345" },
//     body: JSON.stringify({ name }),
//   });
//   return res.json();
// };

export default function Home() {
  // const [name, setName] = useState("");
  // const queryClient = useQueryClient();

  // const { data: users = [], isLoading } = useQuery({
  //   queryKey: ["users"],
  //   queryFn: fetchUsers,
  // });

  // const mutation = useMutation({
  //   mutationFn: postUser,
  //   onSuccess: (data) => {
  //     queryClient.invalidateQueries({ queryKey: ["users"] });
  //     setName("");
  //     console.log(data);
  //   },
  //   onError: (error) => {
  //     console.log(error);
  //   },
  // });

  // const handleSubmit = (e: React.FormEvent) => {
  //   e.preventDefault();
  //   if (name.trim()) mutation.mutate(name);
  // };

  return (
    <div>Home</div>
  )
  // return (
  //   <div className="flex flex-col items-center justify-center h-screen space-y-4">
  //     <h1 className="text-4xl font-bold">Utilisateurs</h1>
  //     <Button type="submit">Click 3</Button>

  //     <form onSubmit={handleSubmit} className="flex space-x-2">
  //       <input
  //         value={name}
  //         onChange={(e) => setName(e.target.value)}
  //         placeholder="Nom"
  //         className="border px-2 py-1 rounded"
  //       />
  //       <button
  //         type="submit"
  //         className="bg-blue-600 text-white px-4 py-1 rounded"
  //         disabled={mutation.isPending}
  //       >
  //         {mutation.isPending ? "Ajout en cours..." : "Ajouter"}
  //       </button>
  //     </form>

  //     {mutation.isError && (
  //       <p className="text-red-500">
  //         {mutation.error?.message || "Une erreur est survenue"}
  //       </p>
  //     )}

  //     {mutation.isSuccess && (
  //       <p className="text-green-500">
  //         {mutation.data.message + " " + mutation.data.user.name ||
  //           "Utilisateur ajouté avec succès"}
  //       </p>
  //     )}

  //     {isLoading ? (
  //       <p>Chargement...</p>
  //     ) : (
  //       <ul className="mt-4 space-y-1">
  //         {users.map((user: User) => (
  //           <li key={user.id} className="text-lg">
  //             {user.name}
  //           </li>
  //         ))}
  //       </ul>
  //     )}
  //   </div>
  // );
}
