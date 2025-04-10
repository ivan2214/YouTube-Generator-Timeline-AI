import Credentials from "next-auth/providers/credentials";
import GithubProvider from "next-auth/providers/github";
import GoogleProvider from "next-auth/providers/google";
import { CredentialsSignin, type NextAuthConfig } from "next-auth";
import bcrypt from "bcryptjs";
import { loginSchema } from "@/schemas/auth";
import { getUserByEmail } from "@/data/user";

class InvalidLoginError extends CredentialsSignin {
  code = "Invalid identifier or password";
}

export default {
  providers: [
    GithubProvider,
    GoogleProvider,
    Credentials({
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        const validateFields = loginSchema.safeParse(credentials);

        if (validateFields.success) {
          const { email, password } = validateFields.data;

          const user = await getUserByEmail(email);

          if (!user || !user.hashedPassword) {
            throw new InvalidLoginError();
          }

          const passwordMatch = await bcrypt.compare(
            password,
            user.hashedPassword
          );

          if (!passwordMatch) {
            throw new InvalidLoginError();
          }

          return user;
        }

        return null;
      },
    }),
  ],
} satisfies NextAuthConfig;
