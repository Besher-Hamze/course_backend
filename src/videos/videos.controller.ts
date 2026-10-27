import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Query, UseInterceptors, UploadedFile, Res, HttpStatus, Logger, BadRequestException, ForbiddenException } from '@nestjs/common';
import { Response } from 'express';
import { VideosService } from './videos.service';
import { StorageService } from 'src/storage/storage.service';
import { CreateVideoDto } from './dto/create-video.dto';
import { UpdateVideoDto } from './dto/update-video.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { FileInterceptor } from '@nestjs/platform-express';
import { extname } from 'path';
import * as crypto from 'crypto';
import { EnrollmentsService } from 'src/enrollments/enrollments.service';
import { GetUser } from 'src/common/decorator';
import { getStudentId, toPlain } from 'src/common/utils/user.util';
import { RolesGuard } from 'src/common/guards/roles.guard';
import { Roles } from 'src/common/decorator/roles.decorator';
import { Role } from 'src/common/enums/role.enum';
import { CourseAccessService } from 'src/common/services/course-access.service';
import { isStaff } from 'src/common/utils/access.util';

interface UploadSession {
  id: string;
  filename: string;
  totalSize: number;
  uploadedSize: number;
  buffers: Map<number, Buffer>;
  keyName: string;
  lastActivity: Date;
  chunks: Set<number>;
}

@Controller('videos')
export class VideosController {
  private readonly logger = new Logger(VideosController.name);
  private readonly CHUNK_SIZE = 2 * 1024 * 1024; // 2MB chunks for better streaming
  private readonly UPLOAD_CHUNK_SIZE = 1024 * 1024; // 1MB upload chunks
  private readonly MAX_FILE_SIZE = 10 * 1024 * 1024 * 1024; // 10GB max file size
  private uploadSessions = new Map<string, UploadSession>();

  constructor(
    private readonly videosService: VideosService,
    private readonly storage: StorageService,
    private readonly enrollmentsService: EnrollmentsService,
    private readonly courseAccess: CourseAccessService,
  ) {
    // Clean up old upload sessions every hour
    setInterval(() => this.cleanupOldSessions(), 60 * 60 * 1000);

    // Ensure upload directories exist
    this.ensureUploadDirectories();
  }

  private async ensureUploadDirectories() { /* no-op: using Backblaze storage */ }

  private courseIdsFromDto(dto: { course?: string; courses?: string[] }): string[] {
    return [...new Set([...(dto.courses ?? []), ...(dto.course ? [dto.course] : [])])];
  }

  private async assertCanManageVideo(user: any, videoId: string) {
    const video = await this.videosService.findOne(videoId);
    const courseId = ((video as any).course?._id ?? (video as any).course).toString();
    await this.courseAccess.assertCanManageCourse(user, courseId);
    return video;
  }

  private async assertCanWatch(user: any, video: any) {
    if (isStaff(user)) {
      return;
    }
    const studentId = getStudentId(user);
    if (!studentId) {
      throw new ForbiddenException('غير مصرح');
    }
    const courseId = (video.course?._id ?? video.course).toString();
    const freeVideoId = await this.videosService.getFreeVideoId(courseId);
    if (freeVideoId === video._id.toString()) {
      return;
    }
    if (!(await this.enrollmentsService.hasActiveEnrollment(studentId, courseId))) {
      throw new ForbiddenException('هذا الفيديو مقفل، يرجى تفعيل الكورس أولاً');
    }
  }

