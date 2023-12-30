import { ObjectId } from 'mongoose';
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
