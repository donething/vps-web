import React from 'react'
import ReactDOM from 'react-dom'
import '@fontsource/roboto/300.css'
import '@fontsource/roboto/400.css'
import '@fontsource/roboto/500.css'
import '@fontsource/roboto/700.css'
import './comm/global.css'
import './index.css'
import reportWebVitals from './reportWebVitals'
import {HashRouter, Route, Routes} from "react-router-dom"
import App from "./App"
import Music from "./funcs/music"
import Settings from "./funcs/settings"
import FServer from "./funcs/fserver"
import SnackbarComp from "./components/snackbar"
import DialogComp from "./components/dialog"
import BackdropComp from "./components/backdrop"
import Tasks from "./funcs/tasks"
import {styled, ThemeProvider} from "@mui/material"
import theme from "./mytheme"
import AppbarComp from "./components/appbar"

const Offset = styled("div")(({theme}) => theme.mixins.toolbar)

ReactDOM.render(
  <React.StrictMode>
    <ThemeProvider theme={theme}>
      <AppbarComp/>
      <Offset/>

      <HashRouter>
        <Routes>
          <Route path="/" element={<App/>}/>
          <Route path="/music" element={<Music/>}/>
          <Route path="/fserver" element={<FServer/>}/>
          <Route path="/tasks" element={<Tasks/>}/>
          <Route path="/settings" element={<Settings/>}/>
        </Routes>
      </HashRouter>

      <SnackbarComp/>
      <DialogComp/>
      <BackdropComp/>
    </ThemeProvider>
  </React.StrictMode>,
  document.getElementById('root')
)

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals()
