import cors from 'cors';

export const corsOptions: cors.CorsOptions = {
  origin: process.env.CLIENT_URL,
  credentials: true,
};
