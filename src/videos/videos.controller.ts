import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Query, UseInterceptors, UploadedFile, Res, Header, HttpStatus } from '@nestjs/common';
import { Response } from 'express';
import * as fs from 'fs';
import * as path from 'path';
import { stat } from 'fs/promises';
import { VideosService } from './videos.service';
import { CreateVideoDto } from './dto/create-video.dto';
import { UpdateVideoDto } from './dto/update-video.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';

@Controller('videos')
export class VideosController {
  constructor(private readonly videosService: VideosService) {}

  @UseGuards(JwtAuthGuard)
  @Post()
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: './uploads/videos',
        filename: (req, file, cb) => {
          const randomName = Array(32)
            .fill(null)
            .map(() => Math.round(Math.random() * 16).toString(16))
            .join('');
          return cb(null, `${randomName}${extname(file.originalname)}`);
        },
      }),
    }),
  )
  create(@UploadedFile() file, @Body() createVideoDto: CreateVideoDto) {
    return this.videosService.create({
      ...createVideoDto,
      filePath: file.path,
    });
  }

  @UseGuards(JwtAuthGuard)
  @Get()
  findAll() {
    return this.videosService.findAll();
  }

  @UseGuards(JwtAuthGuard)
  @Get('by-course/:courseId')
  findAllByCourse(@Param('courseId') courseId: string) {
    return this.videosService.findAllByCourse(courseId);
  }

  @UseGuards(JwtAuthGuard)
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.videosService.findOne(id);
  }

  @UseGuards(JwtAuthGuard)
  @Patch(':id')
  update(@Param('id') id: string, @Body() updateVideoDto: UpdateVideoDto) {
    return this.videosService.update(id, updateVideoDto);
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.videosService.remove(id);
  }

  @UseGuards(JwtAuthGuard)
  @Get('stream/:id')
  async streamVideo(@Param('id') id: string, @Res() res: Response, @Query('download') download?: string) {
    try {

      console.log('Video streaming WORK');

      const video = await this.videosService.findOne(id);
      const videoPath = path.resolve(video.filePath);
      
      // Check if video file exists
      const fileStats = await stat(videoPath);
      
      // Get file size
      const fileSize = fileStats.size;
      
      // Set headers for streaming
      const range = res.req.headers.range as string;
      
      // Check if Range header is present
      if (range) {
        // Parse Range header
        const parts = range.replace(/bytes=/, '').split('-');
        const start = parseInt(parts[0], 10);
        const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;
        
        // Calculate chunk size
        const chunkSize = (end - start) + 1;
        const fileStream = fs.createReadStream(videoPath, { start, end });
        
        // Set response headers for partial content
        res.writeHead(206, {
          'Content-Range': `bytes ${start}-${end}/${fileSize}`,
          'Accept-Ranges': 'bytes',
          'Content-Length': chunkSize,
          'Content-Type': 'video/mp4',
          'Content-Disposition': download ? `attachment; filename="${video.title}.mp4"` : 'inline',
        });
        
        // Stream the video chunk
        fileStream.pipe(res);
      } else {
        // If no range header, send the entire file
        // This is usually for small files or direct downloads
        res.writeHead(200, {
          'Content-Length': fileSize,
          'Content-Type': 'video/mp4',
          'Content-Disposition': download ? `attachment; filename="${video.title}.mp4"` : 'inline',
        });
        
        const readStream = fs.createReadStream(videoPath);
        readStream.pipe(res);
      }
    } catch (error) {
      console.error('Video streaming error:', error);
      res.status(HttpStatus.NOT_FOUND).json({
        message: 'Video not found or streaming error occurred',
      });
    }
  }

  
}

