import {useState} from "react"
import {Drawer, Stack} from "@mui/material"
import {useBetween} from "use-between"

// 控制显示抽屉组件 Drawer 的信息
export class DrawerMsg {
  // 必须
  open: boolean = false
  // 显示的位置
  anchor?: "left" | "top" | "right" | "bottom" = "bottom"
  content?: JSX.Element
  onClose?: () => void
}

// 共享抽屉组件 Drawer
export const useDrawer = () => {
  const [drawerMsg, setDrawerMsg] = useState(new DrawerMsg())

  return {drawerMsg, setDrawerMsg}
}

// 抽屉组件 Drawer
const DrawerComp = () => {
  const {drawerMsg, setDrawerMsg} = useBetween(useDrawer)

  return (
    <Drawer anchor={drawerMsg.anchor} open={drawerMsg.open}
            onClose={() => {
              // 关闭抽屉
              setDrawerMsg(prev => ({...prev, open: false}))
              // 执行可能的回调
              drawerMsg.onClose && drawerMsg.onClose()
            }}>
      <Stack>{drawerMsg.content}</Stack>
    </Drawer>
  )
}

export default DrawerComp