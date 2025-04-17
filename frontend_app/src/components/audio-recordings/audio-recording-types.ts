export interface AudioRecording {
  id: string
  user_id: string
  file_path: string
  transcription_file_path: string | null
  analysis_file_path: string | null
  prompt_category_id: string
  prompt_subcategory_id: string
  status: 'uploaded' | 'processing' | 'completed' | 'error'
  transcription_id: string | null
  created_at: number
  updated_at: number
  type: string
  _rid: string
  _self: string
  _etag: string
  _attachments: string
  _ts: number
} 