import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { BookArgs, BookSchemaType, P, Query } from '../types/models';
import BookSchema from '../db/schemas/book.schema';
import InventorySchema from '../db/schemas/inventory.schema';
import { ObjectId, startSession, isValidObjectId } from 'mongoose';
import { queryLengthChecker, booksMapper } from '../utils';

export interface IBookService {
    add: (book:BookArgs) => P<BookSchemaType|null>;
    getBook: (id:ObjectId) => P<BookSchemaType|null>;
    getBooks: (query: Query<BookSchemaType>) => P<BookSchemaType[]>;
    delete: (id:ObjectId) => P<boolean>;
    update: (id:ObjectId, update: Partial<BookArgs>) => P<BookSchemaType|null>;
    search: (text:string) => P<{_id:ObjectId;title:string}[]>    
}

@Injectable()
export class BooksService implements IBookService {
    constructor(private readonly BookModel: typeof BookSchema) {}

    async add(book: BookArgs): Promise<BookSchemaType | null> {
        let session = null;
        try {
            const bookSession = await startSession();
            session = bookSession;
            bookSession.startTransaction();
            const newBook = await this.BookModel.create(book);
            const { _id } = newBook;
            const { title, total } = book;
            const newEntry = { _id, title, total, available: total };
            await InventorySchema.create(newEntry);
            await bookSession.commitTransaction();
            bookSession.endSession();
            console.log('book transaction complete!');
            return newBook;
        } catch (error) {
            console.error(error);
            if (session) {
                session.abortTransaction();
                session.endSession();
                return null;
            }
        }
        return null;
    }

    async getBook(id: ObjectId): Promise<BookSchemaType | null> {
        const book = await this.BookModel.findById(id);
        return book;
    }
    async getBooks(query: Query<BookSchemaType>): Promise<BookSchemaType[]> {
        const { title, authors, yearPublished, _id } = query;

        queryLengthChecker(query);
        if (_id) {
            return await this.BookModel.find({ _id }).limit(1).exec();
        }

        if (title) {
            const regex = new RegExp(`${title}`, 'gi');
            return await this.BookModel.find({
                title: {
                    $regex: regex,
                },
            })
                .limit(20)
                .exec();
        }

        if (authors) {
            const regex = new RegExp(`${authors}`, 'gi');
            return await this.BookModel.find({
                authors: {
                    $elemMatch: { $regex: regex },
                },
            })
                .limit(20)
                .exec();
        }

        if (yearPublished !== undefined) {
            const year = Number(yearPublished);
            if (isNaN(year)) {
                throw new HttpException(
                    'year must be a number',
                    HttpStatus.BAD_REQUEST,
                );
            }

            return await this.BookModel.find({ yearPublished: { $eq: year } })
                .limit(20)
                .exec();
        }

        return this.BookModel.find({}).limit(20).exec();
    }
    async delete(id: ObjectId) {
        const deleteStatus = await this.BookModel.findByIdAndDelete(id);
        return Boolean(deleteStatus);
    }
    async update(
        id: ObjectId,
        update: Partial<BookArgs>,
    ): Promise<BookSchemaType | null> {
        const updatedBook = await this.BookModel.findByIdAndUpdate(id, update, {
            new: true,
        });
        return updatedBook;
    }

    async search(text: string): Promise<{ _id: ObjectId; title: string }[]> {
        if (!text) {
            const books = await this.BookModel.find({}).limit(20).exec();
            return booksMapper(books);
        }

        if (isValidObjectId(text)) {
            const books = await this.BookModel.find({ _id: text })
                .limit(1)
                .exec();
            return booksMapper(books);
        }

        const regex = new RegExp(`${text}`, 'gi');
        const books = await this.BookModel.find({
            title: {
                $regex: regex,
            },
        })
            .limit(20)
            .exec();
        return booksMapper(books);
    }
}
