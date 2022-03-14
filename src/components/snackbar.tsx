// Snackbar 需展示的信息
import React, {ReactNode, useState} from "react"
import {Alert, Snackbar, SxProps} from "@mui/material"
import {useBetween} from "use-between"

// 控制显示 Snackbar
class SnackbarMsg {
  open: boolean = false   // 必须
  message: string = ""    // 必须
  severity: "error" | "warning" | "info" | "success" = "info"
  // 行为，如设置按钮
  action?: ReactNode
  // 当指定数字（毫秒，通常设为 6000）时自动隐藏
  autoHideDuration?: number = 6000
  // 当不指定时，不会显示关闭按钮，若 autoHideDuration 为空时需指定以便关闭
  onClose?: () => void

  // 其它属性
  ps?: { [key: string]: string }
}

// 共享 Snackbar
export const useSnackbar = () => {
  const [sbMsg, setSbMsg] = useState(new SnackbarMsg())
  return {sbMsg, setSbMsg}
}

// 自定义 Snackbar 组件
export const SnackbarComp = (props: { sx?: SxProps }) => {
  const {sbMsg, setSbMsg} = useBetween(useSnackbar)

  return (
    <Snackbar sx={{...props.sx}} {...sbMsg.ps} open={sbMsg.open}
              autoHideDuration={sbMsg.autoHideDuration} onClose={() => {
      // 用于关闭 Snackbar，如果没有该 onClose 回调，Snackbar 将无法关闭（即使指定了 autoHideDuration）
      setSbMsg(prev => ({...prev, open: false}))
    }}>
      <Alert sx={{width: "100%"}} severity={sbMsg.severity} action={sbMsg.action}
             onClose={!sbMsg.onClose ? undefined : () => {
               // 用于点击关闭按钮后回调，如果没有 onClose 属性，将不出现关闭按钮
               setSbMsg(prev => ({...prev, open: false}))
               sbMsg.onClose && sbMsg.onClose()
             }}>
        {sbMsg.message}
      </Alert>
    </Snackbar>
  )
}
