import {
    Controller,
    Get,
    HttpStatus,
    Param,
    Res,
    Post,
    Body,
    Req,
    Query,
    UsePipes,
    NotFoundException,
    BadRequestException,
    UnauthorizedException,
} from '@nestjs/common';
import { PenaltyService } from './penalty.service';
import {
    P,
    PenaltyArgs,
    PenaltySchemaType,
    PenaltyArgsSchema,
    zodOIDValidator,
    zodOIDValidatorOptional,
} from '../types/models';
import { ObjectId } from 'mongoose';
import { Request, Response } from 'express';
import { AuthService } from '../auth/auth.service';
import { ZodValidationPipe } from '../db/validation/schema.pipe';

@Controller('api/penalty')
export class PenaltyController {
    constructor(
        private penaltyService: PenaltyService,
        private authService: AuthService,
    ) {}

    @Get('')
    async getEntries(
        @Query('_id', new ZodValidationPipe(zodOIDValidatorOptional))
        _id: ObjectId,
        @Query('bookId', new ZodValidationPipe(zodOIDValidatorOptional))
        bookId: ObjectId,
        @Query('approvedBy', new ZodValidationPipe(zodOIDValidatorOptional))
        approvedBy: ObjectId,
        @Query('borrower', new ZodValidationPipe(zodOIDValidatorOptional))
        borrower: ObjectId,
    ): P<PenaltySchemaType[]> {
        return this.penaltyService.getEntries({
            _id,
            bookId,
            approvedBy,
            borrower,
        });
    }

    @Get('find/:data')
    async getData(
        @Param('data') data: keyof PenaltySchemaType,
        @Query('_id', new ZodValidationPipe(zodOIDValidator)) _id: ObjectId,
    ): Promise<404 | { data: PenaltySchemaType[keyof PenaltySchemaType] }> {
        if (!_id) {
            throw new BadRequestException('missing id!');
        }
        const penalty = await this.penaltyService.getEntry(_id);
        if (!penalty) {
            throw new NotFoundException();
        }
        if (penalty[data] === undefined) {
            throw new BadRequestException();
        }
        return {
            data: penalty[data],
        };
    }

    // i am using Query here because for some reason Param doesnt work!
    @Get('query')
    async getEntry(
        @Query('id', new ZodValidationPipe(zodOIDValidator)) id: ObjectId,
    ): P<PenaltySchemaType> {
        const entry = await this.penaltyService.getEntry(id);
        if (!entry) {
            throw new NotFoundException();
        }
        return entry;
    }

    @Get('value')
    getPenalty(): { penalty: number } {
        const penalty = this.penaltyService.getPenalty();
        return { penalty };
    }

    @Post('')
    @UsePipes(new ZodValidationPipe(PenaltyArgsSchema))
    async addEntry(
        @Body() penaltyEntry: PenaltyArgs,
        @Req() req: Request,
        @Res() res: Response,
    ): P<Response<PenaltySchemaType | 401>> {
        const accessToken = this.authService.extractTokenFromHeader(req);
        if (!accessToken) {
            throw new UnauthorizedException();
        }
        const { sub: approvedBy } = this.authService.getTokenData(accessToken);
        const newEntry = await this.penaltyService.addEntry(
            penaltyEntry,
            approvedBy,
        );
        return res.send(newEntry);
    }
}
