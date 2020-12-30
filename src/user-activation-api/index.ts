import { Request, Response } from 'express';
import { BaseError } from '../core/error/base.error';
import { HttpUserActivation } from './http-user-activation';

export async function handleEvent(req: Request, res: Response): Promise<Response> {
  try {
    const response = await new HttpUserActivation(req).getResponseData();
    return res.status(200).json(response);
  } catch (err) {
    console.error(err.message);
    if (err instanceof BaseError && err.httpStatus) {
      return res.status(err.httpStatus).json({ message: err.message });
    }
    return res.status(500).json({ message: 'internal server error' });
  }
}
