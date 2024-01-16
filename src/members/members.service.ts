import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import {
    MemberArgs,
    MemberSchemaType,
    Query,
    membersArgsSchema,
} from '../types/models';
import MembersShema from '../db/schemas/members.shema';
import { ObjectId, isValidObjectId } from 'mongoose';
import { queryLengthChecker } from '../utils';
import { z } from 'zod';
import { membersMapper } from '../utils';

@Injectable()
export class MembersService {
    async getAllMembers(
        query: Query<MemberSchemaType>,
    ): Promise<MemberSchemaType[]> {
        const { _id, name, email } = query;

        queryLengthChecker(query);

        if (_id) {
            return await MembersShema.find({ _id }).limit(1).exec();
        }

        if (email) {
            return await MembersShema.find({ email }).limit(1).exec();
        }

        if (name) {
            const regex = new RegExp(`${name}`, 'gi');
            return await MembersShema.find({
                name: {
                    $regex: regex,
                },
            })
                .limit(20)
                .exec();
        }

        const members = await MembersShema.find({});
        return members;
    }

    async getMember(id: ObjectId): Promise<MemberSchemaType | null> {
        const member = await MembersShema.findById(id);
        return member;
    }

    async removeMember(id: ObjectId): Promise<void> {
        try {
            const d = await MembersShema.findByIdAndDelete(id);            
            if (!d) {
                throw new NotFoundException()
            }
        } catch (error) {
            throw new NotFoundException()
        }
    }

    async addMember(
        member: MemberArgs,
        approvedBy: ObjectId,
    ): Promise<MemberSchemaType> {
        const existingUser = await MembersShema.findOne({email:member.email})
        if (existingUser) {
            throw new BadRequestException('user already exist!')
        }        
        const newMember = await MembersShema.create({ ...member, approvedBy });
        return newMember;
    }

    async search(
        text: string,
    ): Promise<{ _id: ObjectId; name: string; email: string }[]> {
        // not text, give default send
        if (!text) {
            const members = await MembersShema.find({}).limit(20).exec();
            return membersMapper(members);
        }
        // text is an ObjectId
        if (isValidObjectId(text)) {
            const members = await MembersShema.find({ _id: text })
                .limit(1)
                .exec();
            return membersMapper(members);
        }
        const emailSchema = z.string().email();
        try {
            // text is a email
            emailSchema.parse(text);
            const members = await MembersShema.find({ email: text })
                .limit(1)
                .exec();
            return membersMapper(members);
        } catch (error) {
            // text is a name
            const regex = new RegExp(`${text}`, 'gi');
            const members = await MembersShema.find({
                name: {
                    $regex: regex,
                },
            });
            return membersMapper(members);
        }
    }
}
