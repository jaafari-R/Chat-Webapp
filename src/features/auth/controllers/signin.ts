import { Request, Response } from 'express';
import JWT from 'jsonwebtoken';
import HTTP_STATUS from 'http-status-codes';

import { joiValidation } from '@global/decorators/joi-validation.decorators';
import { config } from '@root/config';
import { authService } from '@service/db/auth.service';
import { BadRequestError } from '@global/helpers/error-handler';
import { signinSchema } from '@auth/schemas/signin';
import { IAuthDocument } from '@auth/interfaces/auth.interface';
import { userInfo } from 'os';

export class SignIn
{
    @joiValidation(signinSchema)
    public async read(req: Request, res: Response): Promise<void>
    {
        const { username, password } = req.body;

        const user: IAuthDocument = await authService.getAuthUserByUsername(username);
        if (!user) { // if user does not exist
            throw new BadRequestError('Invalid credentials!');
        }

        const passwordMatch: boolean = await user.comparePassword(password);

        if (!passwordMatch) {
            throw new BadRequestError('Invalid credentials!');
        }

        const userJwt: string = JWT.sign(
            {
                userId: user.id,
                uId: user.uId,
                email: user.email,
                username: user.username,
                avatarColor: user.avatarColor
            },
            config.JWT_TOKEN!
        );
        req.session = { jwt: userJwt };
        res.status(HTTP_STATUS.OK).json({ message: 'Successfully logged in!', user: user, token: userJwt });
    }

}
