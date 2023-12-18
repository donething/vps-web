import {
  Alert,
  Avatar,
  Breadcrumbs,
  Button,
  Divider, Drawer,
  IconButton,
  List,
  ListItem,
  ListItemAvatar, ListItemButton,
  ListItemText,
  Menu,
  MenuItem,
  Stack,
  SvgIcon,
  Typography,
} from "@mui/material"
import React, {Fragment, useEffect, useState} from "react"
import {useBetween} from "use-between"
import {LS_Trans_Port_KEY} from "../settings"
import FolderOutlinedIcon from "@mui/icons-material/FolderOpenOutlined"
import FileOutlinedIcon from "@mui/icons-material/FileOpenOutlined"
import {ReactComponent as IconNginx} from "../../icons/nginx.svg"
import {ReactComponent as IconLink} from "../../icons/link.svg"
import {ReactComponent as IconMagnet} from "../../icons/magnet.svg"
import FileUploadOutlinedIcon from "@mui/icons-material/FileUploadOutlined"
import CloudSyncOutlinedIcon from "@mui/icons-material/CloudSyncOutlined"
import CloseOutlinedIcon from "@mui/icons-material/CloseOutlined"
import {getHeaders, reqJSON} from "../../comm/comm"
import {DoSnackbarProps, DoDialogProps, useSharedSnackbar, useSharedDialog, DoFileUpload} from "do-comps"
import {FileInfo, UpStatusType} from "./types"
import {sxBG, sxScroll} from "./sx"
import CloudUploadOutlinedIcon from "@mui/icons-material/CloudUploadOutlined"

// 标签
const TAG = "[FServer]"

// 共享
const useValues = () => {
  // 当前路径
  const [paths, setPaths] = useState(["."])

  // 文件上传状态的开关
  const [fStatusOpen, setFStatusOpen] = useState(false)

  // 文件上传状态的信息列表
  const [filesStatus, setFilesStatus] = useState<UpStatusType[]>([])

  return {
    paths,
    setPaths,
    fStatusOpen,
    setFStatusOpen,
    filesStatus,
    setFilesStatus
  }
}

// 共享
const useSharedValues = () => useBetween(useValues)

// 菜单
const Menus = React.memo(() => {
  // 是否显示菜单列表
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null)

  // 共享 显示上传状态组件
  const {setFStatusOpen} = useSharedValues()

  // 点击了菜单弹出菜单列表
  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget)
  }

  // 点击率菜单列表项
  const handleClose = async (action: string) => {
    // 先关闭菜单
    setAnchorEl(null)

    switch (action) {
      case "Nginx":
        window.open("/downloads", "_blank")
        break
      case "DL_Link":
        window.open("/ariang", "_blank")
        break
      case "DL_Magnet":
        let port = localStorage.getItem(LS_Trans_Port_KEY) || ""
        let url = `//${window.location.host}:${port}`
        window.open(url, "_blank")
        break
      case "UP_FILES":
        (document.querySelector("#UP_FILES") as HTMLElement).click()
        break
      case "UD_Progress":
        setFStatusOpen(true)
        break
    }
  }

  return (
    <Fragment>
      <Button color={"secondary"} onClick={handleClick}>菜单</Button>

      <Menu open={Boolean(anchorEl)} anchorEl={anchorEl} onClose={handleClose}>
        <MenuItem sx={{gap: 2, color: "#555"}} onClick={() => handleClose("Nginx")}>
          <SvgIcon component={IconNginx} viewBox="0 0 1024 1024"/>打开 Nginx目录
        </MenuItem>
        <MenuItem sx={{gap: 2, color: "#555"}} onClick={() => handleClose("DL_Link")}>
          <SvgIcon component={IconLink} viewBox="0 0 1024 1024"/> 下载 普通链接
        </MenuItem>
        <MenuItem sx={{gap: 2, color: "#555"}} onClick={() => handleClose("DL_Magnet")}>
          <SvgIcon component={IconMagnet} viewBox="0 0 1024 1024"/> 下载 磁力链接
        </MenuItem>
        <MenuItem sx={{gap: 2, color: "#555"}} onClick={() => handleClose("UP_FILES")}>
          <FileUploadOutlinedIcon/> 上传 文件
        </MenuItem>
        <MenuItem sx={{gap: 2, color: "#555"}} onClick={() => handleClose("UD_Progress")}>
          <CloudSyncOutlinedIcon/> 上传、下载 的进度
        </MenuItem>
      </Menu>
    </Fragment>
  )
})

