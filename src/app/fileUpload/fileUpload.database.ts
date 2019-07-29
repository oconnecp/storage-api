import { Schema, model } from 'mongoose';

import {
  FileUploadInterface,
  FileUploadModelInterface,
} from './fileUpload.interface';

const uploadedFileSchema: Schema<FileUploadInterface> = new Schema({
  savedFilename: { type: String, index: true, required: true },
  originalFilename: { type: String, required: true },
  createdDate: Date,
});

uploadedFileSchema.pre('save', function(
  this: FileUploadModelInterface,
  next: () => void
) {
  const now = new Date();
  this.createdDate = now;
  next();
});

const uploadedFile = model<FileUploadModelInterface>(
  'UploadedFile',
  uploadedFileSchema
);

export {
  uploadedFile as UploadedFile,
  uploadedFileSchema as UploadedFileSchema,
};
