import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { BookArgs, BookSchemaType, Query } from 'src/types/models';
import BookSchema from 'src/db/schemas/book.schema';
import InventorySchema from 'src/db/schemas/inventory.schema';
import { ObjectId, startSession, isValidObjectId } from 'mongoose';
import { queryLengthChecker, booksMapper } from 'src/utils';

@Injectable()
export class BooksService {
    async add(book: BookArgs): Promise<BookSchemaType | null> {
        let session = null;
        try {
            const bookSession = await startSession();
            session = bookSession;
            bookSession.startTransaction();
            const newBook = await BookSchema.create(book);
            const { _id } = newBook;
            const { title, total } = book;
            const newEntry = { _id, title, total, available: total };
            await InventorySchema.create(newEntry);
            await bookSession.commitTransaction();
            bookSession.endSession();
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
        const book = await BookSchema.findById(id);
        return book;
    }
    async getBooks(query: Query<BookSchemaType>): Promise<BookSchemaType[]> {
        const { title, authors, yearPublished, _id } = query;

        queryLengthChecker(query);
        if (_id) {
            return await BookSchema.find({ _id }).limit(1).exec();
        }

        if (title) {
            const regex = new RegExp(`${title}`, 'gi');
            return await BookSchema.find({
                title: {
                    $regex: regex,
                },
            })
                .limit(20)
                .exec();
        }

        if (authors) {
            const regex = new RegExp(`${authors}`, 'gi');
            return await BookSchema.find({
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

            return await BookSchema.find({ yearPublished: { $eq: year } })
                .limit(20)
                .exec();
        }

        return BookSchema.find({}).limit(20).exec();
    }
    async delete(id: ObjectId) {
        const deleteStatus = await BookSchema.findByIdAndDelete(id);
        return Boolean(deleteStatus);
    }
    async update(
        id: ObjectId,
        update: Partial<BookArgs>,
    ): Promise<BookSchemaType | null> {
        const updatedBook = await BookSchema.findByIdAndUpdate(id, update, {
            new: true,
        });
        return updatedBook;
    }

    async search(text: string): Promise<{ _id: ObjectId; title: string }[]> {
        if (!text) {
            const books = await BookSchema.find({}).limit(20).exec();
            return booksMapper(books);
        }

        if (isValidObjectId(text)) {
            const books = await BookSchema.find({ _id: text }).limit(1).exec();
            return booksMapper(books);
        }

        const regex = new RegExp(`${text}`, 'gi');
        const books = await BookSchema.find({
            title: {
                $regex: regex,
            },
        })
            .limit(20)
            .exec();
        return booksMapper(books);
    }
}
