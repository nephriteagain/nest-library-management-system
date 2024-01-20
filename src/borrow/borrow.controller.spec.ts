import { Test, TestingModule } from '@nestjs/testing';
import { BorrowController } from './borrow.controller';
import { BorrowService } from './borrow.service';
import { AuthService } from '../auth/auth.service';
import { generateObjectId } from '../../test/test.helpers';
import { AuthModule } from '../auth/auth.module';
import { UsersModule } from '../users/users.module';
import { Response, Request } from 'express';
import { BadRequestException, HttpStatus, NotFoundException } from '@nestjs/common';

jest.mock('../auth/auth.service')
jest.mock('./borrow.service')

describe('BorrowController', () => {
    let borrowController: BorrowController;
    let borrowService: BorrowService;
    let authService: AuthService;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            controllers: [BorrowController],
            providers: [
                BorrowService,
                AuthService
            ],
            imports: [UsersModule]
        }).compile();

        borrowController = module.get<BorrowController>(BorrowController);
        borrowService = module.get<BorrowService>(BorrowService)
        authService = module.get<AuthService>(AuthService)

    });

    it('should be defined', () => {
        expect(borrowController).toBeDefined();
    });

    describe('getBorrowList / GET', () => {
        it('returns list of borrows',async () => {
            const res = [] as any;
            jest.spyOn(borrowService, 'getBorrowList').mockImplementationOnce(async({}) => res)
            const r = await borrowController.getBorrowList('title', generateObjectId(), generateObjectId(), generateObjectId(), generateObjectId())
            expect(r).toBe(res)
        })
    })

    describe('getBorrowItem /:id GET', () => {
        const resMock = {
            send: jest.fn((x) => x),
            sendStatus: jest.fn((x) => x),
        } as unknown as Response;
        it('returns a borrow item', async () => {
            const res = {} as any;
            jest.spyOn(borrowService, 'getBorrowData').mockImplementationOnce((id => res))
            await borrowController.getBorrowItem(generateObjectId(), resMock)
            expect(resMock.send).toHaveBeenCalledWith(res)
        })
        it('throws a not found', async () => {
            jest.spyOn(borrowService, 'getBorrowData').mockImplementationOnce(i => (null as any))
            expect(async () => await borrowController.getBorrowItem(generateObjectId(), resMock))
                .rejects.toThrow(NotFoundException)
        })
    })

    describe('getData /find/:data GET', () => {
        it('returns the data', async () => {
            jest.spyOn(borrowService, 'getBorrowData').mockImplementationOnce((id) => ({title:'title'} as any))
            expect(await borrowController.getData('title', generateObjectId())).toBeDefined()
        })
        it('throws not found', async () => {
            jest.spyOn(borrowService, 'getBorrowData').mockImplementationOnce(id => (null as any))
            expect(async () => await borrowController.getData('title', generateObjectId()))
                .rejects.toThrow(NotFoundException)
        })
        it('throws bad request when finding invalid data', async () => {
            jest.spyOn(borrowService, 'getBorrowData').mockImplementationOnce(id => ({title: 'title'} as any))
            expect(async () => await borrowController.getData('invalidProps' as any, generateObjectId()))
                .rejects.toThrow(BadRequestException)
        })
    })

    describe('addNewEntry / POST', () => {
        const reqMock = {} as unknown as Request;
        const resMock = {
            send: jest.fn((x) => x),
            sendStatus: jest.fn((x) => x),
        } as unknown as Response;
        it('sends 201 and the data', async () => {
            const res = {};
            jest.spyOn(authService, 'extractTokenFromHeader').mockImplementationOnce(reqMock => 'blablabla')
            jest.spyOn(borrowService, 'add').mockImplementationOnce(() => (res as any))
            jest.spyOn(authService, 'getTokenData').mockImplementationOnce(b => ({sub: 'blablabla'} as any))
            await borrowController.addNewEntry({} as any, reqMock, resMock)
            expect(resMock.send).toHaveBeenCalledWith(res)
        })
        
        it('sends a 401 unauthrozied', async () => {
            jest.spyOn(authService, 'extractTokenFromHeader').mockImplementationOnce(reqMock => undefined)
            await borrowController.addNewEntry({} as any, reqMock, resMock)
            expect(resMock.sendStatus).toHaveBeenCalledWith(HttpStatus.UNAUTHORIZED)
        })

        it('throw a bad request exception', async () => {            
            jest.spyOn(authService, 'extractTokenFromHeader').mockImplementationOnce(reqMock => 'blablabla')
            jest.spyOn(authService, 'getTokenData').mockImplementationOnce(b => ({sub: 'blablabla'} as any))
            jest.spyOn(borrowService, 'add').mockImplementationOnce(() => (null as any))            
            expect(async () => await borrowController.addNewEntry({} as any, reqMock, resMock))
                .rejects.toThrow(BadRequestException)
        })
    })
});
