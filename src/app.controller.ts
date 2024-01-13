import { Controller, Get, Res } from '@nestjs/common';
import { Response } from 'express';
import { join } from 'path';

@Controller()
export class AppController {
    constructor() {}

    @Get('')
    getHTML(@Res() res: Response): void {
        const filePath = join(__dirname, '..', 'clientBuild', 'index.html');

        res.setHeader('Content-Type', 'text/html');

        return res.sendFile(filePath);
    }
}
