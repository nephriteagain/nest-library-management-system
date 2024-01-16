import { queryLengthChecker, booksMapper, membersMapper } from "./utils";
import { BookSchemaType, MemberSchemaType } from "./types/models";
import { generateObjectId } from "test/test.helpers";
import { faker } from '@faker-js/faker'


describe('queryLengthChecker', () => {

    const queryWithOneItem = {
        title: 'Jade God'
    }
    const queryWithUndefined = {
        name: 'Kidney',
        age: undefined,        
    }
    const queryWithMultipleDefinedProps = {
        title: 'A random book',
        yearPublished: 2023
    }

    it('should run successfully', () => {
        expect(queryLengthChecker(queryWithOneItem)).toBeUndefined();
        expect(queryLengthChecker(queryWithUndefined)).toBeUndefined(); 
    });

    it('should throw', () => {
        expect(() => queryLengthChecker(queryWithMultipleDefinedProps)).toThrow();
    });

})




describe('bookMapper', () => {
    const books  : BookSchemaType[] = []
    for (let i = 0; i < 10; i++) {


        const fakeBook = {
            title: faker.person.bio(),
            authors: [faker.person.fullName()],
            yearPublished: faker.number.int({min:100}),
            dateAdded: faker.date.past().getTime(),
            _id: generateObjectId()
        }
        books.push(fakeBook)
    }
    it('returns the same shape', () => {
        const mapped = booksMapper(books)

        const expectedShape = {
            _id: expect.any(String), 
            title: expect.any(String),
        };

        expect(mapped).toEqual(expect.arrayContaining([expectedShape]))
    })

})

describe('membersMapper', () => {
    const members: MemberSchemaType[] = [];

    for (let i = 0; i < 10; i++) {

        const fakeMember = {
            name: faker.person.firstName(),
            age: faker.number.int({min:14, max:100}),
            email: faker.internet.email(),
            _id: generateObjectId(),
            joinDate: faker.date.recent().getTime(),
            approvedBy: generateObjectId()
        };

        members.push(fakeMember);
    }

    it('returns the same shape', () => {
        const mapped = membersMapper(members);

        const expectedShape = {
            _id: expect.any(String),
            name: expect.any(String),
            email: expect.any(String),
        };

        expect(mapped).toEqual(expect.arrayContaining([expectedShape]));
    });
});