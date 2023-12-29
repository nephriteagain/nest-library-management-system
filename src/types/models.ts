export interface Book {
    title: string;
    authors: string[];
    yearPublished: number;
    totalPages: number;
}

export interface Member {
    name: string;
    age: number;
    joinDate: Date;
    approvedBy: string;
}