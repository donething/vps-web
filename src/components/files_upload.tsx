import React from "react"
import {request} from "do-utils"
import {JResult} from "../comm/typedef"

// 参数的类型
type FilesUploadProps = {
  // input 的 ID，用于打开文件选择框：document.querySelector(`#${id}`).click()
  id: string,
  // 上传地址
  apiURL: string,
  // 可选择的文件类型，默认不限制类型
  accept?: string
  // 上传文件时可能需要发送的请求头
  headers?: HeadersInit
  // 每个文件开始上传后的回调
  onUpload?: (name: string) => void
  // 每个文件上传完成后的回调，参数为文件名、错误（不为空表示上传失败）
  onFinish?: (name: string, err?: Error) => void
}

/**
 * 文件上传组件
 */
const FilesUpload = (props: FilesUploadProps) => {
  // 当选择了文件时触发上传文件事件
  const handleChoose = async (e: React.ChangeEvent<HTMLInputElement>) => {
    let files = e.target.files
    if (!files) {
      console.log("没有需要上传的文件")
      return
    }
    console.log(`选择上传 ${files.length} 个文件`)

    for (let i = 0; i < files.length; i++) {
      let name = files[i].name
      // 开始上传前
      // 此句需放在 input 的 onInput 事件中
      // props.onUpload && props.onUpload(name)

      // 正式上传
      let form = new FormData()
      form.append(name, files[i])
      let resp = await request(props.apiURL, form, {headers: props.headers})
        .catch(e => console.log(`上传文件"${name} 出错：`, e))
      // 网络出错
      if (!resp) {
        props.onFinish && props.onFinish(name, new Error("无法连接到目标网站"))
        break
      }

      let obj: JResult<{ [name: string]: string }> = await resp.json()
      // 上传失败
      if (obj.code !== 0) {
        props.onFinish && props.onFinish(name, new Error(obj.data[name]))
        continue
      }

      // 上传成功
      props.onFinish && props.onFinish(name, undefined)
    }

    // 以便在选择相同的文件再次触发 onChange
    e.target.value = ""
  }

  return (
    <input type="file" accept={props.accept || "*"} id={props.id} multiple hidden
           onInput={(e: React.ChangeEvent<HTMLInputElement>) => {
             // 和 onChange 分开，以避免在上传完成后在 filesStatus 中找不到项目的问题
             let files = e.target.files
             if (!files) return

             for (let i = 0; i < files.length; i++) {
               props.onUpload && props.onUpload(files[i].name)
             }
           }}
           onChange={handleChoose}
    />
  )
}

export default FilesUpload