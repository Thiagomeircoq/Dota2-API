import Fastify, { FastifyInstance } from "fastify";
import cors from '@fastify/cors'
import { HttpError } from "./errors/HttpError";
import { heroRoutes } from "./routes/hero.routes";

const app: FastifyInstance = Fastify({ logger: true });

app.register(cors, {
    origin: "*",
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"]
});


app.register(heroRoutes, {
    prefix: "/hero",
});

app.get('/test', async (request, reply) => {
    return 'Test route';
});

app.setErrorHandler((error, request, reply) => {
    if (error instanceof HttpError) {
        reply.status(error.code).send({ message: error.message });
    } else {
        reply.status(500).send({ message: 'Internal Server Error' });
    }
});



app.listen({ port: 3100 }, () => console.log("Server is running on port 3100"));
