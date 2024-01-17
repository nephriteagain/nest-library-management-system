import { BookArgs, BookSchemaType, P } from '../../src/types/models';

class BookModelMock {
    create: (book: BookArgs) => P<BookSchemaType>;
}
