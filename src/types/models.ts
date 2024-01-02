import { ObjectId, Document } from 'mongoose';

export type BaseDocument<T> = T & Document;

export type P<T> = Promise<T>

type Id = {_id: ObjectId}

export type BookArgs = {
    title: string;
    authors: string[];
    yearPublished: number;    
}

export interface BookSchemaType extends BookArgs, Id {
    dateAdded: number;
}


export type MemberArgs = {
    name: string;
    age: number;
    joinDate: number;
}

export interface MemberSchemaType extends MemberArgs, Id {
    approvedBy: ObjectId;
}

export type BorrowArgs = {
    bookId: ObjectId;
    title: string;
    borrower: ObjectId;
    promisedReturnDate: number;
}

export interface BorrowSchemaType extends BorrowArgs, Id {
    approvedBy: ObjectId;
    date: number;
}



export type InventoryArgs = {
    title: string;
    total: number;
    available: number;
    borrowed: number;
}

export interface InventorySchemaType extends InventoryArgs, Id {}

export type EmployeeArgs = {
    name: string;
    age: number;
    email: string;
    password: string;
}

export interface EmployeeSchemaType extends EmployeeArgs, Id {
    joinDate: number;
}


export type ReturnArgs =  {
    title: string;
    borrower: ObjectId;
    borrowDate: number;    
}

export interface ReturnSchemaType extends ReturnArgs, Id {
    returnDate: number;
    approvedBy: ObjectId
}

export type PenaltyArgs = {
    bookId: ObjectId;
    borrower: ObjectId;
    penalty: number;    
}

export interface PenaltySchemaType extends PenaltyArgs, Id {
    approvedBy: ObjectId;
}