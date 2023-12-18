// 录制直播的设置
export type Settings = {
  // 禁止捕获直播
  DisCapture: boolean
}

// 默认的录制直播的设置
export const settingsDefault = (): Settings => (
  {
    DisCapture: false
  }
)
