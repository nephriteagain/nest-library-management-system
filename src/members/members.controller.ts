import {
    Controller,
    Get,
    Res,
    HttpStatus,
    Delete,
    Post,
    Param,
    Body,
    Req
} from '@nestjs/common';
import { MembersService } from './members.service';
import { ObjectId, Document } from 'mongoose';
import { Response, Request } from 'express';
import { MemberArgs } from 'src/types/models';
import { AuthService } from 'src/auth/auth.service';

@Controller('members')
export class MembersController {
    constructor(
        private membersService: MembersService,
        private authService: AuthService,
    ) {}

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
    async addMember(@Body() body: MemberArgs, @Req() req: Request, @Res() res: Response): Promise<Response<Document>> {        
        const accessToken = this.authService.extractTokenFromHeader(req)
        if (!accessToken) {
            return res.sendStatus(HttpStatus.UNAUTHORIZED)
        }
        const {sub: approvedBy} = this.authService.getTokenData(accessToken)                
        const newMember = await this.membersService.addMember(body, approvedBy);
        return res.send(newMember);
    }
}
