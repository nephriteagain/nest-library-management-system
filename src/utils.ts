import { HttpException, HttpStatus } from '@nestjs/common';
import { BookSchemaType, MemberSchemaType } from './types/models';
import { ObjectId } from 'mongoose';

/**
 *
 * @param query query params
 * @description throws an error if there is more than one defined query params
 */
export function queryLengthChecker(query: Record<string, any>): void {
    let queryLength = 0;
    for (const v of Object.values(query)) {
        if (v !== undefined) queryLength++;
    }
    if (queryLength > 1) {
        throw new HttpException(
            'only one query param allowed!',
            HttpStatus.BAD_REQUEST,
        );
    }
}


export function booksMapper(books: BookSchemaType[]) : {_id:ObjectId; title:string}[] {
    const bookMap = books.map(b => {
        return {
            _id: b._id,
            title: b.title
        }
    })

    return bookMap
}

export function membersMapper(members: MemberSchemaType[]) : { _id: ObjectId; name: string; email: string }[] {
    const memberMap = members.map(m => {
        return {
            _id: m._id,
            name: m.name,
            email: m.email
        }
    })
    return memberMap
}
