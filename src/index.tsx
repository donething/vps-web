import React from 'react'
import {createRoot} from 'react-dom/client'
import '@fontsource/roboto/300.css'
import '@fontsource/roboto/400.css'
import '@fontsource/roboto/500.css'
import '@fontsource/roboto/700.css'
import './comm/global.css'
import './index.css'
import reportWebVitals from './reportWebVitals'
import {HashRouter, Route, Routes} from "react-router-dom"
import App from "./App"
import Music from "./funcs/music/music"
import Settings from "./funcs/settings"
import FServer from "./funcs/fserver/fserver"
import Tasks from "./funcs/tasks"
import {ThemeProvider} from "@mui/material"
import theme from "./mytheme"
import Myrouter from "./funcs/myrouter"
import {DoSnackbar, DoDialog} from "do-comps"
import TGSender from "./funcs/tgsender/TGSender"
import Live from "./funcs/live/live"

const container = document.getElementById('root')
const root = createRoot(container!)

root.render(
  <React.StrictMode>
    <ThemeProvider theme={theme}>
      <DoSnackbar/>
      <DoDialog/>

      <HashRouter>
        <Routes>
          <Route path="/" element={<App/>}/>
          <Route path="/fserver" element={<FServer/>}/>
          <Route path="/music" element={<Music/>}/>
          <Route path="/router" element={<Myrouter/>}/>
          <Route path="/settings" element={<Settings/>}/>
          <Route path="/tasks" element={<Tasks/>}/>
          <Route path="/tgsender" element={<TGSender/>}/>
          <Route path="/live" element={<Live/>}/>

          <Route path="*" element={<App/>}/>
        </Routes>
      </HashRouter>
    </ThemeProvider>
  </React.StrictMode>
)

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals()
