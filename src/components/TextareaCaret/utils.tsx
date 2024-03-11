import { TextAreaRef } from "antd/es/input/TextArea";

export const getCursorPosition = (ctrl: TextAreaRef) => {
  const CaretPos = { start: 0, end: 0 };
  if (ctrl?.resizableTextArea?.textArea.selectionStart) {
    CaretPos.start = ctrl?.resizableTextArea?.textArea.selectionStart;
  }
  if (ctrl?.resizableTextArea?.textArea.selectionEnd) {
    CaretPos.end = ctrl?.resizableTextArea?.textArea.selectionEnd;
  }
  return CaretPos;
};

export const setCursorPosition = (ctrl: TextAreaRef, start: number, end: number) => {
  const newCtrl = ctrl;
  if (newCtrl?.resizableTextArea?.textArea.selectionStart) {
    newCtrl.resizableTextArea.textArea.selectionStart = start;
  }
  if (newCtrl?.resizableTextArea?.textArea.selectionEnd) {
    newCtrl.resizableTextArea.textArea.selectionEnd = end;
  }
};
