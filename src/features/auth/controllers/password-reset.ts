import { Request, Response } from 'express';
import HTTP_STATUS from 'http-status-codes';
import crypto from 'crypto';
import moment from 'moment';
import publicIP from 'ip';

import { config } from '@root/config';
import { joiValidation } from '@global/decorators/joi-validation.decorators';
import { emailSchema, passwordSchema } from '@auth/schemas/password';
import { IAuthDocument } from '@auth/interfaces/auth.interface';
import { authService } from '@service/db/auth.service';
import { BadRequestError } from '@global/helpers/error-handler';
import { forgotPasswordTemplate } from '@service/emails/templates/forgot-password/forgot-password-template';
import { emailQueue } from '@service/queues/email.queue';
import { IResetPasswordParams } from '@user/interfaces/user.interface';
import { resetPasswordTemplate } from '@service/emails/reset-password/reset-password.template';

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

    @joiValidation(passwordSchema)
    public async update(req: Request, res: Response): Promise<void>
    {
        const { password, confirmPassword } = req.body;
        const { token } = req.params;

        console.log(password);
        console.log(confirmPassword);

        if(password !== confirmPassword) {
            throw new BadRequestError('The password and the confirmation password must match!');
        }

        const user: IAuthDocument = await authService.getAuthUserByPasswordToken(token);

        if(!user)
        {
            throw new BadRequestError('Password reset token has expired.');
        }

        user.password = password;
        user.passwordResetExpires = undefined;
        user.passwordResetToken = undefined;

        await user.save();

        const templateParams: IResetPasswordParams = {
            username: user.username!,
            email: user.email!,
            ipaddress: publicIP.address(),
            date: moment().format('DD/MM/YYYY HH:mm')
        };

        const template: string = resetPasswordTemplate.passwordResetConfirmationTemplate(templateParams);
        emailQueue.addEmailJob('forgotPasswordEmail', { template, receiverEmail: user.email, subject: 'Password Has Been Reset!' });
        res.status(HTTP_STATUS.OK).json({ message: 'Password successfully updayed!'});
    }
}
