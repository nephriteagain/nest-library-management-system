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
} from 'src/types/models';
import { ZodValidationPipe } from 'src/db/validation/schema.pipe';

// TODO: add another pipe that checks if (borrow + available === total)
@Controller('inventory')
export class InventoryController {
    constructor(private inventoryService: InventoryService) {}

    @Get('')
    async getInventory(): Promise<InventorySchemaType[]> {
        return await this.inventoryService.getInventory();
    }

    @Get(':id')
    @UsePipes(new ZodValidationPipe(zodOIDValidator))
    async getInventoryItem(
        @Param('id') id: ObjectId,
        @Res() res: Response,
    ): Promise<Response<InventorySchemaType | 400 | 404>> {
        if (!isValidObjectId(id)) {
            return res.sendStatus(HttpStatus.BAD_REQUEST);
        }
        const entry = await this.inventoryService.getInventoryItem(id);
        if (!entry) {
            return res.sendStatus(HttpStatus.NOT_FOUND);
        }
        return res.send(entry);
    }

    @Patch(':id')
    async updateInventoryItem(
        @Param('id', new ZodValidationPipe(zodOIDValidator)) id: ObjectId,
        @Body(new ZodValidationPipe(PartialInventoryArgsSchema))
        changes: Partial<InventoryArgs>,
        @Res() res: Response,
    ): Promise<Response<InventorySchemaType | 400>> {
        if (!isValidObjectId(id)) {
            return res.sendStatus(HttpStatus.BAD_REQUEST);
        }
        const updatedEntry = await this.inventoryService.updateInventoryItem(
            id,
            changes,
        );
        return res.send(updatedEntry);
    }
}
