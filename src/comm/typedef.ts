// API 返回类型
export interface JResult<T> {
  success: boolean;
  code: number;
  msg: string;
  data: T;
}

// API file 中的文件信息
export interface FileInfo {
  name: string;
  last: string;
  size: string;
  is_dir: boolean;
}