import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { extname } from 'path';
import * as crypto from 'crypto';
import { Ad, AdDocument } from './schemas/ad.schema';
import { CreateAdDto } from './dto/create-ad.dto';
import { UpdateAdDto } from './dto/update-ad.dto';
import { StorageService } from 'src/storage/storage.service';
import { toPlain } from 'src/common/utils/user.util';

const IMAGE_URL_TTL_SECONDS = 6 * 24 * 60 * 60;

@Injectable()
export class AdsService {
  constructor(
    @InjectModel(Ad.name) private adModel: Model<AdDocument>,
    private readonly storage: StorageService,
  ) { }

  private normalizeNumber(number: string) {
    return number.replace(/\D/g, '');
  }

  private async toResponse(ad: AdDocument) {
    const plain = toPlain(ad);
    const query = plain.whatsappMessage ? `?text=${encodeURIComponent(plain.whatsappMessage)}` : '';
    return {
      ...plain,
      imageUrl: await this.storage.getSignedUrl(plain.image, IMAGE_URL_TTL_SECONDS),
      whatsappUrl: `https://wa.me/${plain.whatsappNumber}${query}`,
    };
  }

  private async uploadImage(file: Express.Multer.File) {
    const key = `ads/${crypto.randomBytes(16).toString('hex')}${extname(file.originalname).toLowerCase()}`;
    await this.storage.upload(key, file.buffer, file.mimetype);
    return key;
  }

  private async findDocument(id: string) {
    const ad = await this.adModel.findById(id).exec();
    if (!ad) {
      throw new NotFoundException(`الإعلان برقم المعرف ${id} غير موجود`);
    }
    return ad;
  }

  async create(dto: CreateAdDto, image?: Express.Multer.File) {
    if (!image) {
      throw new BadRequestException('صورة الإعلان مطلوبة');
    }
    const ad = await this.adModel.create({
      ...dto,
      whatsappNumber: this.normalizeNumber(dto.whatsappNumber),
      image: await this.uploadImage(image),
    });
    return this.toResponse(ad);
  }

  async findAll() {
    const ads = await this.adModel.find().sort({ createdAt: -1 }).exec();
    return Promise.all(ads.map((ad) => this.toResponse(ad)));
  }

  async findOne(id: string) {
    return this.toResponse(await this.findDocument(id));
  }

  async update(id: string, dto: UpdateAdDto, image?: Express.Multer.File) {
    const ad = await this.findDocument(id);
    if (dto.title !== undefined) ad.title = dto.title;
    if (dto.whatsappNumber !== undefined) ad.whatsappNumber = this.normalizeNumber(dto.whatsappNumber);
    if (dto.whatsappMessage !== undefined) ad.whatsappMessage = dto.whatsappMessage;

    if (image) {
      const previousKey = ad.image;
      ad.image = await this.uploadImage(image);
      await this.storage.delete(previousKey);
    }

    await ad.save();
    return this.toResponse(ad);
  }

  async remove(id: string) {
    const ad = await this.findDocument(id);
    await ad.deleteOne();
    await this.storage.delete(ad.image);
    return { success: true };
  }
}