// 导航栏组件
const Navbar = React.memo(() => {
  const {paths, setPaths} = useSharedValues()

  const genNavbar = React.useMemo(() => paths.map((item, index) =>
    <Button key={index} color={index === paths.length - 1 ? "primary" : "inherit"}
            onClick={() => setPaths(prev => prev.slice(0, index + 1))}>
      {item === "." ? "Home" : item}
    </Button>
  ), [paths, setPaths])

  return (
    <Stack>
      <Stack direction={"row"} justifyContent={"space-between"}>
        <Breadcrumbs>{genNavbar}</Breadcrumbs>

        <Menus/>
      </Stack>
      <Divider component={"li"}/>
    </Stack>
  )
})

// 文件上传状态的组件
const FilesStatus = React.memo(() => {
  const {fStatusOpen, setFStatusOpen, filesStatus} = useSharedValues()

  const getSeverity = (status: boolean | string) => status === true ? "success" :
    status === false ? "info" : "error"

  const getContent = (name: string, status: boolean | string) => status === true ? `"${name}" 上传成功` :
    status === false ? `"${name}" 正在上传…` : `"${name}" 上传出错：${status}`

  return (
    <Drawer anchor={"top"} open={fStatusOpen} onClose={() => setFStatusOpen(false)}>
      <Stack divider={<Divider/>}>
        <Typography padding={"10px 16px"} margin={"auto"} color={"#1976d2"}>文件状态</Typography>
        {
          filesStatus.map((item, index) =>
            <Alert key={index} severity={getSeverity(item.status)}>
              {getContent(item.name, item.status)}
            </Alert>)
        }
      </Stack>
    </Drawer>
  )
})

// 下载文件
const onDownloadFile = async (name: string, path: string) => {
  // 通过 Nginx 下载文件
  window.open(`/downloads/${path}`, "_blank")
}

// 删除文件
const onDelFile = (
  name: string,
  path: string,
  setPaths: React.Dispatch<React.SetStateAction<Array<string>>>,
  showSb: (ps: DoSnackbarProps) => void,
  showDialog: (ps: DoDialogProps) => void
) => showDialog({
  open: true,
  title: "确定删除文件",
  message: `"${name}"`,
  btnCancel: {text: "取消", onClick: () => showDialog({open: false})},
  btnOK: {
    text: "确定删除",
    props: {color: "warning"},
    onClick: async () => {
      showDialog({open: false})

      let data = `path=${encodeURIComponent(path)}`
      let obj = await reqJSON<Array<FileInfo>>("/api/file/del", data, showSb)
      if (!obj || obj.code !== 0) {
        return
      }

      // 删除成功，更新界面
      console.log(TAG, `已删除文件"${name}"`)
      setPaths(prev => [...prev])
      showSb({open: true, message: `已删除文件"${name}"`, severity: "success"})
    }
  }
})

const onSendTerabox = async (name: string, path: string, showSb: (ps: DoSnackbarProps) => void,) => {
  showSb({open: true, message: `开始发送文件"${name}"`, severity: "info"})

  let data = `path=${encodeURIComponent(path)}`
  let obj = await reqJSON<string>("/api/file/send/terabox", data, showSb)
  if (!obj || obj.code !== 0) {
    return
  }

  // 发送成功
  console.log(TAG, `发送文件成功"${name}"`)
  showSb({open: true, message: `发送文件成功"${name}"`, severity: "success"})
}

const onSendVideoToTG = async (name: string, path: string, showSb: (ps: DoSnackbarProps) => void,) => {
  showSb({open: true, message: `开始发送文件"${name}"`, severity: "info"})

  let data = `path=${encodeURIComponent(path)}`
  let obj = await reqJSON<string>("/api/file/send/tg", data, showSb)
  if (!obj || obj.code !== 0) {
    return
  }

  // 已提交发送任务
  console.log(TAG, obj.msg, name)
  showSb({open: true, message: `${obj.msg}：${name}}`, severity: "info"})
}

