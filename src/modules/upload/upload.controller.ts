import { v2 as cloudinary } from 'cloudinary';
import multer from 'multer';
import { Request, Response } from 'express';
import { ApiResponse } from '../../utils/ApiResponse';
import { asyncHandler } from '../../utils/asyncHandler';
import { ApiError } from '../../utils/ApiError';
import prisma from '../../config/database';

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: {
    fileSize: parseInt(process.env.MAX_FILE_SIZE_MB ?? '5') * 1024 * 1024,
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

export const uploadMiddleware = upload.single('file');

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
