import express, { Router } from 'express';

import { SignIn } from '@auth/controllers/signin';
import { SignUp } from '@auth/controllers/signup';
import { SignOut } from '@auth/controllers/signout';
import { PasswordReset } from '@auth/controllers/password-reset';

class AuthRoutes {
    private router: Router;

    constructor() {
        this.router = express.Router();
    }

    public routes(): Router {
        this.router.post('/signup', SignUp.prototype.create);
        this.router.post('/signin', SignIn.prototype.read);
        this.router.post('/forgot-password', PasswordReset.prototype.create);
        this.router.post('/reset-password/:token', PasswordReset.prototype.update);

        return this.router;
    }

    public signoutRoutes(): Router {
        this.router.get('/signout', SignOut.prototype.update);

        return this.router;
    }
}

export const authRoutes: AuthRoutes = new AuthRoutes();
