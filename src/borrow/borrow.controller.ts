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
} from '@nestjs/common';
import { BorrowService } from './borrow.service';
import { ObjectId } from 'mongoose';
import { BorrowArgs, BorrowSchemaType } from 'src/types/models';
import { Response, Request } from 'express';
import { AuthService } from 'src/auth/auth.service';
import { ZodValidationPipe } from 'src/db/validation/schema.pipe';
import { BorrowArgsSchema, zodOIDValidator } from 'src/types/models';



@Controller('borrow')
export class BorrowController {
    constructor(
        private borrowService: BorrowService,
        private authService: AuthService,
    ) {}


    @Get('')
    async getBorrowList(
        @Query('title') title : string,
        @Query('bookId') bookId : ObjectId,
        @Query('id') id : ObjectId,
        @Query('borrower') borrower : ObjectId
    ): Promise<BorrowSchemaType[]> {
        return this.borrowService.getBorrowList({title, bookId, id, borrower});
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
        // console.log({approvedBy})
        await this.borrowService.add(body, aprrovedBy);
        return res.sendStatus(HttpStatus.CREATED);
    }
}
