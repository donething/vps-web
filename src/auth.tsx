import {useNavigate} from "react-router-dom"
import React from "react"
import {LS_ACCESS_KEY} from "./funcs/settings"
import {request} from "do-utils"
import {JResult} from "./comm/typedef"

const TAG = "[Auth]"
const Auth = React.memo(() => {
  const navigate = useNavigate()

  const init = React.useCallback(async () => {
    const acc = localStorage.getItem(LS_ACCESS_KEY) || ""
    const resp = await request("/api/access/judge", `access=${acc}`)
    const json: JResult<any> = await resp.json()
    if (json.code !== 0) {
      console.log(TAG, json.msg)
      navigate("/settings")
      return
    }
  }, [navigate])

  React.useEffect(() => {
    init()
  }, [init])

  return (<></>)
})

export default Auth
