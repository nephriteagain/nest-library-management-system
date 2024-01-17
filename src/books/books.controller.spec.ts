import { Test, TestingModule } from '@nestjs/testing';
import { BooksController } from './books.controller';
import { AuthService } from '../auth/auth.service';
import { InventoryService } from '../inventory/inventory.service';
import { BooksService, IBookService } from './books.service';
import { UsersModule } from '../users/users.module';
import { DatabaseModule } from '../db/database.module';
import { JwtModule } from '@nestjs/jwt';
import { envConstants } from '../auth/constants';
import { BookSchemaType } from '../types/models';
import {
    BadRequestException,
    HttpStatus,
    InternalServerErrorException,
    NotFoundException,
    Query,
} from '@nestjs/common';
import { ObjectId } from 'mongoose';
import { Response } from 'express';
import { generateObjectId } from '../../test/test.helpers';

// Mock all dependencies of the module
jest.mock('../auth/auth.service');
jest.mock('../inventory/inventory.service');
jest.mock('./books.service');

describe('BooksController', () => {
    let controller: BooksController;
    let bookService: IBookService;
    let app: TestingModule;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            controllers: [BooksController],
            providers: [
                AuthService,
                InventoryService,
                BooksService, // No need for the manual mock here, jest.mock('./books.service') will handle it.
            ],
            imports: [
                UsersModule,
                DatabaseModule,
                JwtModule.register({
                    global: true,
                    secret: `${envConstants.secret}`,
                    signOptions: { expiresIn: '7d' },
                }),
            ],
        }).compile();
        controller = module.get<BooksController>(BooksController);
        bookService = module.get<IBookService>(BooksService);
        app = module;
    });

    afterAll(async () => {
        jest.restoreAllMocks();
        await app.close();
    });

    it('should be defined', () => {
        expect(controller).toBeDefined();
    });

    describe('getBooks / GET', () => {
        it('successfully returns books', async () => {
            const result: BookSchemaType[] = [];
            jest.spyOn(bookService, 'getBooks').mockImplementationOnce(
                async ({}) => result,
            );
            const books = await controller.getBooks();
            expect(books).toBe(result);
        });

        it('throws a BadRequestException when multiple query params', async () => {
            jest.spyOn(bookService, 'getBooks').mockImplementationOnce(
                async () => {
                    throw new BadRequestException();
                },
            );

            await expect(async () => {
                await controller.getBooks('kidney', 'god');
            }).rejects.toThrow(BadRequestException);
        });
    });

    describe('getBook /:id GET', () => {
        const result = {
            _id: '65a10ec8dcabc3c0cfba96d7',
            title: 'the first book',
            authors: ['jade', 'kidneygod'],
            yearPublished: 2000,
            dateAdded: 1705053841822,
            __v: 0,
        } as any as BookSchemaType;

        const mockRes = {
            send: jest.fn(),
            sendStatus: jest.fn(),
        } as unknown as Response;

        const id = '65a10ec8dcabc3c0cfba96d7' as string & ObjectId;

        it('sucessfully returns book', async () => {
            jest.spyOn(bookService, 'getBook').mockImplementationOnce(
                async (id: ObjectId) => result,
            );

            await controller.getBook(id, mockRes);
            expect(mockRes.send).toHaveBeenCalledWith(result);
        });

        it('throws a not found', async () => {
            jest.spyOn(bookService, 'getBook').mockImplementationOnce(
                async (id: ObjectId) => null,
            );
            await expect(async () => {
                await controller.getBook(id, mockRes);
            }).rejects.toThrow(NotFoundException);
        });
    });

    describe('searchBooks /search GET', () => {
        const result = [] as { title: string; _id: ObjectId }[];
        it('returns the searched results', async () => {
            jest.spyOn(bookService, 'search').mockImplementationOnce(
                async (q: string) => result,
            );
            const search = await controller.searchBooks('book');
            expect(search).toBe(result);
        });
    });

    describe('getData /find/:data GET', () => {
        it('throws bad request when missing id', async () => {
            jest.spyOn(bookService, 'getBook').mockImplementationOnce(
                async (id) => {
                    return {} as any;
                },
            );
            await expect(async () => {
                await controller.getData('title', '' as any);
            }).rejects.toThrow(BadRequestException);
        });
        it('returns a value', async () => {
            const result = { data: 'randomData' } as any;
            jest.spyOn(bookService, 'getBook').mockImplementationOnce(
                async (id) => {
                    return { title: 'randomData' } as any;
                },
            );

            // Call the getData method
            const book = (await controller.getData(
                'title',
                'randomid' as any,
            )) as any;
            // Assertions
            expect(book.data).toEqual(result.data);
        });

        it('throws a not found', async () => {
            const result = { data: 'randomData' } as any;
            jest.spyOn(bookService, 'getBook').mockImplementationOnce(
                async (id) => {
                    throw new NotFoundException();
                },
            );
            await expect(
                async () =>
                    await controller.getData('title', 'randomid' as any),
            ).rejects.toThrow(NotFoundException);
        });

        it('throws a bad request', async () => {
            const result = { data: 'randomData' } as any;
            jest.spyOn(bookService, 'getBook').mockImplementationOnce(
                async (id) => {
                    return { title: 'randomData' } as any;
                },
            );

            expect(async () => {
                (await controller.getData(
                    'randomshit' as any,
                    'randomid' as any,
                )) as any;
            }).rejects.toThrow(BadRequestException);
        });
    });

    describe('addBook / POST', () => {
        it('returns a result', async () => {
            const result = {} as any;
            jest.spyOn(bookService, 'add').mockImplementationOnce(
                (b) => result,
            );
            expect(await controller.addBook({} as any)).toBeDefined();
        });
        it('throws a 500', () => {
            jest.spyOn(bookService, 'add').mockImplementationOnce(
                (b) => null as any,
            );
            expect(async () => {
                await controller.addBook({} as any);
            }).rejects.toThrow(InternalServerErrorException);
        });
    });

    describe('deleteBook /:id DELETE', () => {
        const mockRes = {
            sendStatus: jest.fn(),
        } as unknown as Response;

        it('successfully delete a doc', async () => {
            jest.spyOn(bookService, 'delete').mockImplementationOnce(
                (id) => true as any,
            );
            await controller.deleteBook(generateObjectId(), mockRes);
            expect(mockRes.sendStatus).toHaveBeenCalledWith(HttpStatus.OK);
        });

        it('throws a 404', () => {
            jest.spyOn(bookService, 'delete').mockImplementationOnce((id) => {
                throw new NotFoundException();
            });
            expect(async () => {
                await controller.deleteBook(generateObjectId(), mockRes);
            }).rejects.toThrow(NotFoundException);
        });
    });

    describe('updateBook /:id PATCH', () => {
        const mockRes = {
            send: jest.fn(),
        } as unknown as Response;

        it('returns the updated value', async () => {
            const result = {} as any;
            jest.spyOn(bookService, 'update').mockImplementationOnce(
                (id, update) => result,
            );
            await controller.updateBook({} as any, generateObjectId(), mockRes);
            expect(mockRes.send).toHaveBeenCalledWith(result);
        });

        it('throws  a 404', async () => {
            jest.spyOn(bookService, 'update').mockImplementationOnce(() => {
                throw new NotFoundException();
            });
            expect(async () =>
                controller.updateBook({} as any, generateObjectId(), mockRes),
            ).rejects.toThrow(NotFoundException);
        });
    });
});
