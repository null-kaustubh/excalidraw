import { Router, Request, Response } from "express";
import { z } from "zod";
import argon2 from "argon2";
import jwt from "jsonwebtoken";
import { JWT_SECRET } from "../config";
import authMiddleware from "../middleware";

const mainRouter: Router = Router();

mainRouter.post("/signup", async function (req: Request, res: Response) {
  const body = z
    .object({
      username: z.string().min(3).max(10),
      password: z
        .string()
        .min(8)
        .max(20)
        .regex(/^(?=.*[a-z])(?=.*[0-9])(?=.*[!@#]).*$/),
      confirmPassword: z.string(),
    })
    .refine((data) => data.password === data.confirmPassword, {
      message: "Passwords don't match",
      path: ["confirmPassword"],
    });

  const parsedBody = body.safeParse(req.body);
  if (!parsedBody.success) {
    res.status(411).json({
      error: parsedBody.error,
    });
    console.log(parsedBody.error);
    return;
  }

  const username = req.body.username;
  const password = req.body.password;

  try {
    const hashedPassword = await argon2.hash(password);

    res.status(200).json({
      message: "Signed up successfully",
      username,
      hashedPassword,
      password,
    });
  } catch (e) {
    res.status(403).json({
      message: "Username already exists. Please signin",
    });
  }
});

mainRouter.post("/signin", async function (req: Request, res: Response) {
  const username = req.body.username;
  const password = req.body.password;

  const token = jwt.sign(
    {
      username,
    },
    JWT_SECRET!
  );

  res.json({
    token,
  });
});

mainRouter.post(
  "/room",
  authMiddleware,
  async function (req: Request, res: Response) {
    res.json({
      message: "Hello from room",
    });
  }
);

export default mainRouter;
