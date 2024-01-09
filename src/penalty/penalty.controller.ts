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
} from '@nestjs/common';
import { PenaltyService } from './penalty.service';
import {
    P,
    PenaltyArgs,
    PenaltySchemaType,
    PenaltyArgsSchema,
    zodOIDValidator,
    zodOIDValidatorOptional,
} from 'src/types/models';
import { ObjectId } from 'mongoose';
import { Request, Response } from 'express';
import { AuthService } from 'src/auth/auth.service';
import { ZodValidationPipe } from 'src/db/validation/schema.pipe';

@Controller('penalty')
export class PenaltyController {
    constructor(
        private penaltyService: PenaltyService,
        private authService: AuthService,
    ) {}

    @Get('')
    async getEntries(
        @Query('_id', new ZodValidationPipe(zodOIDValidatorOptional)) _id: ObjectId,
        @Query('bookId', new ZodValidationPipe(zodOIDValidatorOptional)) bookId: ObjectId,
        @Query('approvedBy', new ZodValidationPipe(zodOIDValidatorOptional)) approvedBy: ObjectId,
        @Query('borrower', new ZodValidationPipe(zodOIDValidatorOptional)) borrower : ObjectId
    ): P<PenaltySchemaType[]> {
        return this.penaltyService.getEntries({_id, bookId, approvedBy, borrower});
    }

    // i am using Query here because for some reason Param doesnt work!
    @Get('query')
    @UsePipes(new ZodValidationPipe(zodOIDValidator))
    async getEntry(@Query('id') id: ObjectId): P<PenaltySchemaType | 404> {
        const entry = await this.penaltyService.getEntry(id);
        if (!entry) {
            return HttpStatus.NOT_FOUND;
        }
        return entry;
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
            return res.sendStatus(HttpStatus.UNAUTHORIZED);
        }
        const { sub: approvedBy } = this.authService.getTokenData(accessToken);
        const newEntry = await this.penaltyService.addEntry(
            penaltyEntry,
            approvedBy,
        );
        return res.send(newEntry);
    }
}
