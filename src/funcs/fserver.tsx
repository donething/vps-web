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
  MenuItem, Skeleton,
  Stack,
  SvgIcon,
  SxProps,
} from "@mui/material"
import React, {Fragment, useEffect, useState} from "react"
import {useBetween} from "use-between"
import {FileInfo} from "../comm/typedef"
import {LS_Trans_KEY} from "./settings"
import {SnackbarMsg, useSnackbar} from "../components/snackbar"
import FolderOutlinedIcon from '@mui/icons-material/FolderOpenOutlined'
import FileOutlinedIcon from '@mui/icons-material/FileOpenOutlined'
import {DialogMsg, useDialog} from "../components/dialog"
import {ReactComponent as IconNginx} from "../icons/nginx.svg"
import {ReactComponent as IconLink} from "../icons/link.svg"
import {ReactComponent as IconMagnet} from "../icons/magnet.svg"
import FileUploadOutlinedIcon from '@mui/icons-material/FileUploadOutlined'
import CloudSyncOutlinedIcon from '@mui/icons-material/CloudSyncOutlined'
import FilesUpload from "../components/files_upload"
import {HighlightOffOutlined} from "@mui/icons-material"
import {genAuthHeaders, getJSON} from "../comm/comm"

// 标签
const TAG = "[FServer]"

// 共享
const useValues = () => {
  // 当前路径
  const [paths, setPaths] = useState<Array<string>>(["."])

  // 当前目录的文件列表，用于渲染界面
  const [files, setFiles] = useState<Array<FileInfo>>([])

  // 文件上传状态的开关
  const [fStatusOpen, setFStatusOpen] = useState(false)

  // 文件上传状态的信息列表
  const [filesStatus, setFilesStatus] = useState<Array<UpStatusType>>([])

  // 上传文件的验证请求头
  const [headers, setHeaders] = useState(new Headers({}))

  return {
    paths,
    setPaths,
    files,
    setFiles,
    fStatusOpen,
    setFStatusOpen,
    filesStatus,
    setFilesStatus,
    headers,
    setHeaders
  }
}

// 共享
const useSharedValues = () => useBetween(useValues)

// 菜单
const Menus = () => {
  // 是否显示菜单列表
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null)

  // 共享 显示上传状态组件
  const {setFStatusOpen, setHeaders} = useSharedValues()

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
        window.open(localStorage.getItem(LS_Trans_KEY) || "", "_blank")
        break
      case "UP_FILES":
        setHeaders(await genAuthHeaders());
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
}

// 导航栏组件
const Navbar = () => {
  const {paths, setPaths} = useSharedValues()

  return (
    <Stack>
      <Stack direction={"row"} justifyContent={"space-between"}>
        <Breadcrumbs>
          {paths.map((item, index) =>
            <Button key={index} color={index === paths.length - 1 ? "primary" : "inherit"}
                    onClick={() => setPaths(prev => prev.slice(0, index + 1))}>
              {item === "." ? "Home" : item}
            </Button>
          )}
        </Breadcrumbs>

        <Menus/>
      </Stack>
      <Divider component={"li"}/>
    </Stack>
  )
}

// 文件上传状态的类型
class UpStatusType {
  name: string = ""
  status: boolean | string = false
}

// 文件上传状态的组件
const FilesStatus = () => {
  const {fStatusOpen, setFStatusOpen, filesStatus} = useSharedValues()

  const getSeverity = (status: boolean | string) => status === true ? "success" :
    status === false ? "info" : "error"
  const getContent = (name: string, status: boolean | string) => status === true ? `"${name}" 上传成功` :
    status === false ? `"${name}" 正在上传…` : `"${name}" 上传出错：${status}`

  return (
    <Drawer anchor={"top"} open={fStatusOpen}
            onClose={() => setFStatusOpen(false)}>
      <Stack divider={<Divider/>}>
        <div style={{padding: "10px 16px", margin: "auto"}}>上传文件的状态</div>
        {
          filesStatus.map((item, index) =>
            <Alert key={index} severity={getSeverity(item.status)}>
              {getContent(item.name, item.status)}
            </Alert>)
        }
      </Stack>
    </Drawer>
  )
}

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
  setSbMsg: React.Dispatch<React.SetStateAction<SnackbarMsg>>,
  setDialogMsg: React.Dispatch<React.SetStateAction<DialogMsg>>
) => setDialogMsg({
  open: true,
  title: "确定删除文件",
  message: `"${name}"`,
  onCancel: () => setDialogMsg(prev => ({...prev, open: false})),
  onOK: async () => {
    setDialogMsg(prev => ({...prev, open: false}))

    // 授权验证码
    let data = `path=${encodeURIComponent(path)}`
    let obj = await getJSON<Array<FileInfo>>("/api/file/del", data, setSbMsg)
    if (!obj) return

    // 删除失败
    if (obj.code !== 0) {
      console.log(TAG, "删除文件失败：", obj?.msg)
      setSbMsg(prev => ({
        ...prev,
        open: true,
        message: `删除文件失败：${obj?.msg}`,
        severity: "error",
        autoHideDuration: undefined,
        onClose: () => console.log("")
      }))
      return
    }

    // 删除成功，更新界面
    console.log(TAG, `已删除文件"${name}"`)
    setPaths(prev => [...prev])
    setSbMsg(prev => ({
      ...prev,
      open: true,
      message: `已删除文件"${name}"`,
      severity: "success"
    }))
  }
})

