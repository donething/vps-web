import type {DoLItemProps} from "do-comps"

// 主播平台
export type Plat = "bili" | "douyin" | "zuji"

// 主播的状态信息（需联网获取）
export type AnchorInfo = {
  id: string
  plat: Plat
  avatar: string
  name: string
  desp: string
  webUrl: string
  title: string
  isLive: boolean
  isCycle: boolean
  streamUrl: string
  status: string
}

// 多条件排序函数
// 可按需修改 比较的内容
export const Sorts = {
  // 比较函数
  // 返回-1表示a排在b前面，返回1表示b排在a前面，返回0表示还无法判断顺序

  // 根据是否被标记排序，被标记的排在前面
  isMarked: (a: DoLItemProps, b: DoLItemProps) => {
    // 状态相同则无法判断结果
    if (a.isMarked === b.isMarked) {
      return 0
    }

    // 其它情况得到排序结果
    if (a.isMarked) return -1
    if (b.isMarked) return 1
  },
  // 根据 ID(平台_用户ID) 排序
  id: (a: DoLItemProps, b: DoLItemProps) => {
    return a.id.toString().localeCompare(b.id.toString())
  },

  // 按是否在播排序
  online: (a?: boolean, b?: boolean) => {
    // 状态相同则无法判断结果
    if (a === b) {
      return 0
    }

    // 其它情况得到排序结果
    if (a) return -1
    if (b) return 1
  },
  // 按平台名排序
  plat: (a: string, b: string) => {
    return a.localeCompare(b)
  },
  // 按主播名/房间名排序
  name: (a: string, b: string) => {
    return a.localeCompare(b)
  }
}