  private cleanupOldSessions() {
    const now = new Date();
    const SESSION_TIMEOUT = 24 * 60 * 60 * 1000; // 24 hours

    for (const [sessionId, session] of this.uploadSessions.entries()) {
      if (now.getTime() - session.lastActivity.getTime() > SESSION_TIMEOUT) {
        // No local temp file to cleanup
        this.uploadSessions.delete(sessionId);
        this.logger.log(`Cleaned up expired upload session: ${sessionId}`);
      }
    }
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.Teacher, Role.Owner)
  @Post('upload/init')
  async initializeUpload(@Body() body: { filename: string; fileSize: number; contentType?: string }) {
    try {
      const { filename, fileSize, contentType } = body;

      // Validate file size
      if (fileSize > this.MAX_FILE_SIZE) {
        throw new BadRequestException(`File size exceeds maximum allowed size of ${this.MAX_FILE_SIZE / (1024 * 1024 * 1024)}GB`);
      }

      // Validate file type
      const ext = extname(filename).toLowerCase();
      const allowedExtensions = ['.mp4', '.webm', '.ogg', '.mov', '.avi', '.flv', '.wmv', '.m4v', '.3gp'];
      if (!allowedExtensions.includes(ext)) {
        throw new BadRequestException('Invalid file type. Only video files are allowed.');
      }

      // Generate unique session ID and filename
      const sessionId = crypto.randomUUID();
      const randomName = Array(32)
        .fill(null)
        .map(() => Math.round(Math.random() * 16).toString(16))
        .join('');
      const tempFilename = `${randomName}${ext}`;

      // Create upload session
      const session: UploadSession = {
        id: sessionId,
        filename,
        totalSize: fileSize,
        uploadedSize: 0,
        buffers: new Map<number, Buffer>(),
        keyName: tempFilename,
        lastActivity: new Date(),
        chunks: new Set()
      };

      this.uploadSessions.set(sessionId, session);

      // No local temp file

      this.logger.log(`Initialized upload session: ${sessionId} for file: ${filename} (${fileSize} bytes)`);

      return {
        sessionId,
        chunkSize: this.UPLOAD_CHUNK_SIZE,
        totalChunks: Math.ceil(fileSize / this.UPLOAD_CHUNK_SIZE)
      };
    } catch (error) {
      this.logger.error(`Upload initialization error: ${error.message}`, error.stack);
      throw error;
    }
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.Teacher, Role.Owner)
  @Post('upload/chunk/:sessionId')
  @UseInterceptors(
    FileInterceptor('chunk', {
      limits: {
        fileSize: 2 * 1024 * 1024, // 2MB max chunk size
      },
    })
  )
  async uploadChunk(
    @Param('sessionId') sessionId: string,
    @UploadedFile() chunk: Express.Multer.File,
    @Body() body: { chunkIndex: string; totalChunks: string }
  ) {
    try {
      const session = this.uploadSessions.get(sessionId);
      if (!session) {
        throw new BadRequestException('Invalid or expired upload session');
      }

      const chunkIndex = parseInt(body.chunkIndex);
      const totalChunks = parseInt(body.totalChunks);

      // Validate chunk index
      if (chunkIndex < 0 || chunkIndex >= totalChunks) {
        throw new BadRequestException('Invalid chunk index');
      }

      // Check if chunk already uploaded
      if (session.chunks.has(chunkIndex)) {
        return {
          success: true,
          uploadedChunks: session.chunks.size,
          totalChunks,
          progress: (session.chunks.size / totalChunks) * 100
        };
      }

      // Store chunk in memory
      const chunkBuffer = chunk.buffer;
      session.buffers.set(chunkIndex, chunkBuffer);

      // Update session
      session.chunks.add(chunkIndex);
      session.uploadedSize += chunkBuffer.length;
      session.lastActivity = new Date();

      this.logger.debug(`Uploaded chunk ${chunkIndex}/${totalChunks - 1} for session ${sessionId}`);

      const isComplete = session.chunks.size === totalChunks;

      return {
        success: true,
        uploadedChunks: session.chunks.size,
        totalChunks,
        progress: (session.chunks.size / totalChunks) * 100,
        isComplete
      };
    } catch (error) {
      this.logger.error(`Chunk upload error: ${error.message}`, error.stack);
      throw error;
    }
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.Teacher, Role.Owner)
  @Post('upload/complete/:sessionId')
  async completeUpload(
    @Param('sessionId') sessionId: string,
    @Body() createVideoDto: CreateVideoDto,
    @GetUser() user: any,
  ) {
    try {
      const session = this.uploadSessions.get(sessionId);
      if (!session) {
        throw new BadRequestException('Invalid or expired upload session');
      }

      await this.courseAccess.assertCanManageCourses(
        user,
        this.courseIdsFromDto(createVideoDto),
      );

      // Verify all chunks are uploaded
      const expectedChunks = Math.ceil(session.totalSize / this.UPLOAD_CHUNK_SIZE);
      if (session.chunks.size !== expectedChunks) {
        throw new BadRequestException(`Upload incomplete. Expected ${expectedChunks} chunks, got ${session.chunks.size}`);
      }

      // Upload to Backblaze (S3-compatible)
      const finalFilename = session.keyName;
      const totalChunks = Math.ceil(session.totalSize / this.UPLOAD_CHUNK_SIZE);
      const parts: Buffer[] = [];
      for (let i = 0; i < totalChunks; i++) {
        const buf = session.buffers.get(i);
        if (!buf) throw new BadRequestException(`Missing chunk ${i}`);
        parts.push(buf);
      }
      const fileBuffer = Buffer.concat(parts);
      const contentType = createVideoDto?.['contentType'] || this.getMimeType(extname(session.filename));
      const objectKey = `videos/${finalFilename}`;
      await this.storage.upload(objectKey, fileBuffer, contentType);

      const videos = await this.videosService.create({
        ...createVideoDto,
        filePath: objectKey,
      });

      // Clean up session
      this.uploadSessions.delete(sessionId);

      this.logger.log(`Upload completed for session ${sessionId}: ${session.filename} -> ${videos.length} course(s)`);

      return {
        success: true,
        video: videos[0],
        videos,
        message: 'Video uploaded successfully'
      };
    } catch (error) {
      this.logger.error(`Upload completion error: ${error.message}`, error.stack);
      throw error;
    }
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.Teacher, Role.Owner)
  @Get('upload/status/:sessionId')
  getUploadStatus(@Param('sessionId') sessionId: string) {
    const session = this.uploadSessions.get(sessionId);
    if (!session) {
      throw new BadRequestException('Invalid or expired upload session');
    }

    const expectedChunks = Math.ceil(session.totalSize / this.UPLOAD_CHUNK_SIZE);

    return {
      sessionId: session.id,
      filename: session.filename,
      totalSize: session.totalSize,
      uploadedChunks: session.chunks.size,
      totalChunks: expectedChunks,
      progress: (session.chunks.size / expectedChunks) * 100,
      lastActivity: session.lastActivity,
      missingChunks: Array.from({ length: expectedChunks }, (_, i) => i)
        .filter(i => !session.chunks.has(i))
    };
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.Teacher, Role.Owner)
  @Delete('upload/cancel/:sessionId')
  cancelUpload(@Param('sessionId') sessionId: string) {
    const session = this.uploadSessions.get(sessionId);
    if (!session) {
      throw new BadRequestException('Invalid or expired upload session');
    }
    this.uploadSessions.delete(sessionId);
    this.logger.log(`Upload session cancelled: ${sessionId}`);

    return { success: true, message: 'Upload cancelled successfully' };
  }

