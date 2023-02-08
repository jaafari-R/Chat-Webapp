import { ObjectId } from 'mongodb';
import { Request, Response } from 'express';
import { joiValidation } from '@global/decorators/joi-validation.decorators';
import { signupSchema } from '@auth/schemas/signup';
import { IAuthDocument, ISignUpData } from '@auth/interfaces/auth.interface';
import { authService } from '@service/db/auth.service';
import { BadRequestError } from '@global/helpers/error-handler';
import { Helpers } from '@global/helpers/helpers';
import { UploadApiResponse } from 'cloudinary';
import { upload } from '@global/cloudinary-upload';
import HTTP_STATUS from 'http-status-codes';

export class SignUp {
    @joiValidation(signupSchema)
    public async create(req: Request, res: Response): Promise<void> {
        const { username, password, email, avatarColor, avatarImage } = req.body;
        const checkIfUserExists: IAuthDocument = await authService.getUserByUsernameOrEmail(username, email);
        if (checkIfUserExists) {
            if (checkIfUserExists.username == username) throw new BadRequestError('A user with this username already exists');
            else throw new BadRequestError('A user with this email already exists');
        }

        const authObjectId: ObjectId = new ObjectId();
        const userObjectId: ObjectId = new ObjectId();
        const uId = `${Helpers.generateRandomInt(12)}`;
        const authData: IAuthDocument = SignUp.prototype.signupData({
            _id: authObjectId,
            uId,
            username,
            email,
            password,
            avatarColor
        });
        const result: UploadApiResponse = (await upload(avatarImage, `${userObjectId}`, true, true)) as UploadApiResponse;
        if (!result?.public_id) {
            throw new BadRequestError('Error: Failed to upload avatarImage.<br>' + result);
        }

        res.status(HTTP_STATUS.CREATED).json({ message: 'User created successfully!', authData });
    }

    private signupData(data: ISignUpData): IAuthDocument {
        const { _id, username, email, uId, password, avatarColor } = data;
        return {
            _id,
            uId,
            username: Helpers.firstLetterUppercase(username),
            email: Helpers.lowerCase(email),
            password,
            avatarColor,
            createdAt: new Date()
        } as IAuthDocument;
    }
}
