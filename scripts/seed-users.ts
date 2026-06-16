import "dotenv/config";
import prisma from "@/lib/db";

import { clerkClient } from "@clerk/nextjs/server";

const main = async () => {
  const client = await clerkClient();
  const userList = await client.users.getUserList();

  console.log("Seeding users");

  for (const user of userList.data) {
    await prisma.user.upsert({
      where: {clerkId: user.id},
      update: {},
      create: {
        clerkId: user.id,
        username: user.username || "No username"
      },
    });
  }
};

main()
  .then(async () => {
    await prisma.$disconnect();
    process.exit(0);
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
