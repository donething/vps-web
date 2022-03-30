import {LS_AUTH_KEY} from "../funcs/settings"
import {request} from "do-utils"
import {JResult} from "./typedef"
import React from "react"
import {SnackbarMsg} from "../components/snackbar"

// 执行网络请求，适配当前界面
export const getJSON = async <T>(
  url: string,
  data: string | object | FormData | undefined,
  setSbMsg: React.Dispatch<React.SetStateAction<SnackbarMsg>>
): Promise<JResult<T> | undefined> => {
  const headers = {"Authorization": localStorage.getItem(LS_AUTH_KEY) || ""}

  let resp = await request(url, data, {headers: headers})
    .catch(e => console.error(`执行网络请求 "${url}" 出错`, e))
  // 网络出错
  if (!resp) {
    setSbMsg(prev => ({
      ...prev,
      open: true,
      message: `执行网络请求 "${url}" 出错`,
      severity: "error",
      autoHideDuration: undefined,
      onClose: () => console.log("")
    }))
    return undefined
  }

  let obj: JResult<T> = await resp.json()
  // 获取失败
  if (obj.code !== 0) {
    console.log(`获取远程数据失败：`, obj.msg)
    setSbMsg(prev => ({
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