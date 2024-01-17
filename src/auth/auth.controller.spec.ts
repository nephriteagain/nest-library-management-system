import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { UsersModule } from '../users/users.module';
import { JwtModule } from '@nestjs/jwt';
import { AuthService } from './auth.service';
import { envConstants } from './constants';
import { UsersService } from '../users/users.service';
import { generateObjectId } from '../../test/test.helpers';
import {
    BadRequestException,
    NotFoundException,
    UnauthorizedException,
} from '@nestjs/common';
import { Request, Response } from 'express';
jest.mock('../auth/auth.service');
jest.mock('../users/users.service');

describe('AuthController', () => {
    let authController: AuthController;
    let authService: AuthService;
    let userService: UsersService;

    beforeEach(async () => {
        const moduleRef = await Test.createTestingModule({
            controllers: [AuthController],
            providers: [AuthService, UsersService],
            imports: [
                UsersModule,
                JwtModule.register({
                    global: true,
                    secret: `${envConstants.secret}`,
                    signOptions: { expiresIn: '7d' },
                }),
            ],
        }).compile();

        authController = moduleRef.get<AuthController>(AuthController);
        authService = moduleRef.get<AuthService>(AuthService);
        userService = moduleRef.get<UsersService>(UsersService);
    });

    it('should be defined', () => {
        expect(authController).toBeDefined();
    });

    describe('getData find/:data GET', () => {
        const result = { email: 'email@gmail.com' } as any;

        it('returns unauthrozied when trying to  get password', async () => {
            jest.spyOn(userService, 'getUser').mockImplementationOnce(
                (id) => result,
            );
            expect(async () => {
                await authController.getData('password', generateObjectId());
            }).rejects.toThrow(UnauthorizedException);
        });
        it('returns bad request when missing _id', async () => {
            jest.spyOn(userService, 'getUser').mockImplementationOnce(
                (id) => result,
            );
            expect(async () => {
                await authController.getData('password', undefined as any);
            }).rejects.toThrow(BadRequestException);
        });
        it('returns a not found', () => {
            jest.spyOn(userService, 'getUser').mockImplementationOnce(
                async (id) => {
                    throw new NotFoundException();
                },
            );
            expect(async () => {
                await authController.getData('email', generateObjectId());
            }).rejects.toThrow(NotFoundException);
        });
    });

    describe('register /register POST', () => {
        it('sucessfully create new employee', async () => {
            const res = {} as any;
            jest.spyOn(authService, 'newEmployee').mockImplementationOnce(
                async (u, s) => res,
            );
            const r = await authController.register({} as any);
            expect(r).toBeTruthy();
        });
        it('fails to create new employee', async () => {
            jest.spyOn(authService, 'newEmployee').mockImplementationOnce(
                async (u, s) => null as any,
            );
            expect(async () => {
                const r = await authController.register({} as any);
            }).rejects.toThrow(BadRequestException);
        });
    });

    describe('autoSignin /credentials POST', () => {
        const reqMock = {} as unknown as Request;
        const resMock = {
            send: jest.fn((x) => x),
            sendStatus: jest.fn((x) => x),
        } as unknown as Response;
        it('returns the userData', async () => {
            const result = {} as any;
            jest.spyOn(authService, 'autoSignin').mockImplementationOnce(
                async (req, res) => result,
            );
            const r = await authController.autoSignin(reqMock, resMock);
            expect(resMock.send).toHaveBeenCalledWith(result);
        });
        it('returns a 204', async () => {
            jest.spyOn(authService, 'autoSignin').mockImplementationOnce(
                async (req, res) => null,
            );
            const r = await authController.autoSignin(reqMock, resMock);
            expect(resMock.sendStatus).toHaveBeenCalledWith(204);
        });
    });

    describe('logout /logout POST', () => {
        const resMock = {
            sendStatus: jest.fn((x) => x),
        } as unknown as Response;
        it('sucessfully logouts', async () => {
            jest.spyOn(authService, 'signOut').mockImplementationOnce(
                (res) => undefined,
            );
            authController.logout(resMock);
            expect(resMock.sendStatus).toHaveBeenCalledWith(200);
        });
    });

    describe('signIn /login POST', () => {
        const reqMock = {} as unknown as Request;
        const resMock = {
            send: jest.fn((x) => x),
            sendStatus: jest.fn((x) => x),
        } as unknown as Response;
        it('sends the userdata', async () => {
            const res = {} as any;
            jest.spyOn(authService, 'signIn').mockImplementationOnce(
                async (...args) => res,
            );
            await authController.signIn({} as any, resMock, reqMock);
            expect(resMock.send).toHaveBeenCalledWith(res);
        });
    });
});
