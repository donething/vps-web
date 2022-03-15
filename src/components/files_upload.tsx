import {useBetween} from "use-between"
import {useSnackbar} from "./snackbar"
import React from "react"
import {request} from "do-utils"
import {JResult} from "../comm/typedef"

// 参数的类型
interface FilesUploadProps {
  // input 的 ID，用于手动显示文件选择框：document.querySelector(`#${id}`).click()
  id: string,
  // 上传地址
  apiURL: string,
  // 请求头
  headers?: HeadersInit
  // 每个文件上传完成后的回调，参数为文件名、错误（不为空表示上传失败）
  onFinish?: (name: string, err?: Error) => void
}

/**
 * 文件上传组件
 */
const FilesUpload = (props: FilesUploadProps) => {
  // 共享 Snackbar
  const {setSbMsg} = useBetween(useSnackbar)

  // 当选择了文件时触发上传文件事件
  const handleChoose = async (e: React.ChangeEvent<HTMLInputElement>) => {
    let files = e.target.files
    if (!files) {
      console.log("没有需要上传的文件")
      return
    }
    console.log(`已选择上传 ${files.length} 个文件`)

    for (let i = 0; i < files.length; i++) {
      let name = files[i].name
      let form = new FormData()
      form.append(name, files[i])
      let resp = await request(props.apiURL, form, {headers: props.headers})
      let obj: JResult<{ [name: string]: string }> =
        await resp.json().catch(e => console.log(`文件"${name} 上传出错：`, e))

      // 网络出错
      if (!obj) {
        setSbMsg(prev => ({
          ...prev,
          open: true,
          message: `文件"${name}" 上传出错：服务端响应码 ${resp.status}`,
          severity: "error",
          autoHideDuration: undefined,
          onClose: () => console.log("已手动关闭 Snackbar")
        }))
        props.onFinish && props.onFinish(name, new Error(`服务端响应码 ${resp.status}`))
        break
      }

      // 上传失败
      if (obj.code !== 0) {
        console.log(`文件"${name}" 上传失败：`, obj.data[name])
        setSbMsg(prev => ({
          ...prev,
          open: true,
          message: `文件"${name}" 上传失败：${obj.data[name]}`,
          severity: "error",
          autoHideDuration: undefined,
          onClose: () => console.log("已手动关闭 Snackbar")
        }))
        props.onFinish && props.onFinish(name, new Error(obj.data[name]))
        continue
      }

      // 上传成功
      console.log(`文件"${name}" 上传成功`)
      setSbMsg(prev => ({
        ...prev,
        open: true,
        message: `文件"${name}" 上传成功`,
        severity: "success"
      }))
      props.onFinish && props.onFinish(name, undefined)
    }
  }

  return (
    <input accept="*" id={props.id} type="file" multiple hidden onChange={handleChoose}/>
  )
}

export default FilesUpload