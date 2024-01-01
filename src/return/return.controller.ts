import { Controller, Get, Post, Res, Req, Body, HttpStatus, Param } from '@nestjs/common';
import { ReturnService } from './return.service';
import { AuthService } from 'src/auth/auth.service';
import { ObjectId } from 'mongoose';
import { ReturnArgs, ReturnSchemaType } from 'src/types/models';
import { Request, Response } from 'express';


@Controller('return')
export class ReturnController {
    constructor(
        private returnService: ReturnService,
        private authService: AuthService
    ) {}

    @Get('')
    async getReturnList() : Promise<ReturnSchemaType[]> {
        const list  = await this.returnService.getReturnList()        
        return list;
    }

    @Get(':id')
    async getReturnItem(@Param() id : ObjectId) : Promise<ReturnSchemaType|404> {        
        const returnItem = await this.returnService.getReturnItem(id)
        if (!returnItem) {
            return HttpStatus.NOT_FOUND
        }
        return returnItem
    }

    @Post('')
    async addReturnEntry(@Body() body: ReturnArgs, @Req() req: Request, @Res() res: Response) : Promise<Response<401|201>> { 
        const accessToken = this.authService.extractTokenFromHeader(req)
        if (!accessToken) {
            return res.sendStatus(HttpStatus.UNAUTHORIZED)
        }
        const {sub: approvedBy } = this.authService.getTokenData(accessToken)
        await  this.returnService.addEntry(body, approvedBy)
        return res.sendStatus(HttpStatus.CREATED)
    }
}
