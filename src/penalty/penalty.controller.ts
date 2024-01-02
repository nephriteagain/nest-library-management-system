import { Controller, Get, HttpStatus, Param, Res, Post, Body, Req, Query } from '@nestjs/common';
import { PenaltyService } from './penalty.service';
import { P, PenaltyArgs, PenaltySchemaType } from 'src/types/models';
import { ObjectId } from 'mongoose';
import { Request, Response } from 'express';
import { AuthService } from 'src/auth/auth.service';

@Controller('penalty')
export class PenaltyController {
    constructor(
        private penaltyService: PenaltyService,
        private authService: AuthService
    ) {}

    @Get('')
    async getEntries() : P<PenaltySchemaType[]> {
        return this.penaltyService.getEntries()
    }

    // i am using Query here because for some reason Param doesnt work!
    @Get('query')
    async getEntry(@Query('id') id: ObjectId ) : P<PenaltySchemaType|404> {
        const entry = await this.penaltyService.getEntry(id)
        if (!entry) {
            return HttpStatus.NOT_FOUND
        }
        return entry
    }
//
    @Post('')
    async addEntry(@Body() penaltyEntry: PenaltyArgs, @Req() req: Request, @Res() res: Response) : P<Response<PenaltySchemaType|401>>{
        const accessToken = this.authService.extractTokenFromHeader(req)
        if (!accessToken) {
            return res.sendStatus(HttpStatus.UNAUTHORIZED)
        }
        const {sub: approvedBy} = this.authService.getTokenData(accessToken)
        const newEntry = await this.penaltyService.addEntry(penaltyEntry, approvedBy)
        return res.send(newEntry)
    }
    
}
