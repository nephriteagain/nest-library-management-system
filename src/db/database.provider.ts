import * as mongoose from 'mongoose';
import { envConstants } from 'src/auth/constants';

const mongoDb =
    envConstants.env === 'dev'
        ? envConstants.mongo_local
        : envConstants.mongo_prod;

export const databaseProviders = [
    {
        provide: 'DATABASE_CONNECTION',
        useFactory: async (): Promise<typeof mongoose> => {
            const mongod = await mongoose.connect(mongoDb);
            console.log('connected to db');
            return mongod;
        },
    },
];
