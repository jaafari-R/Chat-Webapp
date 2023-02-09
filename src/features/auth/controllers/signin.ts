import { Request, Response } from 'express';
import JWT from 'jsonwebtoken';
import HTTP_STATUS from 'http-status-codes';

import { joiValidation } from '@global/decorators/joi-validation.decorators';
import { config } from '@root/config';
import { authService } from '@service/db/auth.service';
import { BadRequestError } from '@global/helpers/error-handler';
import { signinSchema } from '@auth/schemas/signin';
import { IAuthDocument } from '@auth/interfaces/auth.interface';
import { IUserDocument } from '@user/interfaces/user.interface';
import { userService } from '@service/db/user.service';

export class SignIn {
    @joiValidation(signinSchema)
    public async read(req: Request, res: Response): Promise<void> {
        const { username, password } = req.body;

        const userAuth: IAuthDocument = await authService.getAuthUserByUsername(username);
        if (!userAuth) {
            // if user does not exist
            throw new BadRequestError('Invalid credentials!');
        }

        const passwordMatch: boolean = await userAuth.comparePassword(password);

        if (!passwordMatch) {
            throw new BadRequestError('Invalid credentials!');
        }

        const user: IUserDocument = await userService.getUserByAuthId(`${userAuth._id}`);

        const userJwt: string = JWT.sign(
            {
                userId: user._id,
                uId: userAuth.uId,
                email: userAuth.email,
                username: userAuth.username,
                avatarColor: userAuth.avatarColor
            },
            config.JWT_TOKEN!
        );

        req.session = { jwt: userJwt };
        res.status(HTTP_STATUS.OK).json({ message: 'Successfully logged in!', user: user, token: userJwt });
    }
}
