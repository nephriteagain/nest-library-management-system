import { ObjectId, Document } from 'mongoose';

export type BaseDocument<T> = T & Document;

export type BookArgs = {
    title: string;
    authors: string[];
    yearPublished: number;    
}

export interface BookSchemaType extends BookArgs {
    dateAdded: number;
}


export type MemberArgs = {
    name: string;
    age: number;
    joinDate: number;
}

export interface MemberSchemaType extends MemberArgs {
    approvedBy: ObjectId;
}

export type BorrowArgs = {
    bookId: ObjectId;
    title: string;
    borrower: ObjectId;
    promisedReturnDate: number;
}

export interface BorrowSchemaType extends BorrowArgs {
    approvedBy: ObjectId;
    date: number;
}



export type InventoryArgs = {
    title: string;
    total: number;
    available: number;
    borrowed: number;
}

export interface InventorySchemaType extends InventoryArgs {}

export type EmployeeArgs = {
    name: string;
    age: number;
    email: string;
    password: string;
}

export interface EmployeeSchemaType extends EmployeeArgs {
    joinDate: number;
}


export type ReturnArgs =  {
    title: string;
    borrower: ObjectId;
    borrowDate: number;    
}

export interface ReturnSchemaType extends ReturnArgs {
    returnDate: number;
    approvedBy: ObjectId
}

export type PenaltyArgs = {
    bookId: ObjectId;
    borrower: ObjectId;
    penalty: number;    
}

export interface PenaltySchemaType extends PenaltyArgs {
    approvedBy: ObjectId;
}