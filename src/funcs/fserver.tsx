import {
  Alert,
  Avatar,
  Breadcrumbs,
  Button,
  Divider,
  IconButton,
  List,
  ListItem,
  ListItemAvatar, ListItemButton,
  ListItemText,
  Menu,
  MenuItem,
  Stack,
  SvgIcon,
  SxProps,
} from "@mui/material"
import React, {Fragment, useEffect, useState} from "react"
import {useBetween} from "use-between"
import {FileInfo, JResult} from "../comm/typedef"
import {request} from "do-utils"
import {LS_AUTH_KEY, LS_Trans_KEY} from "./settings"
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
import {useBackdrop} from "../components/backdrop"
import DrawerComp, {DrawerMsg, useDrawer} from "../components/drawer"
import {HighlightOffOutlined} from "@mui/icons-material"

// 标签
const TAG = "[FServer]"

// 导航栏的路径，共享
const useNavbarPath = () => {
  const [paths, setPaths] = useState<Array<string>>(["."])

  return {paths, setPaths}
}

// 菜单
const Menus = () => {
  // 是否显示菜单列表
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null)

  // 共享 显示上传状态组件
  const {setDrawerMsg} = useBetween(useDrawer)

  // 点击了菜单弹出菜单列表
  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget)
  }
  // 点击率菜单列表项
  const handleClose = (action: string) => {
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
        (document.querySelector("#UP_FILES") as HTMLElement).click()
        break
      case "UD_Progress":
        setDrawerMsg(prev => ({...prev, open: true, anchor: "top"}))
        break
    }
  }

  return (
    <div>
      <Button color={"inherit"} onClick={handleClick}>菜单</Button>

      <Menu open={Boolean(anchorEl)} anchorEl={anchorEl} onClose={handleClose}>
        <MenuItem sx={{gap: 1}} onClick={() => handleClose("Nginx")}>
          <SvgIcon component={IconNginx} viewBox="0 0 1024 1024"/>打开 Nginx目录
        </MenuItem>
        <MenuItem sx={{gap: 1}} onClick={() => handleClose("DL_Link")}>
          <SvgIcon component={IconLink} viewBox="0 0 1024 1024"/> 下载 普通链接
        </MenuItem>
        <MenuItem sx={{gap: 1}} onClick={() => handleClose("DL_Magnet")}>
          <SvgIcon component={IconMagnet} viewBox="0 0 1024 1024"/> 下载 磁力链接
        </MenuItem>
        <MenuItem sx={{gap: 1}} onClick={() => handleClose("UP_FILES")}>
          <FileUploadOutlinedIcon/> 上传 文件
        </MenuItem>
        <MenuItem sx={{gap: 1}} onClick={() => handleClose("UD_Progress")}>
          <CloudSyncOutlinedIcon/> 上传、下载 的进度
        </MenuItem>
      </Menu>
    </div>
  )
}

// 导航栏组件
const Navbar = () => {
  const {paths, setPaths} = useBetween(useNavbarPath)

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

// 下载文件
const onDownloadFile = async (name: string, path: string) => {
  // 下载文件
  // window.open(`/downloads/${paths.join("/")}/${props.file.name}`, "target")
  // 授权验证码
  const headers = {"Authorization": localStorage.getItem(LS_AUTH_KEY) || ""}
  let enPath = encodeURIComponent(path)
  let resp = await request(`/api/file/download?path=${enPath}`,
    undefined, {headers: headers})

  let objectUrl = window.URL.createObjectURL(await resp.blob())
  let anchor = document.createElement("a")
  document.body.appendChild(anchor)
  anchor.href = objectUrl
  anchor.download = name
  anchor.click()

  anchor.remove()
  window.URL.revokeObjectURL(objectUrl)
}

// 删除文件
const onDelFile = (name: string, path: string,
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
    const headers = {"Authorization": localStorage.getItem(LS_AUTH_KEY) || ""}
    let data = `path=${encodeURIComponent(path)}`
    let resp = await request("/api/file/del", data, {headers: headers})
    let obj: JResult<Array<FileInfo>> = await resp.json()

    // 删除失败
    if (!obj || obj.code !== 0) {
      console.log(TAG, "文件删除失败：", obj?.msg || `服务端响应码 ${resp.status}`)
      setSbMsg(prev => ({
        ...prev,
        open: true,
        message: `文件删除失败：${obj?.msg || `服务端响应码 ${resp.status}`}`,
        severity: "error",
        autoHideDuration: undefined,
        onClose: () => console.log("已手动关闭 Snackbar")
      }))
      return
    }

    // 删除成功，更新界面
    console.log(TAG, `文件删除成功："${name}"`)
    setPaths(prev => [...prev])
    setSbMsg(prev => ({
      ...prev,
      open: true,
      message: `文件删除成功："${name}"`,
      severity: "success"
    }))
  }
})

