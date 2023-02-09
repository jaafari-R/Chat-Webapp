import express, { Router } from 'express';

import { SignIn } from '@auth/controllers/signin';
import { SignUp } from '@auth/controllers/signup';
import { SignOut } from '@auth/controllers/signout';

class AuthRoutes {
    private router: Router;

    constructor() {
        this.router = express.Router();
    }

    public routes(): Router {
        this.router.post('/signup', SignUp.prototype.create);
        this.router.post('/signin', SignIn.prototype.read);

        return this.router;
    }

    public signoutRoutes(): Router {
        this.router.get('/signout', SignOut.prototype.update);

        return this.router;
    }
}

export const authRoutes: AuthRoutes = new AuthRoutes();