// 文件列表项
const FItem = (props: { file: FileInfo }) => {
  // 导航栏路径
  const {paths, setPaths} = useSharedValues()
  // 共享 Snackbar
  const {setSbMsg} = useBetween(useSnackbar)
  // 对话框共享
  const {setDialogMsg} = useBetween(useDialog)

  return (
    <ListItem divider sx={{padding: 0}}>
      <ListItemButton onClick={() => props.file.is_dir ? setPaths(prev => [...prev, props.file.name]) :
        onDownloadFile(props.file.name, `${paths.join("/")}/${props.file.name}`)
      }>
        <ListItemAvatar>
          <Avatar>{props.file.is_dir ? <FolderOutlinedIcon/> : <FileOutlinedIcon/>}</Avatar>
        </ListItemAvatar>

        <ListItemText primary={props.file.name} sx={{wordBreak: "break-all"}} secondary={
          <span className={"row"} style={{gap: "16px"}}><span>{props.file.last}</span>
            {!props.file.is_dir && <span>{props.file.size}</span>}
          </span>}
        />
      </ListItemButton>

      <IconButton onClick={() =>
        onDelFile(props.file.name, `${paths.join("/")}/${props.file.name}`, setPaths, setSbMsg, setDialogMsg)}>
        <HighlightOffOutlined/>
      </IconButton>
    </ListItem>
  )
}

// 文件列表组件
const FList = (props: { sx?: SxProps }) => {
  // 共享当前导航路径
  const {paths, files, setFiles} = useSharedValues()
  // 共享 Snackbar
  const {setSbMsg} = useBetween(useSnackbar)

  // 获取
  const obtain = async () => {
    let path = paths.join('/')
    console.log(TAG, `读取路径 "${path}"`)
    path = `/api/file/list?path=${encodeURIComponent(path)}`
    let obj = await getJSON<Array<FileInfo>>(path, undefined, setSbMsg)
    if (!obj) return

    // 获取失败
    if (obj.code !== 0) {
      console.log(TAG, "读取路径失败：", obj.msg)
      setSbMsg(prev => ({
        ...prev,
        open: true,
        message: `读取路径失败：${obj?.msg}`,
        severity: "error",
        autoHideDuration: undefined,
        onClose: () => console.log("")
      }))
      return
    }

    setFiles(obj.data)
  }

  // 获取文件列表
  useEffect(() => {
    // 执行
    obtain()
  }, [paths])

  return (
    files.length === 0 ?
      <Skeleton animation={"wave"} sx={{height: 30}}/> :
      <List sx={{...props.sx}}>{files.map((f, i) => <FItem key={i} file={f}/>)}</List>
  )
}

// 文件管理组件
const FServer = () => {
  // 文件上传状态
  const {setPaths, filesStatus, setFilesStatus, headers} = useSharedValues()
  // 共享 Snackbar
  const {setSbMsg} = useBetween(useSnackbar)


  useEffect(() => {
    document.title = "文件管理"
  }, [])

  return (
    <Stack className={"main"} sx={{bgcolor: "background.paper", height: "100%", overflowY: "hidden"}}>
      <Navbar/>

      <FList sx={{overflowY: "auto"}}/>

      <FilesUpload id={"UP_FILES"} apiURL={"/api/file/upload"} headers={headers}
                   onUpload={name => setFilesStatus(prev => {
                     setSbMsg({open: true, severity: "info", message: `开始上传 "${name}"...`})
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
                   })}

                   onFinish={(name, err) => {
                     // 文件上传成功、失败的处理
                     const msg = `上传文件"${name}" ` + (err ? `失败：${err.toString()}` : "成功")
                     console.log(TAG, msg)

                     setPaths(prev => [...prev])
                     setSbMsg(prev => ({
                       ...prev,
                       open: true,
                       message: msg,
                       severity: err ? "error" : "success",
                       autoHideDuration: err ? undefined : 6000,
                       onClose: err ? () => console.log("") : undefined
                     }))

                     let newStatus = [...filesStatus]
                     let index = newStatus.findIndex(item => item.name === name)
                     if (index === -1) {
                       console.log(TAG, `无法改变文件"${name}"的上传状态，找不到索引`, newStatus)
                       return
                     }
                     newStatus[index].status = err ? err.toString() : true
                     setFilesStatus(newStatus)
                   }}/>
      <FilesStatus/>
    </Stack>
  )
}

export default FServer