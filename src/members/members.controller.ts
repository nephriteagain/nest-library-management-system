import {
    Controller,
    Get,
    Res,
    HttpStatus,
    Delete,
    Post,
    Param,
    Body,
    Req,
    UsePipes,
    Query,
} from '@nestjs/common';
import { MembersService } from './members.service';
import { ObjectId } from 'mongoose';
import { Response, Request } from 'express';
import {
    MemberArgs,
    MemberSchemaType,
    membersArgsSchema,
    zodOIDValidator,
    zodOIDValidatorOptional,
    zodEmailValidatorOptional,
} from 'src/types/models';
import { AuthService } from 'src/auth/auth.service';
import { ZodValidationPipe } from 'src/db/validation/schema.pipe';

@Controller('api/members')
export class MembersController {
    constructor(
        private membersService: MembersService,
        private authService: AuthService,
    ) {}

    @Get('')
    async getMembers(
        @Query('name') name: string,
        @Query('email', new ZodValidationPipe(zodEmailValidatorOptional))
        email: string,
        @Query('_id', new ZodValidationPipe(zodOIDValidatorOptional))
        _id: ObjectId,
    ): Promise<MemberSchemaType[]> {
        const members = await this.membersService.getAllMembers({
            name,
            _id,
            email,
        });
        return members;
    }

    @Get('search')
    async searchMembers(
        @Query('q') q: string,
    ): Promise<{ _id: ObjectId; name: string; email: string }[]> {
        const memberQuery = await this.membersService.search(q);
        return memberQuery;
    }

    @Get(':id')
    @UsePipes(new ZodValidationPipe(zodOIDValidator))
    async getMember(
        @Param('id') id: ObjectId,
        @Res() res: Response,
    ): Promise<Response<MemberSchemaType | 404>> {
        const member = await this.membersService.getMember(id);
        if (member) {
            return res.send(member);
        }
        return res.sendStatus(HttpStatus.NOT_FOUND);
    }

    @Get('find/:data')
    async getData(
        @Param('data') data: keyof MemberSchemaType,
        @Query('_id', new ZodValidationPipe(zodOIDValidator)) _id: ObjectId,
    ): Promise<404 | { data: MemberSchemaType[keyof MemberSchemaType] }> {
        const borrow = await this.membersService.getMember(_id);
        if (!borrow) {
            return HttpStatus.NOT_FOUND;
        }
        return {
            data: borrow[data],
        };
    }

    @Delete(':id')
    @UsePipes(new ZodValidationPipe(zodOIDValidator))
    async removeMember(@Param('id') id: ObjectId): Promise<Boolean> {
        const removedStatus = await this.membersService.removeMember(id);
        return removedStatus;
    }

    @Post('')
    async addMember(
        @Body(new ZodValidationPipe(membersArgsSchema)) body: MemberArgs,
        @Req() req: Request,
        @Res() res: Response,
    ): Promise<Response<MemberSchemaType | 401>> {
        const accessToken = this.authService.extractTokenFromHeader(req);
        if (!accessToken) {
            return res.sendStatus(HttpStatus.UNAUTHORIZED);
        }
        const { sub: approvedBy } = this.authService.getTokenData(accessToken);
        if (!approvedBy) {
            return res.sendStatus(HttpStatus.UNAUTHORIZED);
        }
        const newMember = await this.membersService.addMember(body, approvedBy);
        return res.send(newMember);
    }
}
