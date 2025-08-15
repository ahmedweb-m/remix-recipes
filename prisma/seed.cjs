

const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();



async function seed() {
  await prisma.recipe.deleteMany();

  await prisma.recipe.createMany({
    data: [
      {
        title: "Spaghetti Bolognese",
        description: "Classic Italian pasta dish with meat sauce.",
        imageUrl: "https://source.unsplash.com/400x300/?spaghetti",
        ingredients: JSON.stringify(["Spaghetti", "Beef", "Tomato", "Onion", "Garlic"]),
        instructions: JSON.stringify([
          "Boil spaghetti.",
          "Cook beef with onion and garlic.",
          "Add tomato sauce.",
          "Serve with pasta.",
        ]),
        userId: user.id,
      },
      {
        title: "Chicken Curry",
        description: "Spicy and flavorful chicken curry.",
        imageUrl: "https://source.unsplash.com/400x300/?chicken-curry",
        ingredients: JSON.stringify(["Chicken", "Onion", "Garlic", "Curry powder", "Coconut milk"]),
        instructions: JSON.stringify([
          "Sauté onion and garlic.",
          "Add chicken and curry powder.",
          "Pour coconut milk and simmer.",
          "Serve with rice.",
        ]),
        userId: user.id,
      },
    ],
  });

  console.log("Database seeded!");
  await prisma.$disconnect();
}

seed();
