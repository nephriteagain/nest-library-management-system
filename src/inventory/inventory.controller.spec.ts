import { Test, TestingModule } from '@nestjs/testing';
import { InventoryController } from './inventory.controller';
import { InventoryService } from './inventory.service';
import { generateObjectId } from '../../test/test.helpers';
import { BadRequestException, HttpStatus, NotFoundException } from '@nestjs/common';
import { Request, Response } from 'express';

jest.mock('./inventory.service')

describe('InventoryController', () => {
    let inventoryController: InventoryController;
    let inventoryService: InventoryService

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            controllers: [InventoryController],
            providers: [InventoryService]
        }).compile();

        inventoryController = module.get<InventoryController>(InventoryController);
        inventoryService = module.get<InventoryService>(InventoryService)
    });

    it('should be defined', () => {
        expect(inventoryController).toBeDefined();
    });

    describe('getInventory / GET', () => {
        it('returns a 200', async () => {
            const res = [] as any;
            jest.spyOn(inventoryService, 'getInventory').mockImplementationOnce(() => res)
            expect(await inventoryController.getInventory(undefined as any, 'dog')).toBe(res)
        })
    })

    describe('getInventoryItem /:id GET', () => {
        const reqMock = {} as unknown as Request;
        const resMock = {
            send: jest.fn((x) => x),
            sendStatus: jest.fn((x) => x),
        } as unknown as Response;
        it ('returns an item', async () => {
            const res = {} as any;
            jest.spyOn(inventoryService, 'getInventoryItem').mockImplementationOnce(x => res)
            await inventoryController.getInventoryItem(generateObjectId(), resMock)
            expect(resMock.send).toHaveBeenCalledWith(res)
        })
        it('returns bad request due to invalid id', async () => {
            await inventoryController.getInventoryItem('dogerland' as any, resMock)
            expect(resMock.sendStatus).toHaveBeenCalledWith(HttpStatus.BAD_REQUEST)
        })
        it('returns not found when doc DNE', async () => {
            jest.spyOn(inventoryService, 'getInventoryItem').mockImplementationOnce(x => (null as any))
            await inventoryController.getInventoryItem(generateObjectId(), resMock)
            expect(resMock.sendStatus).toHaveBeenCalledWith(HttpStatus.NOT_FOUND)
        })
    })

    describe('getData /find/:data GET', () => {
        it('throws bad request due to missing id', async () => {
            expect(async () => await inventoryController.getData('title', undefined as any))
                .rejects.toThrow(BadRequestException)
        })
        it ('throws not found due to doc DNE', async () => {
            jest.spyOn(inventoryService, 'getInventoryItem').mockImplementationOnce(x => (null as any))
            expect(async () => await inventoryController.getData('title', generateObjectId()))
                .rejects.toThrow(NotFoundException)
        })
        it('throws bad request due to requesting invalid data', async () => {
            const res =  {title: 'title'} as any
            jest.spyOn(inventoryService, 'getInventoryItem').mockImplementationOnce(x => (res))
            expect(async () => await inventoryController.getData('invalid' as any, generateObjectId()))
                .rejects.toThrow(BadRequestException)
        })
        it('returns the data', async () => {
            const res =  {title: 'title'} as any
            jest.spyOn(inventoryService, 'getInventoryItem').mockImplementationOnce(x => (res))  
            expect(await inventoryController.getData('title', generateObjectId())).toBeDefined()
        })
    })
    
    describe('updateInventoryItem /:id PATCH', () => {
        const reqMock = {} as unknown as Request;
        const resMock = {
            send: jest.fn((x) => x),
            sendStatus: jest.fn((x) => x),
        } as unknown as Response;
        it('returns the updated entry', async () => {
            const res = {} as any;
            jest.spyOn(inventoryService, 'updateInventoryItem').mockImplementationOnce(() => res);
            await inventoryController.updateInventoryItem(generateObjectId(), {} as any, resMock)
            expect(resMock.send).toHaveBeenCalledWith(res)
        })
    })

});
