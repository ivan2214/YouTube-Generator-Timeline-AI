"use server";

import type { z } from "zod";

import { db } from "@/db";
import { profileSchema } from "@/schemas/profile";
import { getCurrentUser } from "@/hooks/current-user";
import { revalidatePath } from "next/cache";

export async function updateProfile(values: z.infer<typeof profileSchema>) {
  try {
    const { currentUser } = await getCurrentUser();

    if (!currentUser) {
      return { error: "Unauthorized" };
    }

    // Validate the input
    const validatedFields = profileSchema.safeParse(values);

    if (!validatedFields.success) {
      return { error: "Invalid fields" };
    }

    // Update the user in the database
    await db.user.update({
      where: {
        id: currentUser.id,
      },
      data: {
        name: validatedFields.data.name,
      },
    });

    return { success: "Profile updated" };
  } catch (error) {
    console.error("Profile update error:", error);
    return { error: "Something went wrong" };
  } finally {
    revalidatePath("/profile");
  }
}
