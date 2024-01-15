import {
    Controller,
    Get,
    Res,
    Param,
    HttpStatus,
    Post,
    Body,
    Req,
    UsePipes,
    Query,
    UseGuards,
    NotFoundException,
    BadRequestException,
} from '@nestjs/common';
import { BorrowService } from './borrow.service';
import { ObjectId } from 'mongoose';
import {
    BorrowArgs,
    BorrowSchemaType,
    zodOIDValidatorOptional,
} from '../types/models';
import { Response, Request } from 'express';
import { AuthService } from '../auth/auth.service';
import { ZodValidationPipe } from '../db/validation/schema.pipe';
import { BorrowArgsSchema, zodOIDValidator } from '../types/models';

@Controller('api/borrow')
export class BorrowController {
    constructor(
        private borrowService: BorrowService,
        private authService: AuthService,
    ) {}

    @Get('')
    async getBorrowList(
        @Query('title') title: string,
        @Query('bookId', new ZodValidationPipe(zodOIDValidatorOptional))
        bookId: ObjectId,
        @Query('_id', new ZodValidationPipe(zodOIDValidatorOptional))
        _id: ObjectId,
        @Query('borrower', new ZodValidationPipe(zodOIDValidatorOptional))
        borrower: ObjectId,
        @Query('approvedBy', new ZodValidationPipe(zodOIDValidatorOptional))
        approvedBy: ObjectId,
    ): Promise<BorrowSchemaType[]> {
        return this.borrowService.getBorrowList({
            title,
            bookId,
            _id,
            borrower,
            approvedBy,
        });
    }

    @Get(':id')
    @UsePipes(new ZodValidationPipe(zodOIDValidator))
    async getBorrowItem(
        @Param('id') id: ObjectId,
        @Res() res: Response,
    ): Promise<Response<BorrowSchemaType | 404>> {
        const borrowItem = await this.borrowService.getBorrowData(id);
        if (borrowItem) {
            return res.send(borrowItem);
        }
        return res.sendStatus(HttpStatus.NOT_FOUND);
    }

    @Get('find/:data')
    async getData(
        @Param('data') data: keyof BorrowSchemaType,
        @Query('_id', new ZodValidationPipe(zodOIDValidator)) _id: ObjectId,
    ): Promise<404 | { data: BorrowSchemaType[keyof BorrowSchemaType] }> {
        if (!_id) {
            throw new BadRequestException('missing id!')
        }
        const borrow = await this.borrowService.getBorrowData(_id);
        if (!borrow) {
            throw new NotFoundException()
        }
        if (borrow[data] === undefined) {
            throw new BadRequestException()
        }
        return {
            data: borrow[data],
        };
    }

    @Post('')
    // TODO: add a pipe validation to check if all property is all there and removed excess properties
    async addNewEntry(
        @Body(new ZodValidationPipe(BorrowArgsSchema)) body: BorrowArgs,
        @Req() req: Request,
        @Res() res: Response,
    ): Promise<Response<404 | 201>> {
        const accessToken = this.authService.extractTokenFromHeader(req);
        if (!accessToken) {
            return res.sendStatus(HttpStatus.UNAUTHORIZED);
        }
        const { sub: aprrovedBy } = this.authService.getTokenData(accessToken);
        const borrowStatus = await this.borrowService.add(body, aprrovedBy);
        if (!borrowStatus) {
            return res.sendStatus(HttpStatus.INTERNAL_SERVER_ERROR);
        }
        return res.sendStatus(HttpStatus.CREATED);
    }
}
