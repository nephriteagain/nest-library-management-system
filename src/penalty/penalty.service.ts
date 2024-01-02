import { Injectable } from '@nestjs/common';
import PenaltySchema from 'src/db/schemas/penalty.schema';
import { P, PenaltyArgs, PenaltySchemaType } from 'src/types/models';
import { ObjectId } from 'mongoose';

@Injectable()
export class PenaltyService {
    
    async addEntry(penaltyEntry : PenaltyArgs, approvedBy: ObjectId) : P<PenaltySchemaType> {
        const newEntry =  await PenaltySchema.create({...penaltyEntry, approvedBy})
        return newEntry
    }

    async getEntry(id: ObjectId) : P<PenaltySchemaType|null> {
        const doc = await PenaltySchema.findById(id)
        return doc

    }
    
    async getEntries() : P<PenaltySchemaType[]> {
        const docs = await PenaltySchema.find({}).limit(20)
        return docs
    }
}
