import {
  Avatar,
  Box,
  Breadcrumbs,
  Button,
  Divider,
  IconButton,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText, SpeedDial, SpeedDialAction, SpeedDialActionProps, SpeedDialIcon, SvgIcon, SxProps,
} from "@mui/material"
import React, {useEffect, useState} from "react"
import {useBetween} from "use-between"
import {FileInfo, JResult} from "../comm/typedef"
import {request} from "do-utils"
import {LS_AUTH_KEY, LS_Trans_KEY} from "./settings"
import {useSnackbar} from "../components/snackbar"
import HighlightOffOutlinedIcon from '@mui/icons-material/HighlightOffOutlined'
import FolderOutlinedIcon from '@mui/icons-material/FolderOpenOutlined'
import FileOutlinedIcon from '@mui/icons-material/FileOpenOutlined'
import {useDialog} from "../components/dialog"
import {ReactComponent as IconNginx} from "../icons/nginx.svg"
import {ReactComponent as IconLink} from "../icons/link.svg"
import {ReactComponent as IconMagnet} from "../icons/magnet.svg"
import {ReactComponent as IconProcess} from "../icons/process.svg"
import {ReactComponent as IconStatus} from "../icons/status.svg"
import FileUploadOutlinedIcon from '@mui/icons-material/FileUploadOutlined'
import CloudSyncOutlinedIcon from '@mui/icons-material/CloudSyncOutlined'
import VisibilityOffOutlinedIcon from '@mui/icons-material/VisibilityOffOutlined'

// 标签
const TAG = "[FServer]"

// 授权验证码
const headers = {"Authorization": localStorage.getItem(LS_AUTH_KEY) || ""}

// 导航栏的路径，共享
const useNavbarPath = () => {
  const [paths, setPaths] = useState<Array<string>>(["."])

  return {paths, setPaths}
}

// 导航栏
const Navbar = () => {
  const {paths, setPaths} = useBetween(useNavbarPath)

  return (
    <Box>
      <Breadcrumbs>
        {paths.map((item, index) =>
          <Button key={index} color={index === paths.length - 1 ? "primary" : "inherit"}
                  sx={{textTransform: "none"}}
                  onClick={() => setPaths(prev => prev.slice(0, index + 1))}>
            {item === "." ? "Home" : item}
          </Button>
        )}
      </Breadcrumbs>
      <Divider component={"li"}/>
    </Box>
  )
}

// 文件列表项
const FItem = (props: { file: FileInfo }) => {
  // 导航栏路径
  const {paths, setPaths} = useBetween(useNavbarPath)
  // 共享 Snackbar
  const {setSbMsg} = useBetween(useSnackbar)
  // 对话框共享
  const {setDialogMsg} = useBetween(useDialog)

  return (
    <ListItem className="hoverable" divider>
      <ListItemAvatar>
        <Avatar>
          {props.file.is_dir ? <FolderOutlinedIcon/> : <FileOutlinedIcon/>}
        </Avatar>
      </ListItemAvatar>

      <ListItemText primary={props.file.name}
                    secondary={<span className={"row"} style={{gap: 20}}>
        <span>{props.file.last}</span>
        <span>{props.file.size}</span>
      </span>} onClick={async () => {
        if (props.file.is_dir) {
          // 打开目录
          setPaths(prev => [...prev, props.file.name])
        } else {
          // 下载文件
          // window.open(`/downloads/${paths.join("/")}/${props.file.name}`, "target")
          let enPath = encodeURIComponent(`${paths.join("/")}/${props.file.name}`)
          let resp = await request(`/api/file/download?path=${enPath}`,
            undefined, {headers: headers})

          let objectUrl = window.URL.createObjectURL(await resp.blob())
          let anchor = document.createElement("a")
          document.body.appendChild(anchor)
          anchor.href = objectUrl
          anchor.download = props.file.name
          anchor.click()

          anchor.remove()
          window.URL.revokeObjectURL(objectUrl)
        }
      }}/>

      <IconButton onClick={() => setDialogMsg({
        open: true,
        title: "确定删除文件",
        message: `"${props.file.name}"`,
        onCancel: () => setDialogMsg(prev => ({...prev, open: false})),
        onOK: async () => {
          setDialogMsg(prev => ({...prev, open: false}))

          let data = `path=${encodeURIComponent(`${paths.join("/")}/${props.file.name}`)}`
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
          setPaths(prev => [...prev])

          console.log(TAG, `文件删除成功："${props.file.name}"`)
          setSbMsg(prev => ({
            ...prev,
            open: true,
            message: `文件删除成功："${props.file.name}"}`,
            severity: "success"
          }))
        }
      })}><HighlightOffOutlinedIcon/></IconButton>
    </ListItem>
  )
}

