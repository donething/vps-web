import React, {Fragment, ReactNode, useState} from "react"
import {useBetween} from "use-between"
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  SxProps
} from "@mui/material"

// 控制显示 Dialog
class DialogMsg {
  open: boolean = false                 // 必须
  title: string = ""                    // 必须
  message?: string = ""                 // message、content 至少要有一项
  content?: string | JSX.Element = ""
  dividers?: boolean = false            // 是否显示顶部、底部的分割线，默认 false
  // 默认的确认、取消回调，仅当 action 为空时有效
  onOK?: () => void = undefined
  onCancel?: () => void = undefined
  // 确认、取消的行为，用于自定义
  action?: ReactNode
  // 是否为模态对话框，默认 false
  modal?: boolean = false

  // 其它属性
  ps?: { [key: string]: string }
}

// 共享 Dialog
export const useDialog = () => {
  const [dialogMsg, setDialogMsg] = useState(new DialogMsg())

  return {dialogMsg, setDialogMsg}
}

// 对话框组件
const DialogComp = (props: { sx?: SxProps }) => {
  const {dialogMsg, setDialogMsg} = useBetween(useDialog)

  return (
    <Dialog sx={{...props.sx}} {...dialogMsg.ps} open={dialogMsg.open} scroll={"paper"} fullWidth
            onBackdropClick={dialogMsg.modal ? undefined : () =>
              setDialogMsg(prev => ({...prev, open: false}))}>
      <DialogTitle>{dialogMsg.title}</DialogTitle>

      <DialogContent dividers={dialogMsg.dividers}>
        {dialogMsg.message && <DialogContentText>{dialogMsg.message}</DialogContentText>}
        {dialogMsg.content && dialogMsg.content}
      </DialogContent>

      <DialogActions>
        {dialogMsg.action ? dialogMsg.action : <Fragment>
          <Button onClick={() => dialogMsg.onCancel && dialogMsg.onCancel()}>取消</Button>
          <Button onClick={() => dialogMsg.onOK && dialogMsg.onOK()}>确定</Button>
        </Fragment>}
      </DialogActions>
    </Dialog>
  )
}

export default DialogComp