// 文件列表项
const FItem = (props: { file: FileInfo }) => {
  // 导航栏路径
  const {paths, setPaths} = useBetween(useNavbarPath)
  // 共享 Snackbar
  const {setSbMsg} = useBetween(useSnackbar)
  // 对话框共享
  const {setDialogMsg} = useBetween(useDialog)

  return (
    <ListItem divider>
      <ListItemButton onClick={() => props.file.is_dir ?
        setPaths(prev => [...prev, props.file.name]) :
        onDownloadFile(props.file.name, `${paths.join("/")}/${props.file.name}`)
      }>
        <ListItemAvatar>
          <Avatar>{props.file.is_dir ? <FolderOutlinedIcon/> : <FileOutlinedIcon/>}</Avatar>
        </ListItemAvatar>

        <ListItemText primary={props.file.name} secondary={<span className={"row"} style={{gap: "16px"}}>
                        <span>{props.file.last}</span>
          {!props.file.is_dir && <span>{props.file.size}</span>}</span>}
        />
      </ListItemButton>

      <IconButton onClick={() =>
        onDelFile(props.file.name, `${paths.join("/")}/${props.file.name}`,
          setPaths, setSbMsg, setDialogMsg)}><HighlightOffOutlined/>
      </IconButton>
    </ListItem>
  )
}

// 文件列表组件
const FList = (props: { sx?: SxProps }) => {
  // 当前目录的文件列表，用于渲染界面
  const [files, setFiles] = useState<Array<FileInfo>>([])

  // 共享当前导航路径
  const {paths} = useBetween(useNavbarPath)
  // 共享 Snackbar
  const {setSbMsg} = useBetween(useSnackbar)
  // 共享 Backdrop
  const {setBackdropMsg} = useBetween(useBackdrop)

  // 获取文件列表
  useEffect(() => {
    // 获取
    const obtain = async () => {
      console.log(TAG, `读取路径 "${paths.join('/')}"`)
      setBackdropMsg(prev => ({...prev, bg: "transparent", open: true}))

      // 授权验证码
      const headers = {"Authorization": localStorage.getItem(LS_AUTH_KEY) || ""}
      let resp = await request(`/api/file/list?path=${encodeURIComponent(paths.join("/"))}`,
        undefined, {headers: headers})
      let obj: JResult<Array<FileInfo>> = await resp.json().catch(e => console.log("获取文件列表出错：", e))
      // 获取失败
      if (!obj || obj.code !== 0) {
        console.log(TAG, "获取文件列表失败：", obj?.msg || `服务端响应码 ${resp.status}`)
        setBackdropMsg(prev => ({...prev, open: false}))
        setSbMsg(prev => ({
          ...prev,
          open: true,
          message: `获取文件列表失败：${obj?.msg || `服务端响应码 ${resp.status}`}`,
          severity: "error",
          autoHideDuration: undefined,
          onClose: () => console.log("已手动关闭 Snackbar")
        }))
        return
      }

      setFiles(obj.data)
      setBackdropMsg(prev => ({...prev, open: false}))
    }

    // 执行
    obtain()
  }, [paths])

  return (
    <List sx={{...props.sx}}>{files.map((f, i) => <FItem key={i} file={f}/>)}</List>
  )
}

// 每完成一个文件后的回调
const onFileUpFinish = (name: string, err: Error | undefined,
                        setMsg: React.Dispatch<React.SetStateAction<DrawerMsg>>) => {
  let msg = (err ? <Alert severity="error">{`上传失败："${name}"`}</Alert> :
    <Alert severity="success">{`上传成功："${name}"`}</Alert>)

  setMsg(prev => ({
    ...prev,
    content: <Fragment>
      {prev.content}
      {msg}
    </Fragment>
  }))
}

// 文件管理组件
const FServer = () => {
  // 授权验证码
  const headers = {"Authorization": localStorage.getItem(LS_AUTH_KEY) || ""}

  // 共享文件上传状态
  const {setDrawerMsg} = useBetween(useDrawer)

  useEffect(() => {
    document.title = "文件管理"
  }, [])

  return (
    <Stack className={"main"} sx={{bgcolor: "background.paper", height: "100%", overflowY: "hidden"}}>
      <Navbar/>
      <FList sx={{overflowY: "auto"}}/>
      <FilesUpload id={"UP_FILES"} apiURL={"/api/file/upload"} headers={headers}
                   onFinish={(name, err) => onFileUpFinish(name, err, setDrawerMsg)}/>
      <DrawerComp/>
    </Stack>
  )
}

export default FServer