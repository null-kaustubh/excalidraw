import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { JWT_SECRET } from "@repo/backend-common/config";

interface AuthenticatedRequest extends Request {
  userId?: string;
}

function authMiddleware(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) {
  try {
    const header = req.headers.authorization ?? "";

    if (!header) {
      res.status(401).json({
        message: "Authorization header missing",
      });
      return;
    }

    const decodedData = jwt.verify(header, JWT_SECRET!) as {
      id: string;
    };

    req.userId = decodedData.id;
    next();
  } catch (error) {
    res.status(401).json({
      message: "Invalid or expired token",
    });
  }
}

export default authMiddleware;
