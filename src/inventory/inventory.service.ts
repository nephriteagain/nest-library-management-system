import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { ObjectId } from 'mongoose';
import InventorySchema from '../db/schemas/inventory.schema';
import { InventoryArgs, InventorySchemaType, Query } from '../types/models';
import { queryLengthChecker } from '../utils';

@Injectable()
export class InventoryService {
    async getInventory(
        query: Query<InventorySchemaType>,
    ): Promise<InventorySchemaType[]> {
        const { _id, title } = query;

        queryLengthChecker(query);

        if (_id) {
            return await InventorySchema.find({ _id }).limit(1).exec();
        }

        if (title) {
            const regex = new RegExp(`${title}`, 'gi');
            return await InventorySchema.find({
                title: {
                    $regex: regex,
                },
            })
                .limit(20)
                .exec();
        }

        return await InventorySchema.find({}).limit(20).exec();
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
