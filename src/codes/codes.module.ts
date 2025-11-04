import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Code, CodeSchema } from './schemas/code.schema';
import { CodesService } from './codes.service';
import { CodesController } from './codes.controller';

@Module({
    imports: [
        MongooseModule.forFeature([
            { name: Code.name, schema: CodeSchema },
        ]),
    ],
    controllers: [CodesController],
    providers: [CodesService],
    exports: [CodesService],
})
export class CodesModule { }


