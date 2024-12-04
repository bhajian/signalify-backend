import { Request, Response } from "express";

export const getHelloWorld = (req: Request, res: Response): void => {
  res.json({ message: "Hello, World!" });
};
