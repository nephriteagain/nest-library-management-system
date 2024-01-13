import * as dotenv from 'dotenv';
dotenv.config();

export const envConstants = {
    secret: `${process.env.SECRET_KEY}`,
    env: `${process.env.ENV}`,
    penalty: 5,
    mongo_local: `${process.env.MONGO_LOCAL}`,
    mongo_prod: `${process.env.MONGO_PROD}`,
} as const;
