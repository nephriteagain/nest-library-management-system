import {
    Controller,
    Get,
    Post,
    Param,
    Res,
    HttpStatus,
    Body,
    Patch,
    UsePipes,
    Query,
    UseGuards,
    NotFoundException,
    BadRequestException,
} from '@nestjs/common';
import { InventoryService } from './inventory.service';
import { isValidObjectId, ObjectId } from 'mongoose';
import { Response } from 'express';
import {
    InventoryArgs,
    InventorySchemaType,
    InventoryArgsSchema,
    zodOIDValidator,
    PartialInventoryArgsSchema,
    zodOIDValidatorOptional,
} from '../types/models';
import { ZodValidationPipe } from '../db/validation/schema.pipe';

// TODO: add another pipe that checks if (borrow + available === total)
@Controller('api/inventory')
export class InventoryController {
    constructor(private inventoryService: InventoryService) {}

    @Get('')
    async getInventory(
        @Query('_id', new ZodValidationPipe(zodOIDValidatorOptional))
        _id: ObjectId,
        @Query('title') title: string,
    ): Promise<InventorySchemaType[]> {
        return await this.inventoryService.getInventory({ _id, title });
    }

    @Get(':id')
    @UsePipes(new ZodValidationPipe(zodOIDValidator))
    async getInventoryItem(
        @Param('id') id: ObjectId,
        @Res() res: Response,
    ): Promise<Response<InventorySchemaType>> {
        if (!isValidObjectId(id)) {
            return res.sendStatus(HttpStatus.BAD_REQUEST);
        }
        const entry = await this.inventoryService.getInventoryItem(id);
        if (!entry) {
            return res.sendStatus(HttpStatus.NOT_FOUND);
        }
        return res.send(entry);
    }

    @Get('find/:data')
    async getData(
        @Param('data') data: keyof InventorySchemaType,
        @Query('_id', new ZodValidationPipe(zodOIDValidator)) _id: ObjectId,
    ): Promise<404 | { data: InventorySchemaType[keyof InventorySchemaType] }> {
        if (!_id) {
            throw new BadRequestException('missing id!');
        }
        const inventoryItem = await this.inventoryService.getInventoryItem(_id);
        if (!inventoryItem) {
            throw new NotFoundException();
        }
        if (inventoryItem[data] === undefined) {
            throw new BadRequestException();
        }
        return {
            data: inventoryItem[data],
        };
    }

    @Patch(':id')
    async updateInventoryItem(
        @Param('id', new ZodValidationPipe(zodOIDValidator)) id: ObjectId,
        @Body(new ZodValidationPipe(PartialInventoryArgsSchema))
        changes: Partial<InventoryArgs>,
        @Res() res: Response,
    ): Promise<Response<InventorySchemaType>> {
        const updatedEntry = await this.inventoryService.updateInventoryItem(
            id,
            changes,
        );
        return res.send(updatedEntry);
    }
}
