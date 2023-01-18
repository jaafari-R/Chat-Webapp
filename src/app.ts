import express, { Express } from 'express';

import { ChatServer } from './setupServer';

class Application 
{
    public initialize(): void {
        const app: Express = express();
        const server: ChatServer = new ChatServer(app);
        server.start();
    }
}

const application: Application = new Application();
application.initialize();
