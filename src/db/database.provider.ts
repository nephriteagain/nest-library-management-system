import * as mongoose from 'mongoose';

export const databaseProviders = [
    {
        provide: 'DATABASE_CONNECTION',
        useFactory: async (): Promise<typeof mongoose> => {
            const mongod = await mongoose.connect(
                'mongodb://127.0.0.1:27017/lms',
            );
            console.log('connected to db');
            return mongod;
        },
    },
];
