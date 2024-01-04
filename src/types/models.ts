import { ObjectId, Document, isValidObjectId } from 'mongoose';
import { z } from 'zod';

export type BaseDocument<T> = T & Document;

export type P<T> = Promise<T>

type Id = {_id: ObjectId}

function objectIdValidator(value:unknown) {
    if (!isValidObjectId(value)) {
        console.log('invalid ObjectId')
        throw new Error('invalid id')
    }
    return true
}

export const zodOIDValidator = z.custom<ObjectId>(objectIdValidator)
export const nonNegativeIntNumber = z.number().int().nonnegative()

export const signInSchema = z.object({
    email: z.string().email(),
    password: z.string()
}).required()
export type SignInArgs = z.infer<typeof signInSchema>
    

export const bookArgsSchema = z.object({
    title: z.string(),
    authors: z.array(z.string()),
    yearPublished: nonNegativeIntNumber
}).required()
export const partialBookArgsSchema = z.object({
    title: z.string(),
    authors: z.array(z.string()),
    yearPublished: nonNegativeIntNumber,
}).partial()
export type BookArgs = z.infer<typeof bookArgsSchema>
export interface BookSchemaType extends BookArgs, Id {
    dateAdded: number;
}



export const membersArgsSchema = z.object({
    name: z.string(),
    age: nonNegativeIntNumber
}).required()
export type MemberArgs = z.infer<typeof membersArgsSchema>
export interface MemberSchemaType extends MemberArgs, Id {
    joinDate: number;
    approvedBy: ObjectId;
}

export const BorrowArgsSchema = z.object({
    bookId: zodOIDValidator,
    title: z.string(),
    borrower: zodOIDValidator,
    promisedReturnDate: nonNegativeIntNumber
}).required()
export type BorrowArgs = z.infer<typeof BorrowArgsSchema>
export interface BorrowSchemaType extends BorrowArgs, Id {
    approvedBy: ObjectId;
    date: number;
}


export const InventoryArgsSchema = z.object({
    title: z.string(),
    total: nonNegativeIntNumber,
    available: nonNegativeIntNumber,
    borrowed: nonNegativeIntNumber
}).required()
export type InventoryArgs = z.infer<typeof InventoryArgsSchema>
export interface InventorySchemaType extends InventoryArgs, Id {}


export const EmployeeArgsSchema = z.object({
    name: z.string(),
    age: nonNegativeIntNumber,
    email: z.string().email(),
    password: z.string()
}).required()
export type EmployeeArgs = z.infer<typeof EmployeeArgsSchema>
export interface EmployeeSchemaType extends EmployeeArgs, Id {
    joinDate: number;
}


export const ReturnArgsSchema = z.object({
    bookId: zodOIDValidator,
    borrower: zodOIDValidator,
    borrowDate: nonNegativeIntNumber    
}).required()
export type ReturnArgs = z.infer<typeof ReturnArgsSchema>
export interface ReturnSchemaType extends ReturnArgs, Id {
    returnDate: number;
    approvedBy: ObjectId
}

export const PenaltyArgsSchema = z.object({
    bookId: zodOIDValidator,
    borrower: zodOIDValidator,
    penalty: nonNegativeIntNumber,
}).required()
export type PenaltyArgs = z.infer<typeof PenaltyArgsSchema>

export interface PenaltySchemaType extends PenaltyArgs, Id {
    approvedBy: ObjectId;
}