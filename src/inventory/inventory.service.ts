import { Injectable } from '@nestjs/common';
import { Document, ObjectId } from 'mongoose';
import InventorySchema from 'src/db/schemas/inventory.schema';
import { InventoryArgs } from 'src/types/models';

@Injectable()
export class InventoryService {
    async getInventory(): Promise<Document[]> {
        return await InventorySchema.find({}).limit(20);
    }

    async getInventoryItem(id: ObjectId): Promise<Document | null> {
        return await InventorySchema.findById(id);
    }

    async addInventory(entry: InventoryArgs): Promise<Document> {
        const newEntry = await InventorySchema.create(entry);
        return newEntry;
    }

    async updateInventoryItem(
        id: ObjectId,
        changes: Partial<InventoryArgs>,
    ): Promise<Document | null> {
        const updatedEntry = await InventorySchema.findByIdAndUpdate(
            id,
            changes,
            { new: true },
        );
        return updatedEntry;
    }
}
