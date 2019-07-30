import { Schema, model } from 'mongoose';

import {
  FileUploadInterface,
  FileUploadModelInterface,
} from './fileUpload.interface';

const fileUploadSchema: Schema<FileUploadInterface> = new Schema({
  savedFilename: { type: String, index: true, unique: true, required: true },
  originalFilename: { type: String, required: true },
  createdDate: Date,
});

fileUploadSchema.pre('save', function(
  this: FileUploadModelInterface,
  next: () => void
) {
  const now = new Date();
  this.createdDate = now;
  next();
});

const fileUploadModel = model<FileUploadModelInterface>(
  'FileUpload',
  fileUploadSchema
);

export {
  fileUploadModel as FileUploadModel,
  fileUploadSchema as FileUploadSchema,
};
