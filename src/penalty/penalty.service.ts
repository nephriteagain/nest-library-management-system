import {
    Injectable,
    HttpException,
    HttpStatus,
    BadRequestException,
} from '@nestjs/common';
import PenaltySchema from '../db/schemas/penalty.schema';
import { P, PenaltyArgs, PenaltySchemaType, Query } from '../types/models';
import { ObjectId, isValidObjectId } from 'mongoose';
import { queryLengthChecker } from '../utils';
import { envConstants } from '../auth/constants';

@Injectable()
export class PenaltyService {
    async addEntry(
        penaltyEntry: PenaltyArgs,
        approvedBy: ObjectId,
    ): P<PenaltySchemaType> {
        const newEntry = await PenaltySchema.create({
            ...penaltyEntry,
            approvedBy,
        });
        return newEntry;
    }

    async getEntry(id: ObjectId): P<PenaltySchemaType | null> {
        if (!isValidObjectId(id)) {
            throw new BadRequestException('invalid id');
        }
        const doc = await PenaltySchema.findById(id);
        return doc;
    }

    async getEntries(query: Query<PenaltySchemaType>): P<PenaltySchemaType[]> {
        const { bookId, borrower, _id, approvedBy } = query;
        queryLengthChecker(query);

        if (_id) {
            return await PenaltySchema.find({ _id }).limit(1).exec();
        }

        if (bookId) {
            return await PenaltySchema.find({ bookId }).limit(20).exec();
        }

        if (borrower) {
            return await PenaltySchema.find({ borrower }).limit(20).exec();
        }

        if (approvedBy) {
            return await PenaltySchema.find({ approvedBy }).limit(1).exec();
        }

        const docs = await PenaltySchema.find({}).limit(20);
        return docs;
    }

    getPenalty() {
        const penalty = envConstants.penalty;
        return penalty;
    }
}
