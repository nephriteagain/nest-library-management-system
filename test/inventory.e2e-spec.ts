import { Test, TestingModule } from "@nestjs/testing";
import { INestApplication } from "@nestjs/common"
import { ClientSession, startSession } from "mongoose";
import req from 'supertest'
import cookieParser = require("cookie-parser");
import { AuthGuard } from "../src/auth/auth.guard";
import { JwtService, JwtModule } from "@nestjs/jwt";
import { AuthModule } from "../src/auth/auth.module";
import { InventoryModule } from "../src/inventory/inventory.module";
import { cookie , generateObjectId } from "./test.helpers";
import { DatabaseModule } from "../src/db/database.module";

describe('InventoryController (e2e)', () => {
    let app : INestApplication;
    let session : ClientSession;

    beforeAll(async() => {
        const moduleFixture: TestingModule = await Test.createTestingModule({
            imports: [
                AuthModule, 
                InventoryModule,
                JwtModule,
                DatabaseModule
            ],
        }).compile()
       
        app = moduleFixture.createNestApplication();
        // need cookie parser to access cookies
        app.use(cookieParser())
        app.useGlobalGuards(new AuthGuard(new JwtService()))
        await app.init()
    })


    beforeEach( async () => {
        const testSession = await startSession()
        session = testSession
        testSession.startTransaction()
    })

    afterEach(async () => {
        // undoes all crud operations
        try {
            await session.abortTransaction();
        } catch (error) {
            console.error('Error during transaction rollback:', error);
        } finally {            
            await session.endSession();
          }
    })

    afterAll( async () => {        
        await app.close()
    })

    describe('/ GET', () => {
        it('returns a response back', () => {
            return req(app.getHttpServer())
                .get('/api/inventory')
                .set('Cookie', cookie)
                .expect(200)
        })

        it('returns a 401 when cookie is missing', () => {
            return req(app.getHttpServer())
                .get('/api/inventory')
                .expect(401)
        })

        it('returns a response back when querying title', () => {
            return req(app.getHttpServer())
                .get('/api/inventory?title=dota')
                .set('Cookie', cookie)
                .expect(200)
        })

        it('returns a response back when querying _id', () => {
            return req(app.getHttpServer())
                .get(`/api/inventory?_id=${generateObjectId()}`)
                .set('Cookie', cookie)
                .expect(200)
                .expect(res => {
                    // id query only get max 1 result
                    return expect(res.body.length).toBeLessThanOrEqual(1)
                })
        })

        it('returns a 400 response back when with invalid _id', () => {
            return req(app.getHttpServer())
                .get(`/api/inventory?_id=invalid_id`)
                .set('Cookie', cookie)
                .expect(400)
        })

        it('returns a 400 response back when with empty id', () => {
            return req(app.getHttpServer())
                .get(`/api/inventory?_id=`)
                .set('Cookie', cookie)
                .expect(400)
        })

        it('returns a normal response back when with empty title', () => {
            return req(app.getHttpServer())
                .get(`/api/inventory?title=`)
                .set('Cookie', cookie)
                .expect(200)
        })

        it('returns a 400 response back when with multiple query param', () => {
            return req(app.getHttpServer())
                .get(`/api/inventory?title=jade&_id=${generateObjectId()}`)
                .set('Cookie', cookie)
                .expect(400)
        })
    })

    describe('/:id GET', () => {
        it('returns a 200 response', () => {
            return req(app.getHttpServer())
                // NOTE: this _id is hard coded
                .get(`/api/inventory/65a10ec8dcabc3c0cfba96d7`)
                .set('Cookie', cookie)
                .expect(200)
        })

        it('returns a 401 response when missing jwt cookie', () => {
            return req(app.getHttpServer())
                // NOTE: this _id is hard coded
                .get(`/api/inventory/65a10ec8dcabc3c0cfba96d7`)
                .expect(401)
        })

        it('returns a 404 response querying a doc that DNE', () => {
            return req(app.getHttpServer())
                // NOTE: this _id is hard coded
                .get(`/api/inventory/${generateObjectId()}`)
                .set('Cookie', cookie)
                .expect(404)
        })

        it('returns a 400 response when querying using invalid id', () => {
            return req(app.getHttpServer())
                // NOTE: this _id is hard coded
                .get(`/api/inventory/invalid_id`)
                .set('Cookie', cookie)
                .expect(400)
        })
    })

    describe('/find:data GET', () => {
        it('returns a 200', () => {
            return req(app.getHttpServer())
                //NOTE: hard coded id
                .get(`/api/inventory/find/title?_id=65a10ec8dcabc3c0cfba96d7`)
                .set('Cookie', cookie)
                .expect(200)
                .expect(res => {
                    expect(res.body.data).toBeDefined()
                })
        })

        it('returns a 401 when querying without jwt cookie', () => {
            return req(app.getHttpServer())
                //NOTE: hard coded id
                .get(`/api/inventory/find/title?_id=65a10ec8dcabc3c0cfba96d7`)
                .expect(401)                
        })

        it('returns a 400 when querying without _id query param', () => {
            return req(app.getHttpServer())
                //NOTE: hard coded id
                .get(`/api/inventory/find/title`)
                .set('Cookie', cookie)
                .expect(400)
        })

        it('returns a 400 when querying with invalid _id query param', () => {
            return req(app.getHttpServer())
                //NOTE: hard coded id
                .get(`/api/inventory/find/title?_id=invalid_id`)
                .set('Cookie', cookie)
                .expect(400)
        })

        it('returns a 404 when querying a document that DNE', () => {
            return req(app.getHttpServer())
                //NOTE: hard coded id
                .get(`/api/inventory/find/title?_id=${generateObjectId()}`)
                .set('Cookie', cookie)
                .expect(404)
        })

        it('returns a 400 when querying a unknown property that DNE', () => {
            return req(app.getHttpServer())
                //NOTE: hard coded id
                .get(`/api/inventory/find/unknownproperty?_id=65a10ec8dcabc3c0cfba96d7`)
                .set('Cookie', cookie)
                .expect(400)
        })

    })

    describe(':id PATCH', () => {
        it('returns a 200', () => {
            return req(app.getHttpServer())
                //NOTE: hard coded id
                .patch('/api/inventory/65a10ec8dcabc3c0cfba96d7')
                .set('Cookie', cookie)
                .send({available:600,borrowed:1})
                .expect(200)
        })

        it('returns a 401 when missing jwt cookie', () => {
            return req(app.getHttpServer())
                //NOTE: hard coded id
                .patch('/api/inventory/65a10ec8dcabc3c0cfba96d7')
                .send({available:600,borrowed:1})
                .expect(401)
        })

        it('returns a 404 when updating a doc that DNE', () => {
            return req(app.getHttpServer())
                //NOTE: hard coded id
                .patch(`/api/inventory/${generateObjectId()}`)
                .set('Cookie', cookie)
                .send({available:600,borrowed:1})
                .expect(404)
        })

        it('returns a 400 when id is invalid', () => {
            return req(app.getHttpServer())
                //NOTE: hard coded id
                .patch(`/api/inventory/invalid_id`)
                .set('Cookie', cookie)
                .send({available:600,borrowed:1})
                .expect(400)
        })
    })

})