// 文件列表项
const FItem = React.memo((props: { file: FileInfo }) => {
  // 导航栏路径
  const {paths, setPaths} = useSharedValues()
  // 共享 Snackbar
  const {showSb} = useSharedSnackbar()
  // 对话框共享
  const {showDialog} = useSharedDialog()

  return (
    <ListItem divider sx={{padding: 0}}>
      <ListItemButton onClick={() => props.file.isDir ? setPaths(prev => [...prev, props.file.name]) :
        onDownloadFile(props.file.name, `${paths.join("/")}/${props.file.name}`)
      }>
        <ListItemAvatar>
          <Avatar>{props.file.isDir ? <FolderOutlinedIcon/> : <FileOutlinedIcon/>}</Avatar>
        </ListItemAvatar>

        <ListItemText primary={props.file.name} sx={{wordBreak: "break-all"}} secondary={
          <span className={"row"} style={{gap: "16px"}}><span>{props.file.last}</span>
            {!props.file.isDir && <span>{props.file.size}</span>}
          </span>}
        />
      </ListItemButton>

      <IconButton title={"上传视频到 TG"} onClick={() =>
        onSendVideoToTG(props.file.name, `${paths.join("/")}/${props.file.name}`, showSb)}>
        <CloudUploadOutlinedIcon opacity={0.5}/>
      </IconButton>

      <IconButton title={"删除"} onClick={() =>
        onDelFile(props.file.name, `${paths.join("/")}/${props.file.name}`, setPaths, showSb, showDialog)}>
        <CloseOutlinedIcon opacity={0.5}/>
      </IconButton>
    </ListItem>
  )
})

// 文件列表组件
const FList = React.memo(() => {
  // 当前目录的文件列表，用于渲染界面
  const [files, setFiles] = useState<FileInfo[]>([])

  // 共享当前导航路径
  const {paths} = useSharedValues()

  // 共享 Snackbar
  const {showSb} = useSharedSnackbar()

  // 获取
  const obtain = React.useCallback(async (dst: string[]) => {
    let path = dst.join("/")
    console.log(TAG, `读取路径 "${path}"`)

    path = `/api/file/list?path=${encodeURIComponent(path)}`
    let obj = await reqJSON<FileInfo[]>(path, undefined, showSb)
    if (!obj || obj.code !== 0) {
      return
    }

    setFiles(obj.data)
  }, [showSb])

  const filesList = React.useMemo(() => {
    return files.map((f, i) => <FItem key={i} file={f}/>)
  }, [files])

  // 获取文件列表
  useEffect(() => {
    // 执行
    obtain(paths)
  }, [paths, obtain, showSb])

  return (
    <List sx={sxScroll}>{filesList}</List>
  )
})

// 文件管理组件
const FServer = React.memo(() => {
  // 文件上传状态
  const {setPaths, filesStatus, setFilesStatus} = useSharedValues()

  // 共享 Snackbar
  const {showSb} = useSharedSnackbar()

  const handleUpload = React.useCallback((name: string) => setFilesStatus(prev => {
      showSb({open: true, severity: "info", message: `开始上传 "${name}"...`})
      // 在上传列表中增加文件
      let newStatus = [...prev]
      let index = newStatus.findIndex(item => item.name === name)
      // 不存在时，直接追加新上传文件的状态
      if (index === -1) {
        return [...prev, {name: name, status: false}]
      }
      // 已存在时，提取到后面，并设置其上传状态为未完成
      let current = newStatus.splice(index, 1)
      current[0].status = false
      return [...newStatus, ...current]
    }),
    [setFilesStatus, showSb])

  const handleFinish = React.useCallback((name: string, err?: Error) => {
      // 文件上传成功、失败的处理
      const msg = `上传文件"${name}" ` + (err ? `失败：${err.toString()}` : "成功")
      console.log(TAG, msg)

      setPaths(prev => [...prev])
      showSb({
        open: true,
        message: msg,
        severity: err ? "error" : "success",
        autoHideDuration: err ? undefined : 3000
      })

      let newStatus = [...filesStatus]
      let index = newStatus.findIndex(item => item.name === name)
      if (index === -1) {
        console.log(TAG, `无法改变文件"${name}"的上传状态，找不到索引`, newStatus)
        return
      }
      newStatus[index].status = err ? err.toString() : true
      setFilesStatus(newStatus)
    },
    [showSb, setPaths, setFilesStatus, filesStatus])

  useEffect(() => {
    document.title = "文件管理"
  }, [])

  return (
    <Stack className={"main"} sx={sxBG}>
      <Navbar/>
      <FList/>
      <DoFileUpload id={"UP_FILES"} apiURL={"/api/file/upload"} headers={getHeaders()} onUpload={handleUpload}
                    onFinish={handleFinish}/>
      <FilesStatus/>
    </Stack>
  )
})

export default FServer