// 文件列表
const FList = (props: { sx?: SxProps }) => {
  // 当前目录的文件列表，用于渲染界面
  const [files, setFiles] = useState<Array<FileInfo>>([])
  // 当前导航路径
  const {paths} = useBetween(useNavbarPath)

  // 共享 Snackbar
  const {setSbMsg} = useBetween(useSnackbar)

  // 获取文件列表
  useEffect(() => {
    // 获取
    const obtain = async () => {
      console.log(TAG, `读取路径 "${paths.join('/')}"`)
      let resp = await request(`/api/file/list?path=${encodeURIComponent(paths.join("/"))}`,
        undefined, {headers: headers})
      let obj: JResult<Array<FileInfo>> = await resp.json().catch(e => console.log("获取文件列表出错：", e))
      // 获取失败
      if (!obj || obj.code !== 0) {
        console.log(TAG, "获取文件列表失败：", obj?.msg || `服务端响应码 ${resp.status}`)
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
    }

    // 执行
    obtain()
  }, [paths])

  return (
    <List sx={{...props.sx}}>
      {files.map((f, i) => <FItem key={i} file={f}/>)}
    </List>
  )
}

// SpeedDial 的图标
const actions = [
  {icon: <SvgIcon component={IconLink} viewBox="0 0 1024 1024"/>, name: "DL_Link", tips: "下载普通链接文件"},
  {icon: <SvgIcon component={IconMagnet} viewBox="0 0 1024 1024"/>, name: "DL_Magnet", tips: "下载磁力链接文件"},
  {icon: <SvgIcon component={IconNginx} viewBox="0 0 1024 1024"/>, name: "Nginx", tips: "打开 Nginx 目录"},
  {icon: <CloudSyncOutlinedIcon/>, name: "UD_Progress", tips: "上传、下载文件的进度"}
]
// 处理 SpeedDial 的选择
const onSpeedDialAction = (name: string) => {
  switch (name) {
    case "Nginx":
      window.open("/downloads", "_blank")
      break
    case "DL_Link":
      window.open("/ariang", "_blank")
      break
    case "DL_Magnet":
      window.open(localStorage.getItem(LS_Trans_KEY) || "", "_blank")
      break
    case "UD_Progress":
      alert("上传文件的进度")
      break
    default:
      alert(`未知的拨号行为：${name}`)
      console.log(TAG, "未知的拨号行为：", name)
  }
}

interface UploadActionType extends SpeedDialActionProps {
  onChoose?: (files: FileList | null) => void
}

/**
 * 文件上传组件（仅限 Speed Dial）
 *
 * 默认点击不触发文件上传选择框，只好通过极客方式触发：document.querySelector("#id").click()
 * @param props 不能删除，渲染时上级组件会传递参数，另有 onChange 选择文件后的回调，参数为已选择的文件列表
 * @see https://stackoverflow.com/a/64837684
 */
const UploadSpeedDialAction = (props: UploadActionType) => {
  // 文件上传选择框的 ID，用于手动弹出
  const id = "do-upload-file"

  // SpeedDialActionProps 中没有手动添加的 onChoose 属性，通过 {...props} 解构使用时，会提示忽略
  // 为了去除提示，先拷贝一份，并去掉该属性再使用
  let ps = {...props}
  let onChoose = ps.onChoose
  delete ps.onChoose

  return (
    <React.Fragment>
      <input accept="*" id={id} type="file" multiple hidden
             onChange={e => onChoose && onChoose(e.target.files)}/>
      <label htmlFor={id}>
        <SpeedDialAction
          {...ps}
          key={id}
          icon={<FileUploadOutlinedIcon/>}
          onClick={() => (document.querySelector(`#${id}`) as HTMLElement)?.click()}
          tooltipTitle="上传文件"/>
      </label>
    </React.Fragment>
  )
}

// 快速拨号按钮
const FSSpeedDial = (props: { sx?: SxProps }) => {
  // 偶然需要隐藏快速拨号按钮
  const [hidden, setHidden] = useState(false)

  // 共享 Snackbar
  const {setSbMsg} = useBetween(useSnackbar)

  return (
    <SpeedDial hidden={hidden} ariaLabel="更多操作" sx={{...props.sx}} icon={<SpeedDialIcon/>}>
      {actions.map((action) => (
        <SpeedDialAction
          key={action.name}
          icon={action.icon}
          tooltipTitle={action.tips}
          onClick={() => onSpeedDialAction(action.name)}
        />
      ))}

      <UploadSpeedDialAction onChoose={async files => {
        if (!files) return
        for (let i = 0; i < files.length; i++) {
          let name = files[i].name
          let form = new FormData()
          form.append(name, files[i])
          let resp = await request("/api/file/upload", form, {headers: headers})
          let obj: JResult<{ [name: string]: string }> =
            await resp.json().catch(e => console.log(TAG, `文件"${name} 上传出错：`, e))

          // 网络出错
          if (!obj) {
            setSbMsg(prev => ({
              ...prev,
              open: true,
              message: `文件"${name}" 上传出错：服务端响应码 ${resp.status}`,
              severity: "error",
              autoHideDuration: undefined,
              onClose: () => console.log("已手动关闭 Snackbar")
            }))
            break
          }

          // 上传失败
          if (obj.code !== 0) {
            console.log(TAG, `文件"${name}" 上传失败：`, obj.data[name])
            setSbMsg(prev => ({
              ...prev,
              open: true,
              message: `文件"${name}" 上传失败：${obj.data[name]}`,
              severity: "error",
              autoHideDuration: undefined,
              onClose: () => console.log("已手动关闭 Snackbar")
            }))
            continue
          }

          // 上传成功
          console.log(TAG, `文件"${name}" 上传成功`)
          setSbMsg(prev => ({
            ...prev,
            open: true,
            message: `文件"${name}" 上传成功`,
            severity: "success"
          }))
        }
      }}/>

      <SpeedDialAction
        key={"Hide_Dial"}
        icon={<VisibilityOffOutlinedIcon/>}
        tooltipTitle={"暂时隐藏该面板"}
        onClick={() => {
          console.log(TAG, "暂时隐藏快速拨号面板")
          setHidden(true)
          setTimeout(() => setHidden(false), 3000)
        }}
      />
    </SpeedDial>
  )
}

// 文件管理组件
const FServer = () => {
  useEffect(() => {
    document.title = "文件管理器"
  }, [])

  return (
    <Box className="col" sx={{bgcolor: "background.paper", height: "100vh", overflowY: "hidden"}}>
      <Navbar/>
      <FList sx={{overflowY: "auto"}}/>
      <FSSpeedDial sx={{position: "absolute", bottom: 16, right: 16}}/>
    </Box>
  )
}

export default FServer