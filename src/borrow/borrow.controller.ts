import { Controller, Get, Res, Param, HttpStatus, Post, Body } from '@nestjs/common';
import { BorrowService } from './borrow.service';
import { Document, ObjectId } from 'mongoose';
import { Borrow } from 'src/types/models';
import { Response } from 'express';

@Controller('borrow')
export class BorrowController {
    constructor(private borrowService: BorrowService) {}

    @Get('')
    async getBorrowList() : Promise<Document[]> {
        return this.borrowService.getBorrowList();
    }

    @Get(':id')
    async getBorrowItem(@Param('id') id : ObjectId , @Res() res: Response) : Promise<Response<Document>> {
        const borrowItem = await this.borrowService.getBorrowData(id)
        if (borrowItem) {
            return res.send(borrowItem)
        }
        return res.sendStatus(HttpStatus.NOT_FOUND)
    }

    @Post('')
    // todo create a jwt session token for employeeid
    async addNewEntry(@Body() body: Borrow,) {       
        // return this.borrowService.add(body, ObjectId('adsd') as ObjectId)
    }
}
