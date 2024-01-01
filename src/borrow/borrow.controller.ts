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
import { Document, ObjectId } from 'mongoose';
import { Borrow } from 'src/types/models';
import { Response, Request } from 'express';
import { AuthGuard } from 'src/auth/auth.guard';
import { JwtService } from '@nestjs/jwt';
// import {  } from '@nestjs/jwt'

@Controller('borrow')
export class BorrowController {
    constructor(
        private borrowService: BorrowService,
        private authGuard: AuthGuard,
        private jwtService: JwtService
        ) {}

    @Get('')
    async getBorrowList(): Promise<Document[]> {
        return this.borrowService.getBorrowList();
    }

    @Get(':id')
    async getBorrowItem(
        @Param('id') id: ObjectId,
        @Res() res: Response,
    ): Promise<Response<Document>> {
        const borrowItem = await this.borrowService.getBorrowData(id);
        if (borrowItem) {
            return res.send(borrowItem);
        }
        return res.sendStatus(HttpStatus.NOT_FOUND);
    }

    @Post('')
    // TODO: add a pipe validation to check if all property is all there and removed excess properties
    async addNewEntry(@Body() body: Borrow, @Req() req: Request, @Res() res: Response) {
        const accessToken = this.authGuard.extractTokenFromHeader(req)        
        if (!accessToken) {
            return res.sendStatus(HttpStatus.UNAUTHORIZED)
        }
        const { sub: aprrovedBy } = this.jwtService.decode(accessToken)
        // console.log({approvedBy})
        await this.borrowService.add(body, aprrovedBy)
        return res.sendStatus(HttpStatus.CREATED)
    }
}
