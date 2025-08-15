// app/models/user.server.ts
import { db } from "~/utils/db.server";
import bcrypt from "bcryptjs";

/**
 * Create a new user with a hashed password
 */
export async function createUser(email: string, password: string) {
  const hashedPassword = await bcrypt.hash(password, 10);

  return db.user.create({
    data: {
      email,
      password: hashedPassword, // Store hashed password
    },
  });
}

/**
 * Get a user by their unique ID
 */
export async function getUserById(id: string) {
  return db.user.findUnique({
    where: { id },
  });
}

/**
 * Get a user by their email address
 */
export async function getUserByEmail(email: string) {
  return db.user.findUnique({
    where: { email },
  });
}

/**
 * Verify a user's login credentials
 * Returns the user if valid, otherwise null
 */
export async function verifyLogin(email: string, password: string) {
  const user = await getUserByEmail(email);
  console.log("User found:", user);
  if (!user) return null;

  const isValid = await bcrypt.compare(password, user.password);
   console.log("Password valid:", isValid);
  if (!isValid) return null;

  return user;
}
