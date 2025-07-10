import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { JWT_SECRET } from "./config";

function authMiddleware(req: Request, res: Response, next: NextFunction) {
  try {
    const header = req.headers.authorization ?? "";

    if (!header) {
      res.status(401).json({
        message: "Authorization header missing",
      });
      return;
    }

    const decodedData = jwt.verify(header, JWT_SECRET!);
    //@ts-ignore
    req.userId = decodedData.id;
    next();
  } catch (error) {
    res.status(401).json({
      message: "Invalid or expired token",
    });
  }
}

export default authMiddleware;
