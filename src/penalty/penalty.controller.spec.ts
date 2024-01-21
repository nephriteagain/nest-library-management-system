import { Test, TestingModule } from '@nestjs/testing';
import { PenaltyController } from './penalty.controller';
import { AuthModule } from '../auth/auth.module';
import { PenaltyService } from './penalty.service';
import { AuthService } from '../auth/auth.service';
import { generateObjectId } from '../../test/test.helpers';
import { BadRequestException, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { Request, Response } from 'express';

describe('PenaltyController', () => {
    let controller: PenaltyController;
    let penaltyService: PenaltyService;
    let authService: AuthService;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            controllers: [PenaltyController],
            providers: [PenaltyService],
            imports: [AuthModule]
        }).compile();

        controller = module.get<PenaltyController>(PenaltyController);
        penaltyService = module.get(PenaltyService)
        authService = module.get(AuthService)
    });

    afterEach(() => {
        jest.clearAllMocks()
    })

    

    it('should be defined', () => {
        expect(controller).toBeDefined();
    });

    describe('getEntries / GET', () => {
        it('returns a 200', async () => {
            const res = [] as any;
            jest.spyOn(penaltyService, 'getEntries').mockReturnValueOnce(res);
            expect(await controller.getEntries(undefined as any, undefined as any, undefined as any, undefined as any))
                .toBe(res)
        })
    })

    describe('getData /find/:data GET', () => {
        

        it('returns a data', async () => {
            const res = {_id: generateObjectId()} as any;
            jest.spyOn(penaltyService, 'getEntry').mockReturnValueOnce(res);
            const result = await controller.getData('_id', generateObjectId())
            expect(result.data).toEqual(res._id)
        })
        it('throws bad request because missing id', async () => {
            expect(async () => controller.getData('_id', undefined as any))
                .rejects.toThrow(BadRequestException)
        })
        it('throws not found because doc DNE', async () => {
            jest.spyOn(penaltyService, 'getEntry').mockReturnValueOnce(null as any);
            expect(async () => controller.getData('_id', generateObjectId()))
                .rejects.toThrow(NotFoundException)
        })
        it('throws not bad reqyest because requesting invalid property', async () => {
            const res = {_id: generateObjectId()} as any;
            jest.spyOn(penaltyService, 'getEntry').mockReturnValueOnce(res);
            expect(async () => controller.getData('invalid_props' as any, generateObjectId()))
                .rejects.toThrow(BadRequestException)
        })
    })

    describe('getEntry /query GET', () => {
        it('returns a value', async () => {
            const res = {} as any;
            jest.spyOn(penaltyService, 'getEntry').mockReturnValueOnce(res);
            expect(await controller.getEntry(generateObjectId()))
                .toBe(res)
        })
        it('throws not found', async () => {
            jest.spyOn(penaltyService, 'getEntry').mockResolvedValueOnce(null);
            expect(async () => controller.getEntry(generateObjectId()))
                .rejects.toThrow(NotFoundException)
        })
    })

    describe('getPenalty /value GET', () => {
        it('returns a penalty value', async () => {
            jest.spyOn(penaltyService, 'getPenalty').mockReturnValueOnce(5)
            const response =  controller.getPenalty()
            expect(response.penalty).toEqual(5)
        })
    })

    describe('addEntry / POST', () => {
        const reqMock = {} as unknown as Request;
        const resMock = {
            send: jest.fn((x) => x),
            sendStatus: jest.fn((x) => x),
        } as unknown as Response;

        it('throws unauthorized due to missing jwt token', async () => {
            jest.spyOn(authService, 'extractTokenFromHeader').mockReturnValueOnce(undefined)
            expect(async () => controller.addEntry({} as any, reqMock, resMock))
                .rejects.toThrow(UnauthorizedException)
        })
        it('throws unauthorized due to invalid token', async () => {
            jest.spyOn(authService, 'extractTokenFromHeader').mockReturnValueOnce('sometokendata')
            jest.spyOn(authService, 'getTokenData').mockReturnValueOnce({} as any)
            expect(async () => controller.addEntry({} as any, reqMock, resMock))
                .rejects.toThrow(UnauthorizedException)
        })
        it('returns a value', async () => {
            jest.spyOn(authService, 'extractTokenFromHeader').mockReturnValueOnce('sometokendata')
            jest.spyOn(authService, 'getTokenData').mockReturnValueOnce({sub: 'somevalue'} as any)
            const res = {} as any
            jest.spyOn(penaltyService, 'addEntry').mockReturnValueOnce(res)
            await controller.addEntry({} as any, reqMock, resMock)
            expect(resMock.send).toHaveBeenCalledWith(res)
        })
    })

    
});
