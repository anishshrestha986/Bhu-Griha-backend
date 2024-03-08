import { Request } from 'express';
import { IUserDocument } from './entities';

interface IRequest extends Request {
  user: IUserDocument;
}

export { IRequest };
