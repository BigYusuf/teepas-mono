require("dotenv").config();
const { PrismaClient } = require("@prisma/client");

const { initializeSiteConfig } = require("./seed/initializeSiteConfig");
const { seedTasks } = require("./seed/initTaskSeed");
const { seedRolesAndPermissions } = require("./seed/initRolesPermSeed");
const { seedAmenities } = require("./seed/initAmenitiesSeed");

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding database");

  await seedRolesAndPermissions();
  await seedAmenities();
  await initializeSiteConfig();
  await seedTasks();
  console.log("Seeding completed");
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
