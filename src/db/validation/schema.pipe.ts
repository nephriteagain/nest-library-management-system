import { PipeTransform, BadRequestException } from '@nestjs/common';
import { ZodSchema } from 'zod';

export class ZodValidationPipe implements PipeTransform {
    constructor(private schema: ZodSchema) {}

    transform(value: unknown) {
        try {
            const parsedValue = this.schema.parse(value);
            console.log(parsedValue, 'validation passed');
            return parsedValue;
        } catch (error) {
            console.error(value, 'validation failed');
            throw new BadRequestException('Validation failed');
        }
    }
}
