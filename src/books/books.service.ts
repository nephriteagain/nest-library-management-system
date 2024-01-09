import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { BookArgs, BookSchemaType, Query } from 'src/types/models';
import BookSchema from 'src/db/schemas/book.schema';
import InventorySchema from 'src/db/schemas/inventory.schema';
import { ObjectId } from 'mongoose';
import { queryLengthChecker } from 'src/utils';

@Injectable()
export class BooksService {
    async add(book: BookArgs): Promise<BookSchemaType | null> {
        const newBook = await BookSchema.create(book);
        const { _id } = newBook;
        const { title, total } = book;
        const newEntry = { _id, title, total, available: total };
        try {
            await InventorySchema.create(newEntry);
        } catch (error) {
            console.error(error);
            BookSchema.findByIdAndDelete(_id);
            return null;
        }
        return newBook;
    }

    async getBook(id: ObjectId): Promise<BookSchemaType | null> {
        const book = await BookSchema.findById(id);
        return book;
    }
    async getBooks(query: Query<BookSchemaType>): Promise<BookSchemaType[]> {
        const { title, authors, yearPublished } = query
        
        queryLengthChecker(query)
        if (title) {
            const regex = new RegExp(`${title}`, 'gi');
            return await BookSchema.find({
                title: {
                    $regex: regex,
                },
            }).limit(20).exec();
        }

        if (authors) {
            const regex = new RegExp(`${authors}`, 'gi');
            return await BookSchema.find({
                authors: {
                    $elemMatch: { $regex: regex },
                },
            }).limit(20).exec();
        }

        if (yearPublished !== undefined) {
            const year = Number(yearPublished)
            if (isNaN(year)) {
                throw new HttpException('year must be a number', HttpStatus.BAD_REQUEST)
            }

            return await BookSchema.find({yearPublished: {$eq: year}}).limit(20).exec()
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

    // TODO: on frontend merge it to the getBooks loader
    async search(
        type: 'title' | 'authors',
        string: string,
    ): Promise<BookSchemaType[]> {
        const regex = new RegExp(`${string}`, 'gi');
        if (type === 'title') {
            const query = await BookSchema.find({
                title: {
                    $regex: regex,
                },
            }).limit(20).exec();
            return query;
        } else {
            const query = await BookSchema.find({
                authors: {
                    $elemMatch: { $regex: regex },
                },
            }).limit(20).exec();
            return query;
        }
    }
}
