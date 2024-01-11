import { Injectable } from '@nestjs/common';
import {
    MemberArgs,
    MemberSchemaType,
    Query,
    membersArgsSchema,
} from 'src/types/models';
import MembersShema from 'src/db/schemas/members.shema';
import { ObjectId, isValidObjectId } from 'mongoose';
import { queryLengthChecker } from 'src/utils';
import { z } from 'zod';

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

    async removeMember(id: ObjectId): Promise<Boolean> {
        const removedStatus = await MembersShema.findByIdAndDelete(id);
        return Boolean(removedStatus);
    }

    async addMember(
        member: MemberArgs,
        approvedBy: ObjectId,
    ): Promise<MemberSchemaType> {
        const newMember = await MembersShema.create({ ...member, approvedBy });
        return newMember;
    }

    async search(
        text: string,
    ): Promise<{ _id: ObjectId; name: string; email: string }[]> {
        // text is an ObjectId
        if (isValidObjectId(text)) {
            const members = await MembersShema.find({ _id: text })
                .limit(1)
                .exec();
            const memberArr = members.map((m) => {
                return {
                    _id: m._id,
                    name: m.name,
                    email: m.email,
                };
            });
            return memberArr;
        }
        const emailSchema = z.string().email();
        try {
            // text is a email
            emailSchema.parse(text);
            const members = await MembersShema.find({ email: text })
                .limit(1)
                .exec();
            return members;
        } catch (error) {
            // text is a name
            const regex = new RegExp(`${text}`, 'gi');
            const members = await MembersShema.find({
                name: {
                    $regex: regex,
                },
            });
            return members;
        }
    }
}
