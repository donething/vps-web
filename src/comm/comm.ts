import {LS_AUTH_KEY} from "../funcs/settings"
import {request} from "do-utils"
import {JResult} from "./typedef"
import React from "react"
import {SnackbarMsg} from "../components/snackbar"
import {sha256} from "do-utils/dist/text"

// 执行网络请求，适配当前界面
export const getJSON = async <T>(
  path: string,
  data: string | object | FormData | undefined,
  setSbMsg?: React.Dispatch<React.SetStateAction<SnackbarMsg>>
): Promise<JResult<T> | undefined> => {
  // 操作授权码
  let auth = localStorage.getItem(LS_AUTH_KEY) || ""
  let t = new Date().getTime()
  let s = await sha256(auth + t + auth)

  // 追加授权码
  let p = path + (path.indexOf("?") === -1 ? "?" : "&") + `t=${t}&s=${s}`

  let resp = await request(p, data).catch(e => console.error(`执行网络请求 "${path}" 出错`, e))
  // 网络出错
  if (!resp) {
    setSbMsg && setSbMsg(prev => ({
      ...prev,
      open: true,
      message: `执行网络请求 "${path}" 出错`,
      severity: "error",
      autoHideDuration: undefined,
      onClose: () => console.log("")
    }))
    return undefined
  }

  let obj: JResult<T> = await resp.json()
    .catch(e => console.error(`解析响应为 JSON 对象时出错`, e))
  if (!obj) {
    setSbMsg && setSbMsg(prev => ({
      ...prev,
      open: true,
      message: "解析响应为 JSON 对象时出错",
      severity: "error",
      autoHideDuration: undefined,
      onClose: () => console.log("")
    }))
    return undefined
  }

  // 获取失败
  if (obj.code !== 0) {
    console.log(`获取远程数据失败：`, obj.msg)
    setSbMsg && setSbMsg(prev => ({
      ...prev,
      open: true,
      message: `获取远程数据失败：${obj.msg}`,
      severity: "error",
      autoHideDuration: undefined,
      onClose: () => console.log("")
    }))
    return obj
  }

  return obj
}