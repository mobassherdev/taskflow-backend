import prisma from "../../config/db";
import { env } from '../../config/env';
import { v2 as cloudinary } from 'cloudinary';
import { Request, Response } from 'express';
import multer from 'multer';
import { ApiError } from '../../common/utils/ApiError';
import { ApiResponse } from '../../common/utils/ApiResponse';
import { asyncHandler } from '../../common/utils/asyncHandler';

cloudinary.config({
  cloud_name: env.cloudinary.cloudName,
  api_key: env.cloudinary.apiKey,
  api_secret: env.cloudinary.apiSecret,
});

const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: {
    fileSize: env.maxFileSizeMB * 1024 * 1024,
  },
  fileFilter: (_req, file, cb) => {
    const allowed = [
      'image/jpeg', 'image/png', 'image/gif', 'image/webp',
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'text/plain',
    ];
    if (allowed.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new ApiError(400, `File type ${file.mimetype} is not allowed`));
    }
  },
});

export const uploadMiddleware: ReturnType<typeof upload.single> = upload.single('file');

export const uploadFile = asyncHandler(async (req: Request, res: Response) => {
  const file = req.file;
  if (!file) {
    throw new ApiError(400, 'No file provided');
  }

  const b64 = file.buffer.toString('base64');
  const dataURI = `data:${file.mimetype};base64,${b64}`;

  const result = await cloudinary.uploader.upload(dataURI, {
    resource_type: 'auto',
    folder: 'taskflow/attachments',
  });

  const attachment = await prisma.attachment.create({
    data: {
      filename: file.originalname,
      url: result.secure_url,
      mimeType: file.mimetype,
      size: file.size,
      taskId: req.body.taskId || '',
    },
  });

  res.status(201).json(new ApiResponse(201, attachment, 'File uploaded successfully'));
});
