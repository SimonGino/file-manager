export interface Document {
  id: number;
  filename: string;
  preview_url: string;
  file_md5: string;
  file_size: number;
  mime_type: string;
  minio_path: string;
  file_uuid: string;
  uploader_id: number;
  is_public: boolean;
  download_count: number;
  created_at: string;
  updated_at: string;
} 