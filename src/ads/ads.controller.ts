import { Body, Controller, Delete, Get, Param, Patch, Post, UploadedFile, UseGuards, UseInterceptors } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { AdsService } from './ads.service';
import { CreateAdDto } from './dto/create-ad.dto';
import { UpdateAdDto } from './dto/update-ad.dto';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { RolesGuard } from 'src/common/guards/roles.guard';
import { Roles } from 'src/common/decorator/roles.decorator';
import { Role } from 'src/common/enums/role.enum';
import { imageUploadOptions } from 'src/common/utils/image-upload';

@Controller('ads')
export class AdsController {
  constructor(private readonly adsService: AdsService) { }

  @UseGuards(JwtAuthGuard)
  @Get()
  findAll() {
    return this.adsService.findAll();
  }

  @UseGuards(JwtAuthGuard)
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.adsService.findOne(id);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.Owner, Role.Teacher)
  @Post()
  @UseInterceptors(FileInterceptor('image', imageUploadOptions))
  create(@Body() dto: CreateAdDto, @UploadedFile() image: Express.Multer.File) {
    return this.adsService.create(dto, image);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.Owner, Role.Teacher)
  @Patch(':id')
  @UseInterceptors(FileInterceptor('image', imageUploadOptions))
  update(@Param('id') id: string, @Body() dto: UpdateAdDto, @UploadedFile() image?: Express.Multer.File) {
    return this.adsService.update(id, dto, image);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.Owner, Role.Teacher)
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.adsService.remove(id);
  }
}
