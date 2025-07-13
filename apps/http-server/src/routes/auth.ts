import { Router, Request, Response } from "express";
import argon2 from "argon2";
import jwt from "jsonwebtoken";
import { JWT_SECRET } from "@repo/backend-common/config";
import authMiddleware from "../middleware";
import {
  CreateUserSchema,
  SigninSchema,
  CreateRoomSchema,
} from "@repo/common-config/types";
import { prismaClient } from "@repo/database/client";

const mainRouter: Router = Router();

interface AuthenticatedRequest extends Request {
  userId?: string;
  userEmail?: string;
}

mainRouter.post("/signup", async function (req: Request, res: Response) {
  const parsedBody = CreateUserSchema.safeParse(req.body);
  if (!parsedBody.success) {
    res.status(411).json({
      error: parsedBody.error,
    });
    console.log(parsedBody.error);
    return;
  }

  const email = req.body.email;
  const username = req.body.username;
  const password = req.body.password;

  let err = false;
  try {
    const hashedPassword = await argon2.hash(password);

    const existingUser = await prismaClient.user.findUnique({
      where: { email: email },
    });

    if (existingUser) {
      res.status(400).json({
        message: "Email already registered",
      });
    }

    await prismaClient.user.create({
      data: {
        email: email,
        username: username,
        password: hashedPassword,
      },
    });
  } catch (e) {
    err = true;
    res.status(403).json({
      message: "Username already exists. Please signin",
    });
  }

  if (!err) {
    res.status(201).json({
      message: "Signed up successfully",
    });
  }
});

mainRouter.post("/signin", async function (req: Request, res: Response) {
  const parsedBody = SigninSchema.safeParse(req.body);
  if (!parsedBody.success) {
    res.status(411).json({
      error: parsedBody.error,
    });
    console.log(parsedBody.error);
    return;
  }

  const email = req.body.email;
  const username = req.body.username;
  const password = req.body.password;

  const user = await prismaClient.user.findUnique({
    where: { email: email },
  });

  if (user) {
    const verify = await argon2.verify(user.password, password);

    if (verify) {
      const token = jwt.sign(
        {
          id: user.id,
        },
        JWT_SECRET!
      );
      res.status(200).json({
        token,
        id: user.id,
      });
    } else {
      res.status(400).json({
        message: "Incorrect credentials",
      });
    }
  } else {
    res.status(401).json({
      message: "User does not exist",
    });
  }
});

mainRouter.post(
  "/room",
  authMiddleware,
  async function (req: Request, res: Response) {
    const parsedBody = CreateRoomSchema.safeParse(req.body);
    if (!parsedBody.success) {
      res.status(411).json({
        error: parsedBody.error,
      });
      console.log(parsedBody.error);
      return;
    }

    const userId = (req as AuthenticatedRequest).userId as string;
    const slug = parsedBody.data.name;

    await prismaClient.room.create({
      data: {
        slug: slug,
        adminId: userId,
      },
    });

    res.status(200).json({
      message: `Hello from room ${slug}`,
    });
  }
);

export default mainRouter;
