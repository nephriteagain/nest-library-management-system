import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { BooksModule } from '../src/books/books.module';
import { UsersModule } from '../src/users/users.module';
import { AuthModule } from '../src/auth/auth.module';
import { DatabaseModule } from '../src/db/database.module';
import { ClientSession, startSession } from 'mongoose';
import { generateObjectId } from './test.helpers';

describe('BooksController (e2e)', () => {
    let app : INestApplication;
    let session : ClientSession
    beforeAll(async() => {
        const moduleFixture: TestingModule = await Test.createTestingModule({
            imports: [BooksModule, UsersModule, AuthModule, DatabaseModule],
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

    const newBookEntry =  {
        "title": "jestTest",
        "authors": ["kidneygod"],
        "yearPublished"   : 2024,
        "total": 100
    }

    describe('/ GET', () => {
        it('returns a 200', () => {
            return request(app.getHttpServer())
                .get('/api/books')
                .expect(200)
        })        
        describe('with query params',()  => {
            it('should get books with title query', async () => {
                await request(app.getHttpServer())
                    .get('/api/books?title=test')
                    .expect(200);
            });
        
            it('should get a book with _id query', async () => {
                const id = generateObjectId();
                await request(app.getHttpServer())
                    .get(`/api/books?_id=${id}`)
                    .expect(200);
            });
        
            it('should get books with authors query', async () => {
                await request(app.getHttpServer())
                    .get('/api/books?authors=kidneygod')
                    .expect(200);
            });
        
            it('should get books with yearPublished query', async () => {
                await request(app.getHttpServer())
                    .get('/api/books?yearPublished=2023')
                    .expect(200);
            });
        })
        
        it('throws because yearPublished is NaN', () => {
            return  request(app.getHttpServer())
                .get('/api/books?yearPublished=dog')
                .expect(400)
        })

        it('throws because multiple query params', () =>  {
            return request(app.getHttpServer())
                .get('/api/books?title=dota&authors=dog')
                .expect(400)
        })

        it('throws because _id is not ObjectId', () => {
            return request(app.getHttpServer())
                .get('/api/books?_id=dog')
                .expect(400)
        })


    })

            

    describe('/ POST & DELETE', () => {
        

        const { title, ...noTitle } = newBookEntry
        it('should create a new document', () =>  {
            return request(app.getHttpServer())
                .post('/api/books', )
                .send(newBookEntry)
                .expect(201)
        })
        it('should throw a bad request', () =>  {
            return request(app.getHttpServer())
                .post('/api/books', )
                .send(noTitle)
                .expect(400)
        })
        it('should delete the newly created document',  async () => {
            const res = await request(app.getHttpServer())
                .post('/api/books', )
                .send(newBookEntry)
                .expect(201)

            const {_id} = await res.body
            return request(app.getHttpServer())
                .delete(`/api/books/${_id}`)
                .expect(200)            
        })    
    })


    describe('/:id GET', () => {
        it('returns the document',async  () => {
            const res = await request(app.getHttpServer())
                .post('/api/books/')
                .send(newBookEntry)
                .expect(201)
            const { _id } = await res.body
            return request(app.getHttpServer())
                .get(`/api/books/${_id}`)
                .expect(200)
        })
        it('should return bad request, reason: id is invalid ObjectId', () => {
            return  request(app.getHttpServer())
                .get('/api/books/dogerland')
                .expect(400)
        })
        it('should return not found, reason: book does not exist', async () => {
            const res = await   request(app.getHttpServer())
                .get(`/api/books/${generateObjectId()}`)
                .expect(404)
        })
        it('should return the data needed', async () => {
            const res = await request(app.getHttpServer())
                .post('/api/books/')
                .send(newBookEntry)
                .expect(201)
            const { _id } = await res.body
            const respo = await request(app.getHttpServer())
                .get(`/api/books/find/title?_id=${_id}`)
                .expect(200)                
            const { data } = respo.body;
            expect(data).toBeDefined()
        })
        it('queries the endpoint with valid id but with property that DNE', async () => {
            const res = await request(app.getHttpServer())
                .post('/api/books/')
                .send(newBookEntry)
                .expect(201)
            const { _id } = await res.body
            return request(app.getHttpServer())
                .get(`/api/books/find/propertyThatDoesNotExist?_id=${_id}`)
                .expect(400) 
        })

    })

    // NOTE: data can be any property of the document EXCEPT: password
    describe('find/:data', () => {
        it('should return bad request, reason: missing _id query param', () => {
            return request(app.getHttpServer())
                .get('/api/books/find/title')
                .expect(400)
        })

        it('should return not found, reason: invalid _id, should be of type ObjectId', () => {
            return request(app.getHttpServer())
                .get(`/api/books/find/title?_id=dogerland`)
                .expect(400)
        })
        it('should return not found, reason: valid _id but DNE', () => {

            return request(app.getHttpServer())
                .get(`/api/books/find/title?_id=${generateObjectId()}`)
                .expect(404)
        })
    })
    

    describe('/:id DELETE', () => {
        it('throws bad request because id  is not an ObjectId', () => {
            return request(app.getHttpServer())
                .delete(`/api/books/dogerland`)
                .expect(400)
        })
        it('throws not found becuase id provided is  not found', () => {
            return request(app.getHttpServer())
                .delete(`/api/books/${generateObjectId()}`)
                .expect(404)
        })
    })

    describe('/:id PATCH', () => {
        const newBookEntry =  {
            "title": "jestTest",
            "authors": ["kidneygod"],
            "yearPublished"   : 2024,
            "total": 100
        }
            
        it('should update the document', async () => {
            const res = await request(app.getHttpServer())
            .post('/api/books', )
            .send(newBookEntry)
            .expect(201)
            const {_id} = await res.body

            return request(app.getHttpServer())
                .patch(`/api/books/${_id}`)
                .send({title: 'new title', yearPublished: 400})
                .expect(200)
        })
        
        it('should return not found when updating a non existing document', () => {
            return request(app.getHttpServer())
                .patch(`/api/books/${generateObjectId()}`)
                .send({title: 'title'})
                .expect(404)
        })

        it('should  return bad request, reason: invalid id', () => {
            return request(app.getHttpServer())
                .patch('/api/books/dog')
                .send({})
                .expect(400)
        })
        it('should return a  bad request, reason: invalid body schema', () => {
            return request(app.getHttpServer())
                .patch(`/api/books/${generateObjectId}`)
                .send({invalidProps: 'i am invalid!'})
                .expect(400)
        })

        
    })

    describe('/search GET', ()  => {
        it('query without param ', ()  => {
            return request(app.getHttpServer())
                .get('/api/books/search')
                .expect(200)
        })

        it('query with title param', () => {
            return request(app.getHttpServer())
                .get('/api/books/search?q=test')
                .expect(200)
        })

        it('query with a valid id param', async () => {
            const res = await request(app.getHttpServer())
                .post('/api/books/')
                .send(newBookEntry)
                .expect(201)
            const { _id } = await res.body
            const searchResponse = await request(app.getHttpServer())
                .get(`/api/books/search?q=${_id}`)
                .expect(200);

        // Assuming the response body is expected to be an array
            expect(searchResponse.body).toBeInstanceOf(Array);

        // Expecting the array to have a length of 1
            expect(searchResponse.body).toHaveLength(1);
        })
        it('query with valid id, but does not exist', async () => {
            const res = await request(app.getHttpServer())
                .get(`/api/books/search?q=${generateObjectId()}`)
                .expect(200)
            expect(res.body).toHaveLength(0)
        })
    })


    

})

