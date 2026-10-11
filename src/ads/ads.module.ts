import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Ad, AdSchema } from './schemas/ad.schema';
import { AdsService } from './ads.service';
import { AdsController } from './ads.controller';
import { StorageModule } from 'src/storage/storage.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Ad.name, schema: AdSchema }]),
    StorageModule,
  ],
  controllers: [AdsController],
  providers: [AdsService],
})
export class AdsModule { }
