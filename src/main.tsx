import React from 'react'
import ReactDOM from 'react-dom/client'
import './index.css'
// import TextareaCaret from 'react-shortcut-phrase-textarea';
import TextareaCaret from './components/TextareaCaret';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <>
    <h2>这是一个用于快捷短语插入的输入文本框</h2>
    <TextareaCaret />
    </>
  </React.StrictMode>,
)
