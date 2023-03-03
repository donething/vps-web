// API 返回类型
export interface JResult<T> {
  code: number;
  msg: string;
  data: T;
}
