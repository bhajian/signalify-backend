import { Request, Response } from "express";

export const getProtected = (req: Request, res: Response): void => {
    res.json({
      message: "This is a protected route!",
      user: req.user, // The user data from the JWT token
    });
  }; 

  export const getUsers = (req: Request, res: Response): void => {
    res.json({
      data: {
        users: ["user1", "user2", "user3"]
      },
      user: req.user, // The user data from the JWT token
    });
  };
