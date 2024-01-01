import {
    Controller,
    Get,
    Res,
    Param,
    HttpStatus,
    Post,
    Body,
    Req
} from '@nestjs/common';
import { BorrowService } from './borrow.service';
import { ObjectId } from 'mongoose';
import { BorrowArgs, BorrowSchemaType } from 'src/types/models';
import { Response, Request } from 'express';
import { AuthService } from 'src/auth/auth.service';

@Controller('borrow')
export class BorrowController {
    constructor(
        private borrowService: BorrowService,
        private authService: AuthService,
        ) {}

    @Get('')
    async getBorrowList(): Promise<BorrowSchemaType[]> {
        return this.borrowService.getBorrowList();
    }

    @Get(':id')
    async getBorrowItem(
        @Param('id') id: ObjectId,
        @Res() res: Response,
    ): Promise<Response<BorrowSchemaType|404>> {
        const borrowItem = await this.borrowService.getBorrowData(id);
        if (borrowItem) {
            return res.send(borrowItem);
        }
        return res.sendStatus(HttpStatus.NOT_FOUND);
    }

    @Post('')
    // TODO: add a pipe validation to check if all property is all there and removed excess properties
    async addNewEntry(@Body() body: BorrowArgs, @Req() req: Request, @Res() res: Response) : Promise<Response<404|201>> {
        const accessToken = this.authService.extractTokenFromHeader(req)        
        if (!accessToken) {
            return res.sendStatus(HttpStatus.UNAUTHORIZED)
        }
        const { sub: aprrovedBy } = this.authService.getTokenData(accessToken)
        // console.log({approvedBy})
        await this.borrowService.add(body, aprrovedBy)
        return res.sendStatus(HttpStatus.CREATED)
    }
}
