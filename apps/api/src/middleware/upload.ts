import multer from 'multer';
import { admin } from '../config/firebase';
import { Request, Response, NextFunction } from 'express';

const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: {
    fileSize: 10 * 1024 * 1024,
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'));
    }
  },
});

export const uploadSingle: any = upload.single('image');
export const uploadMultiple: any = upload.array('images', 5);

export async function uploadToFirebaseStorage(
  file: Express.Multer.File,
  folder: string = 'diagnostics'
): Promise<string> {
  try {
    const bucket = admin.storage().bucket();
    const fileName = `${folder}/${Date.now()}-${file.originalname}`;
    const fileUpload = bucket.file(fileName);

    const stream = fileUpload.createWriteStream({
      metadata: {
        contentType: file.mimetype,
      },
    });

    return new Promise((resolve, reject) => {
      stream.on('error', reject);
      stream.on('finish', async () => {
        try {
          await fileUpload.makePublic();
          const publicUrl = `https://storage.googleapis.com/${bucket.name}/${fileName}`;
          resolve(publicUrl);
        } catch (error) {
          reject(error);
        }
      });
      stream.end(file.buffer);
    });
  } catch (error) {
    console.error('Firebase storage upload error:', error);
    throw error;
  }
}

export function handleUploadError(error: any, req: Request, res: Response, next: NextFunction) {
  if (error instanceof multer.MulterError) {
    if (error.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({ error: 'File too large. Maximum size is 10MB.' });
    }
  }
  if (error.message === 'Only image files are allowed') {
    return res.status(400).json({ error: 'Only image files are allowed.' });
  }
  next(error);
}
