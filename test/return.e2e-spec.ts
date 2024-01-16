import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { ClientSession, startSession } from 'mongoose';
import req from 'supertest';
import cookieParser from 'cookie-parser';
import { AuthGuard } from '../src/auth/auth.guard';
import { JwtService, JwtModule } from '@nestjs/jwt';
import { AuthModule } from '../src/auth/auth.module';
import { cookie, generateObjectId } from './test.helpers';
import { DatabaseModule } from '../src/db/database.module';
import { UsersModule } from '../src/users/users.module';
import { faker } from '@faker-js/faker';
import { ReturnModule } from '../src/return/return.module';
// NOTE: creating borrow and returning it i need this
import { BorrowModule } from '../src/borrow/borrow.module';
// NOTE: to create a  book with 0 available

describe('Return Contoller (e2e)', () => {
    let app: INestApplication;
    let session: ClientSession;

    beforeAll(async () => {
        const moduleFixture: TestingModule = await Test.createTestingModule({
            imports: [
                AuthModule,
                JwtModule,
                DatabaseModule,
                UsersModule,
                ReturnModule,
                BorrowModule,
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
                .get('/api/return')
                .set('Cookie', cookie)
                .expect(200);
        });

        it('returns 401 no jwt cookie', () => {
            return req(app.getHttpServer()).get('/api/return').expect(401);
        });

        it('returns 400 when querying with more than 1 props', () => {
            return req(app.getHttpServer())
                .get(
                    `/api/return?_id=${generateObjectId()}&bookId=${generateObjectId()}`,
                )
                .set('Cookie', cookie)
                .expect(400);
        });

        it('returns 200 when querying _id', () => {
            return req(app.getHttpServer())
                .get(`/api/return?_id=${generateObjectId()}`)
                .set('Cookie', cookie)
                .expect(200);
        });

        it('returns 400 when querying _id with invalid id', () => {
            return req(app.getHttpServer())
                .get(`/api/return?_id=invalid_id`)
                .set('Cookie', cookie)
                .expect(400);
        });

        it('returns 200 when querying bookId', () => {
            return req(app.getHttpServer())
                .get(`/api/return?bookId=${generateObjectId()}`)
                .set('Cookie', cookie)
                .expect(200);
        });

        it('returns 400 when querying bookId with invalid id', () => {
            return req(app.getHttpServer())
                .get(`/api/return?bookId=invalid_id`)
                .set('Cookie', cookie)
                .expect(400);
        });

        it('returns 200 when querying borrower', () => {
            return req(app.getHttpServer())
                .get(`/api/return?borrower=${generateObjectId()}`)
                .set('Cookie', cookie)
                .expect(200);
        });

        it('returns 400 when querying borrower with invalid id', () => {
            return req(app.getHttpServer())
                .get(`/api/return?borrower=invalid_id`)
                .set('Cookie', cookie)
                .expect(400);
        });

        it('returns 200 when querying approvedBy', () => {
            return req(app.getHttpServer())
                .get(`/api/return?approvedBy=${generateObjectId()}`)
                .set('Cookie', cookie)
                .expect(200);
        });

        it('returns 400 when querying approvedBy with invalid id', () => {
            return req(app.getHttpServer())
                .get(`/api/return?approvedBy=invalid_id`)
                .set('Cookie', cookie)
                .expect(400);
        });
    });
    describe('/query GET', () => {
        it('returns a 200', () => {
            return (
                req(app.getHttpServer())
                    // NOTE: hardcoded
                    .get(`/api/return/query?id=65a10ed8dcabc3c0cfba96e3`)
                    .set('Cookie', cookie)
                    .expect(200)
            );
        });

        it('returns a 401 when no jwt cookie', () => {
            return (
                req(app.getHttpServer())
                    // NOTE: hardcoded
                    .get(`/api/return/query?id=65a10ed8dcabc3c0cfba96e3`)
                    .expect(401)
            );
        });

        it('returns a 404 when doc DNE', () => {
            return (
                req(app.getHttpServer())
                    // NOTE: hardcoded
                    .get(`/api/return/query?id=${generateObjectId()}`)
                    .set('Cookie', cookie)
                    .expect(404)
            );
        });

        it('returns a 400 when invalid id', () => {
            return (
                req(app.getHttpServer())
                    // NOTE: hardcoded
                    .get(`/api/return/query?id=invalid_id`)
                    .set('Cookie', cookie)
                    .expect(400)
            );
        });
    });

    describe('/find/:data GET', () => {
        it('returns a 200', () => {
            return req(app.getHttpServer())
                .get(`/api/return/find/title?_id=65a10ed8dcabc3c0cfba96e3`)
                .set('Cookie', cookie)
                .expect(200);
        });

        it('returns a 401, no jwt cookie', () => {
            return req(app.getHttpServer())
                .get(`/api/return/find/title?_id=65a10ed8dcabc3c0cfba96e3`)
                .expect(401);
        });

        it('returns a 404 doc DNE', () => {
            return req(app.getHttpServer())
                .get(`/api/return/find/title?_id=${generateObjectId()}`)
                .set('Cookie', cookie)
                .expect(404);
        });

        it('returns a 400 invalid id', () => {
            return req(app.getHttpServer())
                .get(`/api/return/find/title?_id=invalid_id`)
                .set('Cookie', cookie)
                .expect(400);
        });

        it('returns a 400, trying to find unknown property', () => {
            return req(app.getHttpServer())
                .get(`/api/return/find/unknown?_id=65a10ed8dcabc3c0cfba96e3`)
                .set('Cookie', cookie)
                .expect(400);
        });
    });

    describe('/ POST', () => {
        it('returns 201, creates a new return entry', () => {
            // creates the borrow first
            return req(app.getHttpServer())
                .post('/api/borrow')
                .set('Cookie', cookie)
                .send({
                    bookId: '65a10ec8dcabc3c0cfba96d7',
                    borrower: '659e957b4aab92a55e47934b',
                    promisedReturnDate: faker.date.future().getTime(),
                })
                .expect(201)
                .expect((res) => {
                    const { _id } = res.body;
                    expect(_id).toBeDefined();
                    return req(app.getHttpServer())
                        .post(`/api/return/${_id}`)
                        .set('Cookie', cookie)
                        .expect(201);
                });
        });

        it('returns 401, now jwt cookie', () => {
            // creates the borrow first
            return req(app.getHttpServer())
                .post('/api/borrow')
                .set('Cookie', cookie)
                .send({
                    bookId: '65a10ec8dcabc3c0cfba96d7',
                    borrower: '659e957b4aab92a55e47934b',
                    promisedReturnDate: faker.date.future().getTime(),
                })
                .expect(201)
                .expect((res) => {
                    const { _id } = res.body;
                    expect(_id).toBeDefined();
                    return req(app.getHttpServer())
                        .post(`/api/return/${_id}`)
                        .expect(401);
                });
        });

        it('returns 404 returning book that DNE', () => {
            return req(app.getHttpServer())
                .post(`/api/return/${generateObjectId()}`)
                .set('Cookie', cookie)
                .expect(400);
        });

        it('returns 400 invalid id', () => {
            return req(app.getHttpServer())
                .post(`/api/return/invalid_id`)
                .set('Cookie', cookie)
                .expect(400);
        });
    });
});
