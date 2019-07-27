import { Document, Schema, Model, model } from 'mongoose';

import { UploadedFileInterface } from './uploadedFile.interface';

export interface UploadedFileModelInterface
  extends UploadedFileInterface,
    Document {}

const uploadedFileSchema: Schema<UploadedFileInterface> = new Schema({
  savedFilename: { type: String, index: true, required: true },
  originalFilename: { type: String, required: true },
  createdDate: Date,
});

uploadedFileSchema.pre('save', function(
  this: UploadedFileModelInterface,
  next: () => void
) {
  const now = new Date();
  this.createdDate = now;
  next();
});

const uploadedFile: Model<UploadedFileModelInterface> = model<
  UploadedFileModelInterface
>('UploadedFile', uploadedFileSchema);

export {
  uploadedFile as UploadedFile,
  uploadedFileSchema as UploadedFileSchema,
};
