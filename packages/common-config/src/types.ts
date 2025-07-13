import { email, z } from "zod";

export const CreateUserSchema = z
  .object({
    email: z.email(),
    username: z.string().min(3).max(15),
    password: z
      .string()
      .min(8)
      .max(20)
      .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#]).*$/),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });

export const SigninSchema = z.object({
  email: z.email(),
  username: z.string().min(3).max(15),
  password: z
    .string()
    .min(8)
    .max(20)
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#]).*$/),
});

export const CreateRoomSchema = z.object({
  name: z.string().min(3).max(10),
});
