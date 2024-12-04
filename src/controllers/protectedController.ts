import { Request, Response } from "express";

export const getProtected = (req: Request, res: Response): void => {
    res.json({
      message: "This is a protected route!",
      user: req.user, // The user data from the JWT token
    });
  };
