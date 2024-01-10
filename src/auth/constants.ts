import * as dotenv from 'dotenv';
dotenv.config();

export const envConstants = {
    secret: `${process.env.SECRET_KEY}`,
    env: `${process.env.ENV}`,
    penalty: 5,
} satisfies {
    secret: string;
    env: string;
    penalty: number;
};
