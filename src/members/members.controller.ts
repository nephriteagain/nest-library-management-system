import {
    Controller,
    Get,
    Res,
    HttpStatus,
    Delete,
    Post,
    Param,
    Body,
} from '@nestjs/common';
import { MembersService } from './members.service';
import { ObjectId, Document } from 'mongoose';
import { Response } from 'express';
import { Member } from 'src/types/models';

@Controller('members')
export class MembersController {
    constructor(private membersService: MembersService) {}

    @Get('')
    async getMembers(): Promise<Document[]> {
        const members = await this.membersService.getAllMembers();
        return members;
    }

    @Get(':id')
    async getMember(
        @Param('id') id: ObjectId,
        @Res() res: Response,
    ): Promise<Response<Document>> {
        const member = await this.membersService.getMember(id);
        if (member) {
            return res.send(member);
        }
        return res.sendStatus(HttpStatus.NOT_FOUND);
    }

    @Delete(':id')
    async removeMember(@Param('id') id: ObjectId): Promise<Boolean> {
        const removedStatus = await this.membersService.removeMember(id);
        return removedStatus;
    }

    @Post('')
    async addMember(@Body() body: Member): Promise<Document> {
        const newMember = await this.membersService.addMember(body);
        return newMember;
    }
}
