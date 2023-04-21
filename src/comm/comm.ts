import {request, sha256} from "do-utils"
import {JResult} from "./typedef"
import {DoSnackbarProps} from "do-comps"
import {LS_ACCESS_KEY} from "../funcs/settings"

// 执行网络请求，适配当前界面
export const getJSON = async <T>(
  path: string,
  data: string | object | FormData | undefined,
  showSb?: (ps: DoSnackbarProps) => void
): Promise<JResult<T> | undefined> => {
  let access = localStorage.getItem(LS_ACCESS_KEY) || ""
  let t = new Date().getTime()
  let headers = {
    "t": t,
    "s": await sha256(access + t + access)
  }

  // @ts-ignore
  let resp = await request(path, data, {headers}).catch(e =>
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

  let obj: JResult<T> = await resp.json().catch(e => console.error(`解析响应为 JSON 对象时出错`, e))
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
    console.log(`服务端响应码显示执行失败：`, obj.msg)
    showSb && showSb({
      open: true,
      message: `执行失败：${obj.msg}`,
      severity: "error",
      autoHideDuration: undefined
    })
    return obj
  }

  return obj
}