import { Injectable } from '@nestjs/common';
import { ObjectId } from 'mongoose';
import InventorySchema from 'src/db/schemas/inventory.schema';
import { InventoryArgs, InventorySchemaType } from 'src/types/models';

@Injectable()
export class InventoryService {
    async getInventory(): Promise<InventorySchemaType[]> {
        return await InventorySchema.find({}).limit(20);
    }

    async getInventoryItem(id: ObjectId): Promise<InventorySchemaType | null> {
        return await InventorySchema.findById(id);
    }

    // NOTE: this endpoint is currently not being used
    async addInventory(entry: InventoryArgs): Promise<InventorySchemaType> {
        const newEntry = await InventorySchema.create({
            ...entry,
            available: entry.total,
        });
        return newEntry;
    }

    async updateInventoryItem(
        id: ObjectId,
        changes: Partial<InventoryArgs>,
    ): Promise<InventorySchemaType | null> {
        const updatedEntry = await InventorySchema.findByIdAndUpdate(
            id,
            changes,
            { new: true },
        );
        return updatedEntry;
    }
}
