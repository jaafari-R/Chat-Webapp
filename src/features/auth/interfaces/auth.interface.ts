import { Document } from 'mongoose';
import { ObjectId } from 'mongodb';

declare global
{
    namespace Express {
        interface Request {
            currentUser?: AuthPayLoad;
        }
    }
}

export interface AuthPayLoad
{
    UserId: string;
    uId: string;
    email: string;
    username: string;
    avatarColor: string;
    iat?: number;
}

export interface IAuthDocument extends Document
{
    _id: string | ObjectId;
    uId: string;
    username: string;
    email: string;
    password?: string;
    avatarColor: string;
    createdAt: Date;
    comparePassword(password: string): Promise<boolean>;
    hashPassword(password: string): Promise<string>;
}

export interface ISignUpDate
{
    _id: ObjectId;
    uId: string;
    email: string;
    username: string;
    password: string;
    avatarColor: string;
}

export interface IAuthJob
{
    value?: string | IAuthDocument;
}
