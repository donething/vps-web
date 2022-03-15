import {Backdrop, CircularProgress, SxProps} from "@mui/material"
import React, {useState} from "react"
import {useBetween} from "use-between"

// 控制 蒙版组件 Backdrop 的信息
class BackdropMsg {
  // 必须
  open: boolean = false
  // 需要显示的组件
  content?: JSX.Element = <CircularProgress/>
  // 背景颜色。默认灰色，可以设为透明"transparent"
  bg?: string
  onClick?: (event: React.MouseEvent) => void
}

// 共享 蒙版组件 Backdrop 的内容、显示
export const useBackdrop = () => {
  const [backdropMsg, setBackdropMsg] = useState(new BackdropMsg())

  return {backdropMsg, setBackdropMsg}
}

// 共享 蒙版组件 Backdrop
const BackdropComp = (props: { sx?: SxProps }) => {
  const {backdropMsg} = useBetween(useBackdrop)

  return (
    <Backdrop sx={{
      ...props.sx, zIndex: (theme) => theme.zIndex.drawer + 1,
      background: backdropMsg.bg, color: "#FFF"
    }} open={backdropMsg.open} onClick={backdropMsg.onClick}>
      {backdropMsg.content}
    </Backdrop>
  )
}

export default BackdropComp