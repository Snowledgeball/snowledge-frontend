import prisma from "../../lib/prisma";

export default async function handler(req, res) {
  if (req.method === "GET") {
    const users = await prisma.user.findMany();
    return res.status(200).json(users);
  }

  if (req.method === "POST") {
    const {
      fullName,
      username,
      profilePhoto,
      starknetAddress,
      email,
      password,
    } = req.body;
    try {
      const newUser = await prisma.user.create({
        data: {
          fullName,
          username,
          profilePhoto,
          starknetAddress,
          email,
          password,
        },
      });
      return res.status(201).json(newUser);
    } catch (error) {
      return res
        .status(400)
        .json({
          message: "Erreur lors de la création de l’utilisateur",
          error,
        });
    }
  }

  return res.status(405).json({ message: "Méthode non autorisée" });
}
