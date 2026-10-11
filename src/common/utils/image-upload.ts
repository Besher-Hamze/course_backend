import { BadRequestException } from '@nestjs/common';
import { memoryStorage } from 'multer';

export const MAX_IMAGE_SIZE = 5 * 1024 * 1024;

export const imageUploadOptions = {
    storage: memoryStorage(),
    limits: { fileSize: MAX_IMAGE_SIZE },
    fileFilter: (_req: any, file: Express.Multer.File, cb: (error: Error | null, accept: boolean) => void) => {
        if (!/^image\/(jpeg|png|webp|gif)$/.test(file.mimetype)) {
            return cb(new BadRequestException('يجب أن تكون الصورة بصيغة JPG أو PNG أو WEBP أو GIF'), false);
        }
        cb(null, true);
    },
};
