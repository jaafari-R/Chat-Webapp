import { NextFunction, Request, Response } from 'express';
import JWT from 'jsonwebtoken';

import { config } from '@root/config';
import { NotAuthorizedError } from './error-handler';
import { AuthPayLoad } from '@auth/interfaces/auth.interface';

export class AuthMiddleware
{
    public verifyUser(req: Request, res: Response, next: NextFunction): void
    {
        if(!req.session?.jwt) {
            throw new NotAuthorizedError('JWToken is not available. Please login!');
        }

        try {
            const payload: AuthPayLoad = JWT.verify(req.session?.jwt, config.JWT_TOKEN!) as AuthPayLoad;
            req.currentUser = payload;
        }
        catch (error) {
            throw new NotAuthorizedError('JWToken is invalid! Please login again.');
        }
        next();
    }

    public checkAuthentication(req: Request, res: Response, next: NextFunction): void
    {
        if(!req.currentUser) {
            throw new NotAuthorizedError('Authentication is required to access this route.');
        }
        next();
    }
}

export const authMiddleware: AuthMiddleware = new AuthMiddleware();
