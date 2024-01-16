import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { ClientSession, startSession } from 'mongoose';
import req from 'supertest';
import cookieParser = require('cookie-parser');
import { AuthGuard } from '../src/auth/auth.guard';
import { JwtService, JwtModule } from '@nestjs/jwt';
import { AuthModule } from '../src/auth/auth.module';
import { cookie, generateObjectId } from './test.helpers';
import { DatabaseModule } from '../src/db/database.module';
import { PenaltyModule } from '../src/penalty/penalty.module';
import { faker } from '@faker-js/faker';
import { PenaltyArgsSchema } from '../src/types/models';
import { envConstants } from '../src/auth/constants';

describe('Penalty Controller, (e2e)', () => {
    let app: INestApplication;
    let session: ClientSession;

    beforeAll(async () => {
        const moduleFixture: TestingModule = await Test.createTestingModule({
            imports: [AuthModule, JwtModule, DatabaseModule, PenaltyModule],
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
        it('returns a 200', () => {
            return req(app.getHttpServer())
                .get('/api/penalty')
                .set('Cookie', cookie)
                .expect(200);
        });

        it('returns a 401 when no jwt cookie', () => {
            return req(app.getHttpServer()).get('/api/penalty').expect(401);
        });

        it('return a 200 when querying _id', () => {
            return req(app.getHttpServer())
                .get(`/api/penalty?_id=${generateObjectId()}`)
                .set('Cookie', cookie)
                .expect(200);
        });

        it('return a 400 when querying _id using invalid id', () => {
            return req(app.getHttpServer())
                .get(`/api/penalty?_id=invalid_id`)
                .set('Cookie', cookie)
                .expect(400);
        });

        it('return a 200 when querying bookId', () => {
            return req(app.getHttpServer())
                .get(`/api/penalty?bookId=${generateObjectId()}`)
                .set('Cookie', cookie)
                .expect(200);
        });

        it('return a 400 when querying bookId using invalid id', () => {
            return req(app.getHttpServer())
                .get(`/api/penalty?bookId=invalid_id`)
                .set('Cookie', cookie)
                .expect(400);
        });

        it('return a 200 when querying approvedBy', () => {
            return req(app.getHttpServer())
                .get(`/api/penalty?approvedBy=${generateObjectId()}`)
                .set('Cookie', cookie)
                .expect(200);
        });

        it('return a 400 when querying approvedBy using invalid id', () => {
            return req(app.getHttpServer())
                .get(`/api/penalty?approvedBy=invalid_id`)
                .set('Cookie', cookie)
                .expect(400);
        });

        it('return a 200 when querying borrower', () => {
            return req(app.getHttpServer())
                .get(`/api/penalty?borrower=${generateObjectId()}`)
                .set('Cookie', cookie)
                .expect(200);
        });

        it('return a 400 when querying borrower using invalid id', () => {
            return req(app.getHttpServer())
                .get(`/api/penalty?borrower=invalid_id`)
                .set('Cookie', cookie)
                .expect(400);
        });
        it('return a 400 when querying with using multiple props', () => {
            return req(app.getHttpServer())
                .get(
                    `/api/penalty?borrower=${generateObjectId()}&bookId=${generateObjectId()}`,
                )
                .set('Cookie', cookie)
                .expect(400);
        });
    });

    describe('/ POST', () => {
        it('returns a 201 and the created document', () => {
            return (
                req(app.getHttpServer())
                    .post('/api/penalty')
                    .set('Cookie', cookie)
                    //NOTE: hard coded data
                    .send({
                        bookId: '65a10ec8dcabc3c0cfba96d7',
                        borrower: '659e10a95b6aa6d681c13620',
                        penalty: faker.number.int({ min: 5, max: 100 }),
                        title: faker.vehicle.vehicle(),
                    })
                    .expect(201)
                    .expect((res) => {
                        return expect(
                            PenaltyArgsSchema.parse(res.body),
                        ).toBeTruthy();
                    })
            );
        });

        it('returns a 401 when creating a new document without jwt cookie', () => {
            return (
                req(app.getHttpServer())
                    .post('/api/penalty')
                    //NOTE: hard coded data
                    .send({
                        bookId: '65a10ec8dcabc3c0cfba96d7',
                        borrower: '659e10a95b6aa6d681c13620',
                        penalty: faker.number.int({ min: 5, max: 100 }),
                        title: faker.vehicle.vehicle(),
                    })
                    .expect(401)
            );
        });

        it('returns a 201 and the created document', () => {
            return (
                req(app.getHttpServer())
                    .post('/api/penalty')
                    .set('Cookie', cookie)
                    //NOTE: hard coded data
                    .send({
                        bookId: '65a10ec8dcabc3c0cfba96d7',
                        borrower: '659e10a95b6aa6d681c13620',
                        penalty: faker.number.int({ min: 5, max: 100 }),
                        title: faker.vehicle.vehicle(),
                    })
                    .expect(201)
                    .expect((res) => {
                        return expect(
                            PenaltyArgsSchema.parse(res.body),
                        ).toBeTruthy();
                    })
            );
        });
    });

    describe('/find:data', () => {
        it('returns 200', () => {
            // create a penalty first
            return (
                req(app.getHttpServer())
                    .post('/api/penalty')
                    .set('Cookie', cookie)
                    //NOTE: hard coded data
                    .send({
                        bookId: '65a10ec8dcabc3c0cfba96d7',
                        borrower: '659e10a95b6aa6d681c13620',
                        penalty: faker.number.int({ min: 5, max: 100 }),
                        title: faker.vehicle.vehicle(),
                    })
                    .expect(201)
                    .expect((res) => {
                        expect(PenaltyArgsSchema.parse(res.body)).toBeTruthy();
                        const { _id } = res.body;
                        return req(app.getHttpServer())
                            .get(`/api/penalty/find/title?_id=${_id}`)
                            .set('Cookie', cookie)
                            .expect(200)
                            .expect((res) => {
                                expect(
                                    res.body.hasOwnProperty('title'),
                                ).toBeTruthy();
                            });
                    })
            );
        });

        it('returns a 401 when no jwt cookie found', () => {
            return req(app.getHttpServer())
                .get(`/api/penalty/find/title?_id=${generateObjectId()}`)
                .expect(401);
        });

        it('returns a 400 when querying without _id query param', () => {
            return (
                req(app.getHttpServer())
                    //NOTE: hard coded id
                    .get(`/api/penalty/find/bookId`)
                    .set('Cookie', cookie)
                    .expect(400)
            );
        });

        it('returns a 400 when querying with invalid _id query param', () => {
            return (
                req(app.getHttpServer())
                    //NOTE: hard coded id
                    .get(`/api/penalty/find/borrower?_id=invalid_id`)
                    .set('Cookie', cookie)
                    .expect(400)
            );
        });

        it('returns a 404 when querying a document that DNE', () => {
            return (
                req(app.getHttpServer())
                    //NOTE: hard coded id
                    .get(`/api/penalty/find/bookId?_id=${generateObjectId()}`)
                    .set('Cookie', cookie)
                    .expect(404)
            );
        });

        it('returns a 400 when querying a unknown property that DNE', () => {
            return (
                req(app.getHttpServer())
                    .post('/api/penalty')
                    .set('Cookie', cookie)
                    //NOTE: hard coded data
                    .send({
                        bookId: '65a10ec8dcabc3c0cfba96d7',
                        borrower: '659e10a95b6aa6d681c13620',
                        penalty: faker.number.int({ min: 5, max: 100 }),
                        title: faker.vehicle.vehicle(),
                    })
                    .expect(201)
                    .expect((res) => {
                        //NOTE: hard coded id
                        const { _id } = res.body;
                        expect(_id).toBeDefined();
                        return req(app.getHttpServer())
                            .get(`/api/penalty/find/borrower?_id=${_id}`)
                            .set('Cookie', cookie)
                            .expect(400);
                    })
            );
        });
    });

    describe('/value GET', () => {
        it('returns the penalty value', () => {
            return req(app.getHttpServer())
                .get('/api/penalty/value')
                .set('Cookie', cookie)
                .expect(200)
                .expect((res) => {
                    return expect(res.body.penalty).toEqual(
                        envConstants.penalty,
                    );
                });
        });

        it('returns 401 when no jwt cookie', () => {
            return req(app.getHttpServer())
                .get('/api/penalty/value')
                .expect(401);
        });
    });

    describe('/query', () => {
        it('return a 200', () => {
            // creates the document first
            return (
                req(app.getHttpServer())
                    .post('/api/penalty')
                    .set('Cookie', cookie)
                    //NOTE: hard coded data
                    .send({
                        bookId: '65a10ec8dcabc3c0cfba96d7',
                        borrower: '659e10a95b6aa6d681c13620',
                        penalty: faker.number.int({ min: 5, max: 100 }),
                        title: faker.vehicle.vehicle(),
                    })
                    .expect(201)
                    .expect((res) => {
                        const { _id } = res.body;
                        return req(app.getHttpServer())
                            .get(`/api/penalty/query?id=${_id}`)
                            .set('Cookie', cookie)
                            .expect(200);
                    })
            );
        });

        it('returns a 401 when no jwt cookie', () => {
            return req(app.getHttpServer())
                .get(`/api/penalty/query?id=${generateObjectId()}`)
                .expect(401);
        });

        it('returns a 400 when invalid id', () => {
            return req(app.getHttpServer())
                .get(`/api/penalty/query?id=invalid_id`)
                .set('Cookie', cookie)
                .expect(400);
        });

        it('returns a 400 when id query param is missing', () => {
            return req(app.getHttpServer())
                .get(`/api/penalty/query`)
                .set('Cookie', cookie)
                .expect(400);
        });

        it('returns a 404 when document not found', () => {
            return req(app.getHttpServer())
                .get(`/api/penalty/query?id=${generateObjectId()}`)
                .set('Cookie', cookie)
                .expect(404);
        });
    });
});
