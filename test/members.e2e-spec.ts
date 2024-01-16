import { Test, TestingModule } from "@nestjs/testing";
import { INestApplication } from "@nestjs/common"
import req from 'supertest'
import { ClientSession, startSession } from "mongoose";
import { AuthModule } from "../src/auth/auth.module";
import { UsersModule } from "../src/users/users.module";
import { DatabaseModule } from "../src/db/database.module";
import { envConstants } from "../src/auth/constants";
import { sampleEmployee, cookie, generateObjectId } from "./test.helpers";
import { faker } from "@faker-js/faker";
import { MembersModule } from "../src/members/members.module";
import { z } from "zod";
import { zodOIDValidator } from "../src/types/models";
import cookieParser = require("cookie-parser");
import { AuthGuard } from "../src/auth/auth.guard";
import { JwtModule, JwtService } from "@nestjs/jwt";

describe('MembersController (e2e)', () => {
    let app : INestApplication;
    let session : ClientSession
    beforeAll(async() => {
        const moduleFixture: TestingModule = await Test.createTestingModule({
            imports: [
                AuthModule, 
                UsersModule,
                DatabaseModule,
                MembersModule,
                JwtModule
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
        it('returns an array of members', () => {
            return req(app.getHttpServer())
                .get('/api/members/')
                .set('Cookie', cookie)
                .expect(200)
        })

        it('returns an array of members with query name', () => {
            return req(app.getHttpServer())
                .get('/api/members?name=gorlock')
                .set('Cookie', cookie)
                .expect(200)
        })

        it('returns an array of members with query email', () => {
            return req(app.getHttpServer())
                .get('/api/members?email=gorlock@gmail.com')
                .set('Cookie', cookie)
                .expect(200)
                .expect(res => {
                    const body = res.body
                    expect(body.length).toBeLessThanOrEqual(1)
                })
        })

        it('returns an array of members with query _id', () => {
            return req(app.getHttpServer())
                .get(`/api/members?_id=${sampleEmployee}`)
                .set('Cookie', cookie)
                .expect(200)
                .expect(res => {
                    const body = res.body
                    expect(body.length).toBeLessThanOrEqual(1)
                })
        })

        it('returns a 400 because invalid email query', () => {
            return req(app.getHttpServer())
                .get('/api/members?email=notanemailformat')
                .set('Cookie', cookie)
                .expect(400)
        })

        it('returns a 400 because invalid _id query', () => {
            return req(app.getHttpServer())
                .get('/api/members?_id=notanobjectidformat')
                .set('Cookie', cookie)
                .expect(400)
        })

        it('returns a 400 because of multiple query params', () => {
            return req(app.getHttpServer())
                .get('/api/members?name=kidney&email=kidney@gmail.com')
                .set('Cookie', cookie)
                .expect(400)
        })
        



    })

    describe('/search GET', () => {
        const SearchSchema = z.object({
            _id: zodOIDValidator,
            name: z.string(),
            email: z.string().email(),
        }).required()

        it('searches without query param filters', () => {
            return req(app.getHttpServer())
                .get('/api/members/search')
                .set('Cookie', cookie)
                .expect(200)
                .expect(({body}) => {
                    for (const m of body) {
                        SearchSchema.parse(m)
                    }
                })
        })
        it('searches with a empty query param filter', () => {
            return req(app.getHttpServer())
                .get('/api/members/search?q=')
                .set('Cookie', cookie)
                .expect(200)
                .expect(({body}) => {
                    for (const m of body) {
                        SearchSchema.parse(m)
                    }
                })
        })
        it('searches with a valid objectid', () => {
            return req(app.getHttpServer())
                .get(`/api/members/search?q=${generateObjectId()}`)
                .set('Cookie', cookie)
                .expect(200)
                .expect(({body}) => {
                    for (const m of body) {
                        SearchSchema.parse(m)
                    }
                })
        })
        it('searches with a valid  email', () => {
            return req(app.getHttpServer())
                .get(`/api/members/search?q=${faker.internet.email()}`)
                .set('Cookie', cookie)
                .expect(200)
                .expect(({body}) => {
                    for (const m of body) {
                        SearchSchema.parse(m)
                    }
                })
        })
        it('searches with a valid  text, which searches names of members', () => {
            return req(app.getHttpServer())
                .get(`/api/members/search?q=${faker.person.firstName()}`)
                .set('Cookie', cookie)
                .expect(200)
                .expect(({body}) => {
                    for (const m of body) {
                        SearchSchema.parse(m)
                    }
                })
        })
    })

    describe('/:id GET', () => {
        it('returns a document', () => {
            return req(app.getHttpServer())
                .get(`/api/members/659e10a95b6aa6d681c13620`)
                .set('Cookie', cookie)
                .expect(200)
        })
        it('returns a 401 response when missing jwt cookie', () => {
            return req(app.getHttpServer())
                // NOTE: this _id is hard coded
                .get(`/api/members/65a10ec8dcabc3c0cfba96d7`)
                .expect(401)
        })

        it('returns 400 when document DNE', () => {
            return req(app.getHttpServer())
                .get(`/api/members/${generateObjectId()}`)
                .set('Cookie', cookie)
                .expect(404)
        })
        it('returns 404 when id is invalid ObjectId', () => {
            return req(app.getHttpServer())
                .get(`/api/members/invalidId`)
                .set('Cookie', cookie)
                .expect(400)
        })
    })

    // NOTE: you need jwt cookie for this
    describe('/ POST', () => {
        it('creates a new member',  () => {
            return req(app.getHttpServer())
                .post('/api/members/')
                .set('Cookie', cookie)
                .send({
                    name: faker.person.fullName(),
                    age: faker.number.int({min:14, max:100}),
                    email: faker.internet.email()
                })
                .expect(201)                

        })
        it('returns 401 when creating a new member without jwt cookie',async  () => {
            return await req(app.getHttpServer())
                .post('/api/members/')
                .send({
                    name: faker.person.fullName(),
                    age: faker.number.int({min:14, max:100}),
                    email: faker.internet.email()
                })
                .expect(401)                

        })
        it('returns 400 when sending invalid schema', () => {
            return req(app.getHttpServer())
                .post('/api/members')
                .set('Cookie', cookie)
                .send({
                    invalidSchema: 'i am invalid'
                })
                .expect(400)
        })
        it('returns 400 when creating a member with duplicate email', () => {
            const user = {
                name: faker.person.fullName(),
                age: faker.number.int({min:0, max:100}),
                email: faker.internet.email(),
            }
            return req(app.getHttpServer())
                .post('/api/members')
                .set('Cookie', cookie)
                .send(user)
                .expect(201)
                .expect(() => {
                    req(app.getHttpServer())
                    .post('/api/members')
                    .set('Cookie', cookie)
                    .send(user)
                    .expect(400)
                })
        })            
                    
    })

    describe('/:id DELETE', () => {
        it('sucessfully deletes a member', () => {
            // create the user first
            return req(app.getHttpServer())
                .post('/api/members/')
                .set('Cookie', cookie)
                .send({
                    name: faker.person.fullName(),
                    age: faker.number.int({min:14, max:100}),
                    email: faker.internet.email()
                })
                .expect(201)
                .expect(res => {
                    const { _id } = res.body
                    expect(_id).toBeDefined()
                    return req(app.getHttpServer())
                        .delete(`/api/members/${_id}`)
                        .set('Cookie', cookie)
                        .expect(200)
                })
        })

        it('returns 401 when trying to delete a member without jwt cookie', () => {
            return req(app.getHttpServer())
                .delete(`/api/members/${generateObjectId()}`)
                .expect(401)
        })

        it('return 404 when trying to delete a member that DNE', () => {
            return req(app.getHttpServer())
                .delete(`/api/members/${generateObjectId()}`)
                .set('Cookie', cookie)
                .expect(404)
        })

        it('return 400 when passing an invalid id as route param', () => {
            return req(app.getHttpServer())
                .delete(`/api/members/invalidObjectId`)
                .set('Cookie', cookie)
                .expect(400)
        })
    })

    describe('find:data GET', () => {
        it('retuns the needed data',  () => {
            // creates the member first
            return req(app.getHttpServer())
                .post('/api/members/')
                .set('Cookie', cookie)
                .send({
                    name: faker.person.fullName(),
                    age: faker.number.int({min:14, max:100}),
                    email: faker.internet.email()
                })
                .expect(201)     
                .expect(res => {
                    const {_id} = res.body;
                    expect(_id).toBeDefined()
                    return req(app.getHttpServer())
                        .get(`/api/members/find/name?_id=${_id}`)
                        .set('Cookie', cookie)                        
                        .expect(200)
                })
        })

        it('returns 404 ,user not found, DNE', () => {
            return  req(app.getHttpServer())
                .get(`/api/members/find/name?_id=${generateObjectId()}`)
                    .set('Cookie', cookie)                        
                    .expect(404)
        })


        it('returns bad request when trying to access unknown property', () => {
            return req(app.getHttpServer())
                .post('/api/members/')
                .set('Cookie', cookie)
                .send({
                    name: faker.person.fullName(),
                    age: faker.number.int({min:14, max:100}),
                    email: faker.internet.email()
                })
                .expect(201)     
                .expect(res => {
                    const {_id} = res.body;
                    expect(_id).toBeDefined()
                    return req(app.getHttpServer())
                        .get(`/api/members/find/unknownProps?_id=${_id}`)
                        .set('Cookie', cookie)                        
                        .expect(400)
                })
        })

        it('returns bad request due to missing query param', () => {
            return req(app.getHttpServer())
                .get('/api/members/find/name')
                .set('Cookie', cookie)                        
                .expect(400)
        })

        it('returns bad request due to invalid id as ObjectId', () => {
            return req(app.getHttpServer())
                .get('/api/members/find/name?_id=fakeid')
                .set('Cookie', cookie)                        
                .expect(400)
        })     

        it('returns unauthorzied due to  missing jwt cookie', () => {
            return req(app.getHttpServer())
                .get('/api/members/find/name?_id=fakeid')
                .expect(401)
        })     
    })



})