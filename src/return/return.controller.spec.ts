import { Test, TestingModule } from '@nestjs/testing';
import { ReturnController } from './return.controller';
import { ReturnService } from './return.service';
import { AuthService } from '../auth/auth.service';
import { UsersModule } from '../users/users.module';
import { generateObjectId } from '../../test/test.helpers';
import { BadRequestException, HttpStatus, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { Request, Response } from 'express';

jest.mock('./return.service')
jest.mock('../auth/auth.service')

describe('ReturnController', () => {
    let controller: ReturnController;
    let returnService: ReturnService;
    let authService: AuthService;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            controllers: [ReturnController],
            providers: [ReturnService, AuthService],
            imports: [UsersModule]
        }).compile();

        controller = module.get<ReturnController>(ReturnController);
        returnService = module.get(ReturnService)
        authService = module.get(AuthService)
    });

    afterEach(() => {
        jest.clearAllMocks()
    })

    it('should be defined', () => {
        expect(controller).toBeDefined();
    });

    describe('getReturnList / GET', () => {
        it ('returns a list', async () => {
            const list = [] as any;
            jest.spyOn(returnService, 'getReturnList').mockReturnValueOnce(list);
            expect(await controller.getReturnList())
                .toBe(list)
        })
    })

    describe('getReturnItem /query GET', () => {
        it('returns a item', async () => {
            const res = {} as any;
            jest.spyOn(returnService, 'getReturnItem').mockReturnValueOnce(res)
            expect(await controller.getReturnItem(generateObjectId()))
                .toBe(res)
        })
        it ('throws a not found', async () => {
            jest.spyOn(returnService, 'getReturnItem').mockReturnValueOnce(null as any)
            expect(async () => controller.getReturnItem(generateObjectId()))
                .rejects.toThrow(NotFoundException)
        })
    })

    describe('getData /find/:data GET', () => {
        it('throws bad request because missing id', async () => {
            expect(async () => controller.getData('_id', undefined as any))
                .rejects.toThrow(BadRequestException)
        })
        it('returns the data', async () => {
            const res = {_id : generateObjectId()} as any
            jest.spyOn(returnService, 'getReturnItem').mockReturnValueOnce(res);
            const data = await controller.getData('_id', generateObjectId())
            expect(data.data).toEqual(res._id)                
        })
        it('throws a not found when doc DNE', async () => {
            jest.spyOn(returnService, 'getReturnItem').mockReturnValueOnce(null as any);
            expect(async () => controller.getData('_id', generateObjectId()))
                .rejects.toThrow(NotFoundException)
        })
        it('throws a bad request when querying invalid data', async () => {
            const res = {_id : generateObjectId()} as any
            jest.spyOn(returnService, 'getReturnItem').mockReturnValueOnce(res);
            expect(async () => controller.getData('invalid data' as any, generateObjectId()))
                .rejects.toThrow(BadRequestException)
        })
    })

    describe('addReturnEntry /:id POST', () => {
        const reqMock = {} as unknown as Request;
        const resMock = {
            send: jest.fn((x) => x),
            sendStatus: jest.fn((x) => x),
        } as unknown as Response;
        it ('returns a 201', async () => {
            jest.spyOn(authService, 'extractTokenFromHeader').mockReturnValueOnce('sometokendata')
            jest.spyOn(authService, 'getTokenData').mockReturnValueOnce({sub: 'somevalue'} as any)
            const res = {} as any;
            jest.spyOn(returnService, 'addEntry').mockReturnValueOnce(res)
            await controller.addReturnEntry({} as any, reqMock, resMock);
            expect(resMock.sendStatus).toHaveBeenCalledWith(HttpStatus.CREATED)
        })
        it('returns unauthorized due to missing jwt token', async () => {
            jest.spyOn(authService, 'extractTokenFromHeader').mockReturnValueOnce(undefined);
            expect(async () => await controller.addReturnEntry({} as any, reqMock, resMock))
                .rejects.toThrow(UnauthorizedException)            
        })
        it('returns unauthorized due to invalid/expired jwt token', async () => {
            jest.spyOn(authService, 'extractTokenFromHeader').mockReturnValueOnce('somedata');
            jest.spyOn(authService, 'getTokenData').mockReturnValueOnce({} as any)
            expect(async () => await controller.addReturnEntry({} as any, reqMock, resMock))
                .rejects.toThrow(UnauthorizedException)  
        })
       it ('returns a bad request when something went wrong', async () => {
            jest.spyOn(authService, 'extractTokenFromHeader').mockReturnValueOnce('somedata');
            jest.spyOn(authService, 'getTokenData').mockReturnValueOnce({sub:'somedata'} as any);
            jest.spyOn(returnService, 'addEntry').mockReturnValueOnce(false as any);
            expect(async () => await controller.addReturnEntry({} as any, reqMock, resMock))
                .rejects.toThrow(BadRequestException)  
       })
    })

   
});
