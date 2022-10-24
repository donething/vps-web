import {request} from "do-utils"
import {JResult} from "./typedef"
import {DoSnackbarProps} from "do-comps"
import {sha256} from "do-utils/dist/text"
import {LS_AUTH_KEY} from "../funcs/settings"

// 生成授权码
export const genAuth = async () => {
  let auth = localStorage.getItem(LS_AUTH_KEY) || ""
  let t = new Date().getTime()
  let s = await sha256(auth + t + auth)
  return {t, s}
}

// 生成含授权码的请求头
export const genAuthHeaders = async () => {
  let {t, s} = await genAuth()
  return new Headers({
    "t": t.toString(),
    "s": s
  })
}

// 执行网络请求，适配当前界面
export const getJSON = async <T>(
  path: string,
  data: string | object | FormData | undefined,
  showSb?: (ps: DoSnackbarProps) => void
): Promise<JResult<T> | undefined> => {
  let headers = await genAuthHeaders()

  let resp = await request(path, data, {headers: headers}).catch(e =>
    console.error(`执行网络请求 "${path}" 出错`, e)
  )
  // 网络出错
  if (!resp) {
    showSb && showSb({
      open: true,
      message: `执行网络请求 "${path}" 出错`,
      severity: "error",
      autoHideDuration: undefined
    })
    return undefined
  }

  let obj: JResult<T> = await resp.json()
    .catch(e => console.error(`解析响应为 JSON 对象时出错`, e))
  if (!obj) {
    showSb && showSb({
      open: true,
      message: "解析响应为 JSON 对象时出错",
      severity: "error",
      autoHideDuration: undefined
    })
    return undefined
  }

  // 获取失败
  if (obj.code !== 0) {
    console.log(`获取远程数据失败：`, obj.msg)
    showSb && showSb({
      open: true,
      message: `获取远程数据失败：${obj.msg}`,
      severity: "error",
      autoHideDuration: undefined
    })
    return obj
  }

  return obj
}