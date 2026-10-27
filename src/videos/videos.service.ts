import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Video, VideoDocument } from './schemas/video.schema';
import { CreateVideoDto } from './dto/create-video.dto';
import { UpdateVideoDto } from './dto/update-video.dto';

@Injectable()
export class VideosService {
  constructor(
    @InjectModel(Video.name) private videoModel: Model<VideoDocument>,
  ) { }

  /** One video record per course; all records share the same stored file. */
  async create(createVideoDto: CreateVideoDto): Promise<VideoDocument[]> {
    const { course, courses, ...rest } = createVideoDto;
    const courseIds = [...new Set([...(courses ?? []), ...(course ? [course] : [])])];
    if (!courseIds.length) {
      throw new BadRequestException('يجب اختيار كورس واحد على الأقل');
    }
    return this.videoModel.insertMany(
      courseIds.map((courseId) => ({ ...rest, course: new Types.ObjectId(courseId) })),
    ) as unknown as Promise<VideoDocument[]>;
  }

  async findAll(): Promise<Video[]> {
    return this.videoModel.find().populate('course').sort({ createdAt: 1 }).exec();
  }

  async findAllByCourse(courseId: string): Promise<VideoDocument[]> {
    return this.videoModel
      .find({ course: courseId })
      .sort({ createdAt: 1 })
      .exec();
  }

  /** The course's first lesson (lowest `order`, then oldest upload) is always open to every student. */
  async getFreeVideoId(courseId: string): Promise<string | null> {
    const videos = await this.videoModel
      .find({ course: new Types.ObjectId(courseId) })
      .select('_id order createdAt')
      .lean()
      .exec();
    if (!videos.length) {
      return null;
    }
    videos.sort((a: any, b: any) => {
      const orderA = a.order ?? Number.POSITIVE_INFINITY;
      const orderB = b.order ?? Number.POSITIVE_INFINITY;
      if (orderA !== orderB) {
        return orderA - orderB;
      }
      return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
    });
    return videos[0]._id.toString();
  }

  async findOne(id: string): Promise<Video> {
    const video = await this.videoModel.findById(id).populate('course').exec();
    if (!video) {
      throw new NotFoundException(`الفيديو برقم المعرف ${id} غير موجود`);
    }
    return video;
  }

  async update(id: string, updateVideoDto: UpdateVideoDto): Promise<Video> {
    const { courses, ...changes } = updateVideoDto;
    const updatedVideo = await this.videoModel
      .findByIdAndUpdate(id, changes, { new: true })
      .exec();

    if (!updatedVideo) {
      throw new NotFoundException(`الفيديو برقم المعرف ${id} غير موجود`);
    }
    return updatedVideo;
  }

  async remove(id: string): Promise<Video> {
    const deletedVideo = await this.videoModel.findByIdAndDelete(id).exec();
    if (!deletedVideo) {
      throw new NotFoundException(`الفيديو برقم المعرف ${id} غير موجود`);
    }
    return deletedVideo;
  }
}
