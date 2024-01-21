import {
    Controller,
    Get,
    Post,
    Res,
    Req,
    Body,
    HttpStatus,
    Query,
    UsePipes,
    Param,
    NotFoundException,
    BadRequestException,
    UnauthorizedException,
} from '@nestjs/common';
import { ReturnService } from './return.service';
import { AuthService } from '../auth/auth.service';
import { ObjectId } from 'mongoose';
import {
    ReturnArgs,
    ReturnSchemaType,
    ReturnArgsSchema,
    zodOIDValidator,
    zodOIDValidatorOptional,
} from '../types/models';
import { Request, Response } from 'express';
import { ZodValidationPipe } from '../db/validation/schema.pipe';

@Controller('api/return')
export class ReturnController {
    constructor(
        private returnService: ReturnService,
        private authService: AuthService,
    ) {}

    @Get('')
    async getReturnList(
        @Query('_id', new ZodValidationPipe(zodOIDValidatorOptional))
        _id?: ObjectId,
        @Query('bookId', new ZodValidationPipe(zodOIDValidatorOptional))
        bookId?: ObjectId,
        @Query('borrower', new ZodValidationPipe(zodOIDValidatorOptional))
        borrower?: ObjectId,
        @Query('approvedBy', new ZodValidationPipe(zodOIDValidatorOptional))
        approvedBy?: ObjectId,
    ): Promise<ReturnSchemaType[]> {
        const list = await this.returnService.getReturnList({
            _id,
            bookId,
            borrower,
            approvedBy,
        });
        return list;
    }

    @Get('query')
    async getReturnItem(
        @Query('id', new ZodValidationPipe(zodOIDValidator)) id: ObjectId,
    ): Promise<ReturnSchemaType> {
        const returnItem = await this.returnService.getReturnItem(id);
        if (!returnItem) {
            throw new NotFoundException();
        }
        return returnItem;
    }

    @Get('find/:data')
    async getData(
        @Param('data') data: keyof ReturnSchemaType,
        @Query('_id', new ZodValidationPipe(zodOIDValidator)) _id: ObjectId,
    ): Promise<{ data: ReturnSchemaType[keyof ReturnSchemaType] }> {
        if (!_id) {
            throw new BadRequestException('missing id!');
        }
        const returnItem = await this.returnService.getReturnItem(_id);
        if (!returnItem) {
            throw new NotFoundException();
        }
        if (returnItem[data] === undefined) {
            throw new BadRequestException();
        }
        return {
            data: returnItem[data],
        };
    }

    @Post(':id')
    async addReturnEntry(
        @Param('id', new ZodValidationPipe(zodOIDValidator)) _id: ObjectId,
        @Req() req: Request,
        @Res() res: Response,
    ): Promise<Response<201>> {
        const accessToken = this.authService.extractTokenFromHeader(req);
        if (!accessToken) {
            throw new UnauthorizedException()
        }
        const { sub: approvedBy } = this.authService.getTokenData(accessToken);
        if (!approvedBy) {
            throw new UnauthorizedException()
        }
        const status = await this.returnService.addEntry(_id, approvedBy);
        if (!status) {            
            throw new BadRequestException()
        }
        return res.sendStatus(HttpStatus.CREATED);
    }
}
