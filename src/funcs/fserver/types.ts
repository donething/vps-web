// API file 中的文件信息
export type FileInfo = {
  name: string;
  last: string;
  size: string;
  isDir: boolean;
}

// 文件上传状态的类型
export type UpStatusType = {
  name: string
  status: boolean | string
}