import { Test, TestingModule } from "@nestjs/testing";
import { INestApplication } from "@nestjs/common"
import request from 'supertest'
import { ClientSession, startSession } from "mongoose";
import { AuthModule } from "../src/auth/auth.module";
import { UsersModule } from "../src/users/users.module";
import { JwtModule } from "@nestjs/jwt";
import { DatabaseModule } from "../src/db/database.module";
import { envConstants } from "../src/auth/constants";
import { generateObjectId } from '../src/utils.spec';
import { sampleEmployee } from "./test.helpers";

const req = request;

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

    
    
})