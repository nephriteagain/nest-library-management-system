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
} from '@nestjs/common';
import { ReturnService } from './return.service';
import { AuthService } from 'src/auth/auth.service';
import { ObjectId } from 'mongoose';
import {
    ReturnArgs,
    ReturnSchemaType,
    ReturnArgsSchema,
    zodOIDValidator,
    zodOIDValidatorOptional,
} from 'src/types/models';
import { Request, Response } from 'express';
import { ZodValidationPipe } from 'src/db/validation/schema.pipe';

@Controller('return')
export class ReturnController {
    constructor(
        private returnService: ReturnService,
        private authService: AuthService,
    ) {}

    @Get('')
    async getReturnList(
        @Query('_id', new ZodValidationPipe(zodOIDValidatorOptional)) _id: ObjectId,
        @Query('bookId', new ZodValidationPipe(zodOIDValidatorOptional)) bookId: ObjectId,
        @Query('borrower', new ZodValidationPipe(zodOIDValidatorOptional)) borrower : ObjectId,
        @Query('approvedBy', new ZodValidationPipe(zodOIDValidatorOptional)) approvedBy: ObjectId
    ): Promise<ReturnSchemaType[]> {
        const list = await this.returnService.getReturnList({_id, bookId, borrower, approvedBy});
        return list;
    }

    @Get('query')
    @UsePipes(new ZodValidationPipe(zodOIDValidator))
    async getReturnItem(
        @Query('id') id: ObjectId,
    ): Promise<ReturnSchemaType | 404> {
        const returnItem = await this.returnService.getReturnItem(id);
        if (!returnItem) {
            return HttpStatus.NOT_FOUND;
        }
        return returnItem;
    }

    @Post('')
    @UsePipes(new ZodValidationPipe(ReturnArgsSchema))
    async addReturnEntry(
        @Body() body: ReturnArgs,
        @Req() req: Request,
        @Res() res: Response,
    ): Promise<Response<401 | 201>> {
        const accessToken = this.authService.extractTokenFromHeader(req);
        if (!accessToken) {
            return res.sendStatus(HttpStatus.UNAUTHORIZED);
        }
        const { sub: approvedBy } = this.authService.getTokenData(accessToken);
        await this.returnService.addEntry(body, approvedBy);
        return res.sendStatus(HttpStatus.CREATED);
    }
}
