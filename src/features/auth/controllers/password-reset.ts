import { Request, Response } from 'express';
import HTTP_STATUS from 'http-status-codes';
import crypto from 'crypto';

import { config } from '@root/config';
import { joiValidation } from '@global/decorators/joi-validation.decorators';
import { emailSchema } from '@auth/schemas/password';
import { IAuthDocument } from '@auth/interfaces/auth.interface';
import { authService } from '@service/db/auth.service';
import { BadRequestError } from '@global/helpers/error-handler';
import { forgotPasswordTemplate } from '@service/emails/templates/forgot-password/forgot-password-template';
import { emailQueue } from '@service/queues/email.queue';

export class PasswordReset
{
    @joiValidation(emailSchema)
    public async create(req: Request, res: Response): Promise<void>
    {
        const { email } = req.body;
        const user: IAuthDocument = await authService.getAuthUserByEmail(email);
        if(!user)
        {
            throw new BadRequestError('Invalid email');
        }

        const randomBytes: Buffer = await Promise.resolve(crypto.randomBytes(20));
        const randomCharacters: string = randomBytes.toString('hex');

        await authService.updatePasswordToken(`${user._id!}`, randomCharacters, Date.now() + 60 * 60 * 1000);

        const resetLink = `${config.CLIENT_URL}/reset-password?token=${randomCharacters}`;
        const template: string = forgotPasswordTemplate.passwordResetTemplate(user.username, resetLink);
        emailQueue.addEmailJob('forgotPasswordEmail', { template, receiverEmail: email, subject: 'Password Reset' });
        res.status(HTTP_STATUS.OK).json({ message: 'Password reset email sent!'});
    }
}
