import { Injectable } from '@nestjs/common';
import { MemberArgs, MemberSchemaType, Query } from 'src/types/models';
import MembersShema from 'src/db/schemas/members.shema';
import { ObjectId } from 'mongoose';
import { queryLengthChecker } from 'src/utils';


@Injectable()
export class MembersService {
    async getAllMembers(query: Query<MemberSchemaType>): Promise<MemberSchemaType[]> {
        const {_id, name} = query

        queryLengthChecker(query)

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
}
