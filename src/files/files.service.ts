import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { File, FileDocument } from './schemas/file.schema';
import { CreateFileDto } from './dto/create-file.dto';
import { UpdateFileDto } from './dto/update-file.dto';

@Injectable()
export class FilesService {
  constructor(
    @InjectModel(File.name) private fileModel: Model<FileDocument>,
  ) {}

  async create(createFileDto: CreateFileDto): Promise<File> {
    const newFile = new this.fileModel(createFileDto);
    return newFile.save();
  }

  async findAll(): Promise<File[]> {
    return this.fileModel.find().populate('course').exec();
  }

  async findAllByCourse(courseId: string): Promise<File[]> {
    return this.fileModel
      .find({ course: courseId })
      .exec();
  }

  async findOne(id: string): Promise<File> {
    const file = await this.fileModel.findById(id).populate('course').exec();
    if (!file) {
      throw new NotFoundException(`الملف برقم المعرف ${id} غير موجود`);
    }
    return file;
  }

  async update(id: string, updateFileDto: UpdateFileDto): Promise<File> {
    const updatedFile = await this.fileModel
      .findByIdAndUpdate(id, updateFileDto, { new: true })
      .exec();
      
    if (!updatedFile) {
      throw new NotFoundException(`الملف برقم المعرف ${id} غير موجود`);
    }
    return updatedFile;
  }

  async remove(id: string): Promise<File> {
    const deletedFile = await this.fileModel.findByIdAndDelete(id).exec();
    if (!deletedFile) {
      throw new NotFoundException(`الملف برقم المعرف ${id} غير موجود`);
    }
    return deletedFile;
  }
}

