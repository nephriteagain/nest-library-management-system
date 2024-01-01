import { Injectable } from '@nestjs/common';
import { Member } from 'src/types/models';
import MembersShema from 'src/db/schemas/members.shema';
import { Document, ObjectId } from 'mongoose';

@Injectable()
export class MembersService {
    async getAllMembers(): Promise<Document[]> {
        const members = await MembersShema.find({});
        return members;
    }

    async getMember(id: ObjectId): Promise<Document | null> {
        const member = await MembersShema.findById(id);
        return member;
    }

    async removeMember(id: ObjectId): Promise<Boolean> {
        const removedStatus = await MembersShema.findByIdAndDelete(id);
        return Boolean(removedStatus);
    }

    async addMember(member: Member, approvedBy: ObjectId): Promise<Document> {
        const newMember = await MembersShema.create({...member, approvedBy});
        return newMember;
    }
}
