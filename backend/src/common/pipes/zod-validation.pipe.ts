import { PipeTransform, BadRequestException, Injectable } from '@nestjs/common';
import { ZodSchema, ZodError } from 'zod';

/**
 * Zod Validation Pipe
 * @SecOps - Tüm input'lar bu pipe üzerinden geçmeli!
 * 
 * Kullanım:
 * @UsePipes(new ZodValidationPipe(MySchema))
 */
@Injectable()
export class ZodValidationPipe implements PipeTransform {
    constructor(private schema: ZodSchema) { }

    transform(value: unknown) {
        try {
            return this.schema.parse(value);
        } catch (error) {
            if (error instanceof ZodError) {
                const messages = error.errors.map((e) => ({
                    field: e.path.join('.'),
                    message: e.message,
                }));
                throw new BadRequestException({
                    statusCode: 400,
                    message: 'Validation failed',
                    errors: messages,
                });
            }
            throw new BadRequestException('Validation failed');
        }
    }
}
