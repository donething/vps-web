// 录制直播的设置
export type Settings = {
  // 禁止捕获直播
  disCap: boolean
}

// 默认的录制直播的设置
export var settingsDefault = (): Settings => (
  {
    disCap: false
  }
)
