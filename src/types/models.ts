import { ObjectId, Document } from 'mongoose';

export type BaseDocument<T> = T & Document;

export interface Book {
    title: string;
    authors: string[];
    yearPublished: number;
    totalPages: number;
}

export interface Member {
    name: string;
    age: number;
    joinDate: number;
    approvedBy: string;
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
