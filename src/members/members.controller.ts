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
    NotFoundException,
    BadRequestException,
    UnauthorizedException,
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
} from '../types/models';
import { AuthService } from '../auth/auth.service';
import { ZodValidationPipe } from '../db/validation/schema.pipe';

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
    ): Promise<Response<MemberSchemaType>> {
        const member = await this.membersService.getMember(id);
        if (!member) {
            throw new NotFoundException();
        }
        return res.send(member);
    }

    @Get('find/:data')
    async getData(
        @Param('data') data: keyof MemberSchemaType,
        @Query('_id', new ZodValidationPipe(zodOIDValidator)) _id: ObjectId,
    ): Promise<{ data: MemberSchemaType[keyof MemberSchemaType] }> {
        if (!_id) {
            throw new BadRequestException('missing id!');
        }
        const member = await this.membersService.getMember(_id);
        if (!member) {
            throw new NotFoundException();
        }
        if (member[data] === undefined) {
            throw new BadRequestException();
        }
        return {
            data: member[data],
        };
    }

    @Delete(':id')
    @UsePipes(new ZodValidationPipe(zodOIDValidator))
    async removeMember(
        @Param('id') id: ObjectId,
        @Res() res: Response,
    ): Promise<Response<200>> {
        await this.membersService.removeMember(id);
        return res.sendStatus(200);
    }

    @Post('')
    async addMember(
        @Body(new ZodValidationPipe(membersArgsSchema)) body: MemberArgs,
        @Req() req: Request,
        @Res() res: Response,
    ): Promise<Response<MemberSchemaType>> {
        const accessToken = this.authService.extractTokenFromHeader(req);
        if (!accessToken) {
            throw new UnauthorizedException('missing jwt token');
        }
        const { sub: approvedBy } = this.authService.getTokenData(accessToken);
        if (!approvedBy) {
            throw new UnauthorizedException('invalid jwt token');
        }
        const newMember = await this.membersService.addMember(body, approvedBy);
        return res.send(newMember);
    }
}
