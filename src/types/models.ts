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
export const positiveIntNumber = z.number().int().positive()

export const signInSchema = z.object({
    email: z.string().email(),
    password: z.string()
}).required()
export type SignInArgs = z.infer<typeof signInSchema>
    

export const bookArgsSchema = z.object({
    title: z.string(),
    authors: z.array(z.string()),
    yearPublished: positiveIntNumber
}).required()
export const partialBookArgsSchema = z.object({
    title: z.string(),
    authors: z.array(z.string()),
    yearPublished: positiveIntNumber,
}).partial()
export type BookArgs = z.infer<typeof bookArgsSchema>
export interface BookSchemaType extends BookArgs, Id {
    dateAdded: number;
}



export const membersArgsSchema = z.object({
    name: z.string(),
    age: positiveIntNumber
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
    promisedReturnDate: positiveIntNumber
}).required()
export type BorrowArgs = z.infer<typeof BorrowArgsSchema>
export interface BorrowSchemaType extends BorrowArgs, Id {
    approvedBy: ObjectId;
    date: number;
}


export const InventoryArgsSchema = z.object({
    title: z.string(),
    total: positiveIntNumber,
    available: positiveIntNumber,
    borrowed: positiveIntNumber
}).required()
export type InventoryArgs = z.infer<typeof InventoryArgsSchema>
export interface InventorySchemaType extends InventoryArgs, Id {}


export const EmployeeArgsSchema = z.object({
    name: z.string(),
    age: positiveIntNumber,
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
    borrowDate: positiveIntNumber    
}).required()
export type ReturnArgs = z.infer<typeof ReturnArgsSchema>
export interface ReturnSchemaType extends ReturnArgs, Id {
    returnDate: number;
    approvedBy: ObjectId
}

export const PenaltyArgsSchema = z.object({
    bookId: zodOIDValidator,
    borrower: zodOIDValidator,
    penalty: positiveIntNumber,
}).required()
export type PenaltyArgs = z.infer<typeof PenaltyArgsSchema>

export interface PenaltySchemaType extends PenaltyArgs, Id {
    approvedBy: ObjectId;
}