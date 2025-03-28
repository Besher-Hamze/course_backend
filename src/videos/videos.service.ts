import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Video, VideoDocument } from './schemas/video.schema';
import { CreateVideoDto } from './dto/create-video.dto';
import { UpdateVideoDto } from './dto/update-video.dto';

@Injectable()
export class VideosService {
  constructor(
    @InjectModel(Video.name) private videoModel: Model<VideoDocument>,
  ) {}

  async create(createVideoDto: CreateVideoDto): Promise<Video> {
    const newVideo = new this.videoModel(createVideoDto);
    return newVideo.save();
  }

  async findAll(): Promise<Video[]> {
    return this.videoModel.find().populate('course').exec();
  }

  async findAllByCourse(courseId: string): Promise<Video[]> {
    return this.videoModel
      .find({ course: courseId })
      .sort({ order: 1 })
      .exec();
  }

  async findOne(id: string): Promise<Video> {
    const video = await this.videoModel.findById(id).populate('course').exec();
    if (!video) {
      throw new NotFoundException(`الفيديو برقم المعرف ${id} غير موجود`);
    }
    return video;
  }

  async update(id: string, updateVideoDto: UpdateVideoDto): Promise<Video> {
    const updatedVideo = await this.videoModel
      .findByIdAndUpdate(id, updateVideoDto, { new: true })
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