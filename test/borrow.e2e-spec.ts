import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { ClientSession, startSession } from 'mongoose';
import req from 'supertest';
import cookieParser from 'cookie-parser';
import { AuthGuard } from '../src/auth/auth.guard';
import { JwtService, JwtModule } from '@nestjs/jwt';
import { AuthModule } from '../src/auth/auth.module';
import { InventoryModule } from '../src/inventory/inventory.module';
import { cookie, generateObjectId } from './test.helpers';
import { DatabaseModule } from '../src/db/database.module';
import { BorrowModule } from '../src/borrow/borrow.module';
import { UsersModule } from '../src/users/users.module';
import { faker } from '@faker-js/faker';

describe('Borrow Controller (e2e)', () => {
    let app: INestApplication;
    let session: ClientSession;

    beforeAll(async () => {
        const moduleFixture: TestingModule = await Test.createTestingModule({
            imports: [
                AuthModule,
                JwtModule,
                DatabaseModule,
                BorrowModule,
                UsersModule,
            ],
        }).compile();

        app = moduleFixture.createNestApplication();
        // need cookie parser to access cookies
        app.use(cookieParser());
        app.useGlobalGuards(new AuthGuard(new JwtService()));
        await app.init();
    });

    beforeEach(async () => {
        const testSession = await startSession();
        session = testSession;
        testSession.startTransaction();
    });

    afterEach(async () => {
        // undoes all crud operations
        try {
            await session.abortTransaction();
        } catch (error) {
            console.error('Error during transaction rollback:', error);
        } finally {
            await session.endSession();
        }
    });

    afterAll(async () => {
        await app.close();
    });

    describe('/ GET', () => {
        it('returns 200', () => {
            return req(app.getHttpServer())
                .get('/api/borrow')
                .set('Cookie', cookie)
                .expect(200);
        });

        it('returns 200 when querying title', () => {
            return req(app.getHttpServer())
                .get('/api/borrow?title=title')
                .set('Cookie', cookie)
                .expect(200);
        });

        it('returns 200 when querying bookId', () => {
            return req(app.getHttpServer())
                .get(`/api/borrow?bookId=${generateObjectId()}`)
                .set('Cookie', cookie)
                .expect(200);
        });

        it('returns 400 when querying bookId with invalid id', () => {
            return req(app.getHttpServer())
                .get(`/api/borrow?bookId=invalid_id`)
                .set('Cookie', cookie)
                .expect(400);
        });

        it('returns 200 when querying _id', () => {
            return req(app.getHttpServer())
                .get(`/api/borrow?_id=${generateObjectId()}`)
                .set('Cookie', cookie)
                .expect(200);
        });

        it('returns 400 when querying _id with invalid id', () => {
            return req(app.getHttpServer())
                .get(`/api/borrow?_id=invalid_id`)
                .set('Cookie', cookie)
                .expect(400);
        });

        it('returns 200 when querying borrower', () => {
            return req(app.getHttpServer())
                .get(`/api/borrow?borrower=${generateObjectId()}`)
                .set('Cookie', cookie)
                .expect(200);
        });

        it('returns 400 when querying borrower with invalid id', () => {
            return req(app.getHttpServer())
                .get(`/api/borrow?borrower=invalid_id`)
                .set('Cookie', cookie)
                .expect(400);
        });

        it('returns 200 when querying approvedBy', () => {
            return req(app.getHttpServer())
                .get(`/api/borrow?approvedBy=${generateObjectId()}`)
                .set('Cookie', cookie)
                .expect(200);
        });

        it('returns 400 when querying approvedBy with invalid id', () => {
            return req(app.getHttpServer())
                .get(`/api/borrow?approvedBy=invalid_id`)
                .set('Cookie', cookie)
                .expect(400);
        });

        it('returns 401 due to no jwt cookie', () => {
            return req(app.getHttpServer()).get('/api/borrow').expect(401);
        });

        it('returns 400 when querying with multiple props', () => {
            return req(app.getHttpServer())
                .get(`/api/borrow?_id=${generateObjectId()}&title=title`)
                .set('Cookie', cookie)
                .expect(400);
        });
    });

    describe('/:id GET', () => {
        it('returns 200', () => {
            return (
                req(app.getHttpServer())
                    // hard coded
                    .get('/api/borrow/65a10ed8dcabc3c0cfba96e3')
                    .set('Cookie', cookie)
                    .expect(200)
            );
        });

        it('returns 401, now jwt cookie', () => {
            return (
                req(app.getHttpServer())
                    // hard coded
                    .get('/api/borrow/65a10ed8dcabc3c0cfba96e3')
                    .expect(401)
            );
        });

        it('returns 404 document DNE', () => {
            return (
                req(app.getHttpServer())
                    // hard coded
                    .get(`/api/borrow/${generateObjectId()}`)
                    .set('Cookie', cookie)
                    .expect(404)
            );
        });

        it('returns 400 invalid id', () => {
            return (
                req(app.getHttpServer())
                    // hard coded
                    .get(`/api/borrow/invalid_id`)
                    .set('Cookie', cookie)
                    .expect(400)
            );
        });
    });

    describe('/find/:data GET', () => {
        it('returns a 200', () => {
            return req(app.getHttpServer())
                .get(`/api/borrow/find/title?_id=65a10ed8dcabc3c0cfba96e3`)
                .set('Cookie', cookie)
                .expect(200);
        });

        it('returns a 401, no jwt cookie', () => {
            return req(app.getHttpServer())
                .get(`/api/borrow/find/title?_id=65a10ed8dcabc3c0cfba96e3`)
                .expect(401);
        });

        it('returns a 404 doc DNE', () => {
            return req(app.getHttpServer())
                .get(`/api/borrow/find/title?_id=${generateObjectId()}`)
                .set('Cookie', cookie)
                .expect(404);
        });

        it('returns a 400 invalid id', () => {
            return req(app.getHttpServer())
                .get(`/api/borrow/find/title?_id=invalid_id`)
                .set('Cookie', cookie)
                .expect(400);
        });

        it('returns a 400, trying to find unknown property', () => {
            return req(app.getHttpServer())
                .get(`/api/borrow/find/unknown?_id=65a10ed8dcabc3c0cfba96e3`)
                .set('Cookie', cookie)
                .expect(400);
        });
    });

    describe('/ POST', () => {
        it('returns 201', () => {
            return req(app.getHttpServer())
                .post('/api/borrow')
                .set('Cookie', cookie)
                .send({
                    bookId: '65a10ec8dcabc3c0cfba96d7',
                    borrower: '659e957b4aab92a55e47934b',
                    promisedReturnDate: faker.date.future().getTime(),
                })
                .expect(201);
        });

        it('returns 401, no jwt cookie', () => {
            return req(app.getHttpServer())
                .post('/api/borrow')
                .send({
                    bookId: '65a10ec8dcabc3c0cfba96d7',
                    borrower: '659e957b4aab92a55e47934b',
                    promisedReturnDate: faker.date.future().getTime(),
                })
                .expect(401);
        });

        it('returns 400 invalid schema', () => {
            return req(app.getHttpServer())
                .post('/api/borrow')
                .set('Cookie', cookie)
                .send({
                    item: faker.word.adverb(),
                })
                .expect(400);
        });
    });
});
