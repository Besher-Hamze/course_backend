import { Module } from '@nestjs/common';
import { SeedService } from './seed.service';
import { TeachersModule } from 'src/teachers/teachers.module';

@Module({
    imports: [TeachersModule],
    providers: [SeedService],
})
export class SeedModule { }


