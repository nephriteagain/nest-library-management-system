import { Test, TestingModule } from '@nestjs/testing';
import { MembersController } from './members.controller';
import { AuthModule } from '../auth/auth.module';
import { UsersModule } from '../users/users.module';
import { MembersService } from './members.service';
import { AuthService } from '../auth/auth.service';
import { generateObjectId } from '../../test/test.helpers';
import { Request, Response } from 'express';
import { BadRequestException, NotFoundException, UnauthorizedException } from '@nestjs/common';

jest.mock('./members.service')

describe('MembersController', () => {
    let membersController: MembersController;
    let membersService: MembersService;
    let authService: AuthService;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            controllers: [MembersController],
            providers: [MembersService],
            imports: [AuthModule, UsersModule]
        }).compile();

        membersController = module.get<MembersController>(MembersController);
        membersService = module.get<MembersService>(MembersService)
        authService = module.get<AuthService>(AuthService)
    });

    afterEach(() => {
        jest.restoreAllMocks()
    })

    it('should be defined', () => {
        expect(membersController).toBeDefined();
    });

    describe('getMembers / GET', () => {
        it('returns some values', async () => {
            const res = [] as any;
            jest.spyOn(membersService, 'getAllMembers').mockReturnValue(res)
            const result = await membersController.getMembers('dog', undefined as any, undefined as any)
            expect(result).toBe(res)
            expect(Array.isArray(result)).toBeTruthy()
        })
    })

    describe('searchMembers /search GET', () => {
        it('returns the search array', async () => {
            const res = [] as any;
            jest.spyOn(membersService, 'search').mockReturnValue(res)
            const result = await membersController.searchMembers('me')
            expect(result).toBe(res)
            expect(Array.isArray(result)).toBeTruthy()
        })
    })

    describe('getMember /:id GET', () => {
        const reqMock = {} as unknown as Request;
        const resMock = {
            send: jest.fn((x) => x),
            sendStatus: jest.fn((x) => x),
        } as unknown as Response;
        it('returns a member', async () => {
            const res = {} as any
            jest.spyOn(membersService, 'getMember').mockReturnValueOnce(res)
            await membersController.getMember(generateObjectId(), resMock)
            expect(resMock.send).toHaveBeenCalledWith(res)
        })
        it('throws a not found', async () => {
            jest.spyOn(membersService, 'getMember').mockImplementationOnce(() => {
                throw new NotFoundException()
            })
            expect(async () => membersController.getMember(generateObjectId(), resMock))
                .rejects.toThrow(NotFoundException)
        })
    })

    describe('getData /find/:data GET', () => {
        
        it('returns a valid data', async () => {
            const res = {name: 'name'} as any;
            jest.spyOn(membersService, 'getMember').mockReturnValueOnce(res);
            const result = await membersController.getData('name', generateObjectId());
            expect(result).toBeDefined;
            expect(result.data).toEqual(res.name)
                
        })
        it('throws a bad request when missing id', async () => {
            expect(async () => await membersController.getData('name', '' as any))
                .rejects.toThrow(BadRequestException)
        })
        it('throws not found when doc DNE', async () => {
            jest.spyOn(membersService, 'getMember').mockImplementationOnce(() => {
                throw new NotFoundException()
            })
            expect(async () => await membersController.getData('name', generateObjectId()))
                .rejects.toThrow(NotFoundException)
        })
        it('throws bad request when querying invalid data', async () => {
            const res = {name: 'name'} as any;
            jest.spyOn(membersService, 'getMember').mockReturnValueOnce(res);
            expect(async () => await membersController.getData('invalid data' as any, generateObjectId()))
                .rejects.toThrow(BadRequestException)
        })
    })

    describe('removeMember /:id DELETE', () => {
        const reqMock = {} as unknown as Request;
        const resMock = {
            send: jest.fn((x) => x),
            sendStatus: jest.fn((x) => x),
        } as unknown as Response;
        it('returns a OK', async () => {
            jest.spyOn(membersService, 'removeMember').mockResolvedValue(true as any);
            await membersController.removeMember(generateObjectId(), resMock);
            expect(resMock.sendStatus).toHaveBeenCalledWith(200)
        })
    })

    describe('addMember / POST', () => {
        const reqMock = {} as unknown as Request;
        const resMock = {
            send: jest.fn((x) => x),
            sendStatus: jest.fn((x) => x),
        } as unknown as Response;
        it('throws unauthorzied when missing token', async () => {
            jest.spyOn(authService, 'extractTokenFromHeader').mockReturnValueOnce(null as any);
            expect(async () => await membersController.addMember({} as any, reqMock, resMock))
                .rejects.toThrow(UnauthorizedException)
        })
        it ('throws unauthorzied when ivalid jwt token', async () => {
            jest.spyOn(authService, 'extractTokenFromHeader').mockReturnValueOnce('somevalue' as any);
            jest.spyOn(authService, 'getTokenData').mockReturnValueOnce({} as any);
            expect(async () => await membersController.addMember({} as any , reqMock, resMock))
                .rejects.toThrow(UnauthorizedException)
        })
        it ('sends the member data to client', async () => {
            const res = {} as any;
            jest.spyOn(authService, 'extractTokenFromHeader').mockReturnValueOnce('somevalue' as any);
            jest.spyOn(authService, 'getTokenData').mockReturnValueOnce({sub: 'somevalue'} as any);
            jest.spyOn(membersService, 'addMember').mockReturnValueOnce(res)
            await membersController.addMember({} as any, reqMock, resMock)
            expect(resMock.send).toHaveBeenCalledWith(res)
        })
    })
});
