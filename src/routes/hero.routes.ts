import { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";
import axios, { AxiosInstance } from "axios";
import { HttpError } from "../errors/HttpError";


const api: AxiosInstance = axios.create({
    baseURL: "https://www.dota2.com/datafeed/",
    headers: {
        "Content-Type": "application/json",
    }
});

export async function heroRoutes(fastify: FastifyInstance) {

    fastify.get('/', async (req: FastifyRequest, reply: FastifyReply) => {
        try {
            const response = await api.get('herolist', {
                params: { language: 'portuguese' }
            });
    
            if (response.status !== 200) {
                throw new HttpError({code: 500, message: 'Falha ao buscar dados de heróis'});
            }
    
            const modifiedData = response.data.result.data.heroes.map(hero => ({
                ...hero,
                name: hero.name.replace('npc_dota_hero_', '')
            }));
    
            reply.send({ ...response.data, result: { ...response.data.result, data: { heroes: modifiedData } } });
        } catch (error) {
            if (axios.isAxiosError(error)) {
                reply.status(error.response?.status || 500).send({ error: error.message });
            } else if (error instanceof HttpError) {
                reply.status(error.code).send({ error: error.message });
            } else {
                reply.status(500).send({ error: 'Failed to fetch data' });
            }
        }
    });
    

    fastify.get<{ Params: { id: string } }>('/:id', async (req: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) => {
        try {
            const { id } = req.params;

            const response = await api.get<HeroListResponse>('herodata', {
                params: { language: 'portuguese', hero_id: id },
            });

            if (response.status !== 200) {
                throw new HttpError({code: 500, message: 'Falha ao buscar os dados do herói'});
            }

            reply.send(response.data);
        } catch (error) {
            if (axios.isAxiosError(error)) {
                reply.status(error.response?.status || 500).send({ error: error.message });
            } else if (error instanceof HttpError) {
                reply.status(error.code).send({ error: error.message });
            } else {
                reply.status(500).send({ error: 'Failed to fetch data' });
            }
        }
    });

}
