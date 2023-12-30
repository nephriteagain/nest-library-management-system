import {
    Controller,
    Get,
    Post,
    Param,
    Res,
    HttpStatus,
    Body,
    Patch,
} from '@nestjs/common';
import { InventoryService } from './inventory.service';
import { Document, isValidObjectId, ObjectId } from 'mongoose';
import { Response } from 'express';
import { Inventory } from 'src/types/models';

@Controller('inventory')
export class InventoryController {
    constructor(private inventoryService: InventoryService) {}

    @Get('')
    async getInventory(): Promise<Document[]> {
        return await this.inventoryService.getInventory();
    }

    @Get(':id')
    async getInventoryItem(
        @Param('id') id: ObjectId,
        @Res() res: Response,
    ): Promise<Response<Document>> {
        if (!isValidObjectId(id)) {
            return res.sendStatus(HttpStatus.BAD_REQUEST);
        }
        const entry = await this.inventoryService.getInventoryItem(id);
        if (!entry) {
            return res.sendStatus(HttpStatus.NOT_FOUND);
        }
        return res.send(entry);
    }

    @Post('')
    async addInventory(@Body() body: Inventory): Promise<Document> {
        return await this.inventoryService.addInventory(body);
    }

    @Patch(':id')
    async updateInventoryItem(
        @Param('id') id: ObjectId,
        @Body() changes: Partial<Inventory>,
        @Res() res: Response,
    ): Promise<Response<Document>> {
        if (isValidObjectId(id)) {
            return res.sendStatus(HttpStatus.BAD_REQUEST);
        }
        const updatedEntry = await this.inventoryService.updateInventoryItem(
            id,
            changes,
        );
        return res.send(updatedEntry);
    }
}
