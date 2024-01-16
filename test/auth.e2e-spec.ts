import { Test, TestingModule } from "@nestjs/testing";
import { INestApplication } from "@nestjs/common"
import req from 'supertest'
import { ClientSession, startSession } from "mongoose";
import { AuthModule } from "../src/auth/auth.module";
import { UsersModule } from "../src/users/users.module";
import { JwtModule } from "@nestjs/jwt";
import { DatabaseModule } from "../src/db/database.module";
import { envConstants } from "../src/auth/constants";
import { sampleEmployee, cookie, generateObjectId } from "./test.helpers";
import { faker } from "@faker-js/faker";



describe('AuthController (e2e)', () => {
    let app : INestApplication;
    let session : ClientSession
    beforeAll(async() => {
        const moduleFixture: TestingModule = await Test.createTestingModule({
            imports: [
                AuthModule, 
                UsersModule,
                DatabaseModule,
                JwtModule.register({
                    global: true,
                    secret: `${envConstants.secret}`,
                    signOptions: { expiresIn: '7d' },
                }),
            ],
        }).compile()
       
        app = moduleFixture.createNestApplication();
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

    
    describe('find:data /GET', () => {
        it('returns the right data', () => {
            return req(app.getHttpServer())
                .get(`/api/auth/find/age?_id=${sampleEmployee}`)
                .expect(200)
        })

        it('returns 404 ,user not found, DNE', () => {
            return  req(app.getHttpServer())
                .get(`/api/auth/find/name?_id=${generateObjectId()}`)
                .expect(404)
        })

        it('returns unauthorized when trying to access password', () => {
            return req(app.getHttpServer())
                .get(`/api/auth/find/password?_id=${sampleEmployee}`)
                .expect(401)
        })
        
        it('returns bad request when trying to access unknown property', () => {
            return req(app.getHttpServer())
                .get(`/api/auth/find/unknowProps?_id=${sampleEmployee}`)
                .expect(400)
        })

        it('returns bad request due to missing query param', () => {
            return req(app.getHttpServer())
                .get('/api/auth/find/name')
                .expect(400)
        })

        it('returns bad request due to invalid id as ObjectId', () => {
            return req(app.getHttpServer())
                .get('/api/auth/find/name?_id=fakeid')
                .expect(400)
        })        
    })

    describe('/signin POST', () => {
        const cred = {
            email: envConstants.user.email,
            password: envConstants.user.password
        }

        it('returns ok, signs in the user, send jwt cookie', () => {
            return req(app.getHttpServer())
                .post('/api/auth/login')
                .send(cred)
                .expect(200)
                // this callback checks if the jwt cookie do exist
                .expect(res => {
                    const setCookieHeader = res.headers['set-cookie'];
                    if (!setCookieHeader) {
                        throw new Error('Expected Set-Cookie header not found');
                    }
        
                    const setCookieArray = Array.isArray(setCookieHeader)
                        ? setCookieHeader
                        : [setCookieHeader];
        
                    const httpOnlyCookieExists = setCookieArray.some((cookie) =>
                        cookie.includes('jwt') && cookie.includes('HttpOnly')
                    );
        
                    if (!httpOnlyCookieExists) {
                        throw new Error('Expected HTTP-only cookie not found');
                    }
                })
        })

        it('returns not found user does not exist', () => {
            return req(app.getHttpServer())
                .post('/api/auth/login')
                .send({email: 'wrongemail@gmail.com', password: 'password'})
                .expect(404)
        })

        it('returns unauthorized, due toincorrect password', () => {
            return req(app.getHttpServer())
                .post('/api/auth/login')
                .send({...cred, password: 'wrongpassword'})
                .expect(401)
        })
        
    })

    describe('/logout POST', () => {
        const cred = {
            email: envConstants.user.email,
            password: envConstants.user.password
        }
        it ('succesfully logouts user', () => {

            // logins the user first
            return req(app.getHttpServer())
                .post('/api/auth/login')
                .send(cred)
                .expect(200)
                .expect(() => {
                    return req(app.getHttpServer())
                    .post('/api/auth/logout')
                    .expect(200)
                    // this callback checks if the jwt cookie is already removed
                    .expect(res => {
                        const setCookieHeader = res.headers['set-cookie'];
                        if (!setCookieHeader) {
                            throw new Error('Expected Set-Cookie header not found');
                        }
            
                        const setCookieArray = Array.isArray(setCookieHeader)
                            ? setCookieHeader
                            : [setCookieHeader];
            
                        const httpOnlyCookieExists = setCookieArray.every((cookie) =>
                            !cookie.includes('jwt') && !cookie.includes('HttpOnly')
                        );
            
                        if (httpOnlyCookieExists) {
                            throw new Error('Expected HTTP-only cookie not found');
                        }
                    })
                })
           
        })
    })

    describe('/register POST', () => {
        const email = faker.internet.email()
        const newUser = {
            "user": {
                "name": faker.person.fullName,
                "age": faker.number.int({min:14, max:100}),
                "email": email,
                "password": "password"
            },
            "secret":  envConstants.secret
        }

        it('successfully register a user', () => {
            req(app.getHttpServer())
                .post('/api/auth/register')
                .send(newUser)
                .expect(200)
        })

        it('register a already existing user', () => {
            req(app.getHttpServer())
                .post('/api/auth/register')
                .send(newUser)
                .expect(400)
        })

        it('returns 400 when sending invalid schema', () => {
            req(app.getHttpServer())
                .post('/api/auth/register')
                .send({secret: newUser.secret})
                .expect(400)
        })

        it('returns 401 when sending incorrect secret key', () => {
            req(app.getHttpServer())
                .post('/api/auth/register')
                .send({...newUser, secret: 'wrong_password'})
                .expect(401)
        })


    })

    describe('/credential POST', () => {
        it('successfully auto login using jwt cookie', () => {
            req(app.getHttpServer())
                .post('/api/auth/credentials')                
                .set('Cookie', cookie)
                .expect(200)
        })

        it('returns 204 since no jwt cookie found', () => {
            req(app.getHttpServer())
                .post('/api/auth/credentials')                
                .expect(204)
        })
    })
    
})