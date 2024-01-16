import * as dotenv from 'dotenv';
dotenv.config();

const routes = [
    '/register',
    '/books',
    '/books/new',
    '/inventory',
    '/inventory/new',
    '/members',
    '/members/new',
    '/borrow',
    '/borrow/new',
    '/return',
    '/penalty',
    '/login',
    '/members/:id/delete',
    '/members/:id',
    '/borrow/return/:id',
    '/books/:id',
    '/inventory/update/:id',
    '/books/new/:id',
];

const regexRoutes = routes.map((route) => {
    return {
        regex: new RegExp(
            '^' + route.replace(/:[a-zA-Z0-9]+/g, '[a-zA-Z0-9]+') + '$',
        ),
        route,
    };
});

export const envConstants = {
    secret: `${process.env.SECRET_KEY}`,
    env: `${process.env.ENV}`,
    penalty: 5,
    mongo_local: `${process.env.MONGO_LOCAL}`,
    mongo_prod: `${process.env.MONGO_PROD}`,
    regexRoutes,
    user: {
        email: process.env.EMAIL,
        password: process.env.PASSWORD,
    },
} as const;
