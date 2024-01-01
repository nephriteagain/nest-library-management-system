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


export interface Member {
    name: string;
    age: number;
    joinDate: number;
}

export interface Borrow {
    title: string;
    borrower: ObjectId;
    date: number;
    returnDate: number;
}

export interface Inventory {
    title: string;
    total: number;
    available: number;
    borrowed: number;
}

export interface Employee {
    name: string;
    age: number;
    email: string;
    password: string;
}

export type  ReturnArgs =  {
    title: string;
    borrower: ObjectId;
    borrowDate: number;    
}

export interface ReturnSchemaType extends ReturnArgs {
    returnDate: number;
    approvedBy: ObjectId
}