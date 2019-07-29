import { Document } from 'mongoose';

export interface FileUploadInterface {
  originalFilename: string;
  savedFilename: string;
  createdDate?: Date;
}

export interface SearchableFileUploadInterface {
  originalFilename?: string;
  savedFilename?: string;
  createdDate?: Date;
}

export interface FileUploadModelInterface
  extends FileUploadInterface,
    Document {}