  // Original endpoints with enhanced streaming
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.Teacher, Role.Owner)
  @Post()
  @UseInterceptors(FileInterceptor('file'))
  async create(
    @UploadedFile() file: Express.Multer.File,
    @Body() createVideoDto: CreateVideoDto,
    @GetUser() user: any,
  ) {
    await this.courseAccess.assertCanManageCourses(
      user,
      this.courseIdsFromDto(createVideoDto),
    );
    const randomName = Array(32)
      .fill(null)
      .map(() => Math.round(Math.random() * 16).toString(16))
      .join('');
    const key = `videos/${randomName}${extname(file.originalname)}`;
    await this.storage.upload(key, file.buffer, file.mimetype);
    return this.videosService.create({
      ...createVideoDto,
      filePath: key,
    });
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.Teacher, Role.Owner)
  @Get()
  findAll() {
    return this.videosService.findAll();
  }

  @UseGuards(JwtAuthGuard)
  @Get('by-course/:courseId')
  async findAllByCourse(@Param('courseId') courseId: string, @GetUser() user: any) {
    const videos = await this.videosService.findAllByCourse(courseId);
    const studentId = getStudentId(user);
    const freeVideoId = await this.videosService.getFreeVideoId(courseId);
    const isEnrolled = studentId
      ? await this.enrollmentsService.hasActiveEnrollment(studentId, courseId)
      : isStaff(user);

    return videos.map((video) => {
      const isFree = video._id.toString() === freeVideoId;
      return { ...toPlain(video), isFree, isLocked: !isEnrolled && !isFree };
    });
  }

  @UseGuards(JwtAuthGuard)
  @Get(':id')
  async findOne(@Param('id') id: string, @GetUser() user: any) {
    const video = await this.videosService.findOne(id);
    await this.assertCanWatch(user, video);
    return video;
  }

  @UseGuards(JwtAuthGuard)
  @Get(':id/url')
  async getSignedUrl(@Param('id') id: string, @GetUser() user: any) {
    const video = await this.videosService.findOne(id);
    await this.assertCanWatch(user, video);
    const url = await this.storage.getSignedUrl(video.filePath);
    return { url };
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.Teacher, Role.Owner)
  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() updateVideoDto: UpdateVideoDto,
    @GetUser() user: any,
  ) {
    await this.assertCanManageVideo(user, id);
    return this.videosService.update(id, updateVideoDto);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.Teacher, Role.Owner)
  @Delete(':id')
  async remove(@Param('id') id: string, @GetUser() user: any) {
    await this.assertCanManageVideo(user, id);
    return this.videosService.remove(id);
  }

  @UseGuards(JwtAuthGuard)
  @Get('stream/:id')
  async streamVideo(@Param('id') id: string, @Res() res: Response, @GetUser() user: any, @Query('download') download?: string) {
    try {
      const video = await this.videosService.findOne(id);
      await this.assertCanWatch(user, video);
      const url = await this.storage.getSignedUrl(video.filePath);
      res.redirect(url);
    } catch (error) {
      if (error instanceof ForbiddenException) {
        res.status(HttpStatus.FORBIDDEN).json({ statusCode: HttpStatus.FORBIDDEN, message: error.message });
        return;
      }
      this.logger.error(`Video streaming error: ${error.message}`, error.stack);
      if (!res.headersSent) {
        res.status(HttpStatus.NOT_FOUND).json({
          message: 'Video not found or streaming error occurred',
          error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
      }
    }
  }

  // Helper method to get the MIME type based on file extension
  private getMimeType(ext: string): string {
    const mimeTypes = {
      '.mp4': 'video/mp4',
      '.webm': 'video/webm',
      '.ogg': 'video/ogg',
      '.mov': 'video/quicktime',
      '.avi': 'video/x-msvideo',
      '.flv': 'video/x-flv',
      '.wmv': 'video/x-ms-wmv',
      '.m4v': 'video/x-m4v',
      '.3gp': 'video/3gpp',
    };

    return mimeTypes[ext] || 'application/octet-stream';
  }
}