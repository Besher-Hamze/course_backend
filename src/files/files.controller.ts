import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, UseInterceptors, UploadedFile } from '@nestjs/common';
import { FilesService } from './files.service';
import { CreateFileDto } from './dto/create-file.dto';
import { UpdateFileDto } from './dto/update-file.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';

@Controller('files')
export class FilesController {
    constructor(private readonly filesService: FilesService) { }

    @UseGuards(JwtAuthGuard)
    @Post()
    @UseInterceptors(
        FileInterceptor('file', {
            storage: diskStorage({
                destination: './uploads/files',
                filename: (req, file, cb) => {
                    const randomName = Array(32)
                        .fill(null)
                        .map(() => Math.round(Math.random() * 16).toString(16))
                        .join('');
                    cb(null, `${randomName}${extname(file.originalname)}`);

                    return
                },
            }),
        }),
    )
    create(@UploadedFile() file, @Body() createFileDto: CreateFileDto) {
        return this.filesService.create({
            ...createFileDto,
            filePath: file.path,
            fileType: extname(file.originalname).substring(1),
        });
    }

    @UseGuards(JwtAuthGuard)
    @Get()
    findAll() {
        return this.filesService.findAll();
    }

    @UseGuards(JwtAuthGuard)
    @Get('by-course/:courseId')
    findAllByCourse(@Param('courseId') courseId: string) {
        return this.filesService.findAllByCourse(courseId);
    }

    @UseGuards(JwtAuthGuard)
    @Get(':id')
    findOne(@Param('id') id: string) {
        return this.filesService.findOne(id);
    }

    @UseGuards(JwtAuthGuard)
    @Patch(':id')
    update(@Param('id') id: string, @Body() updateFileDto: UpdateFileDto) {
        return this.filesService.update(id, updateFileDto);
    }

    @UseGuards(JwtAuthGuard)
    @Delete(':id')
    remove(@Param('id') id: string) {
        return this.filesService.remove(id);
    }
}

