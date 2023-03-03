// 网站的界面信息
export type WebSite = {
  fanhao: InputInfo
  novel: InputInfo
}

export type InputInfo = {
  cType: string
  cTypeName: string,
  inputLabel: string
  tags: string
  bnText: string
}

// 可选择的功能
export type WebSiteCType = keyof WebSite

// 发送内容的结果
export type SendResult = {
  // 内容经解析后的名字
  name: string
  // 成功为0；发送过为 10；发送失败为 20
  code: number
  // 成功、发过、失败的提示
  msg: string
}