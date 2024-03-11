import { useCallback, useState } from 'react';
import { COPY_ATTR_TYPE } from './constant';

const initCoods = {x: 0, y: 0}

const initFunc = () => {};

export default function useTextareaCaretPosition(textArea: HTMLTextAreaElement): {
  coods: {
    x: number;
    y: number;
  };
  getCaretCoods: () => void;
} {
  const [coods, setCoods] = useState<{ x: number; y: number }>(initCoods);

  const createCopy = useCallback(() => {
    const copy = document.createElement('div');
    copy.textContent = textArea?.value;
    const style = getComputedStyle(textArea);
    COPY_ATTR_TYPE.forEach((key) => {
      copy.style[key] = style[key];
    });
    copy.style.overflow = 'auto';
    copy.style.width = `${textArea?.offsetWidth ?? 0}px`;
    copy.style.height = `${textArea?.offsetHeight ?? 0}px`;
    copy.style.position = 'absolute';
    copy.style.left = `${textArea?.offsetLeft ?? 0}px`;
    copy.style.top = `${textArea?.offsetTop ?? 0}px`;
    copy.style.zIndex = '-1000';
    document.body.appendChild(copy);
    return copy;
  }, [textArea]);

  const getCaretCoods = useCallback(() => {
    if (!textArea) {
      return;
    }

    const newTextarea = textArea;
    const start = newTextarea?.selectionStart;
    const end = newTextarea?.selectionEnd;
    const copy = createCopy();
    const range = document.createRange();
    if (!copy.firstChild) {
      document.body.removeChild(copy);
      setCoods(initCoods);
      return;
    }
    range.setStart(copy.firstChild, start);
    range.setEnd(copy.firstChild, end);
    const selection = document.getSelection();
    selection?.removeAllRanges();
    selection?.addRange(range);
    const rect = range.getBoundingClientRect();
    document.body.removeChild(copy);
    newTextarea.selectionStart = start;
    newTextarea.selectionEnd = end;
    newTextarea.focus();

    setCoods({
      x: rect?.left - newTextarea?.scrollLeft,
      y: rect?.top - newTextarea?.scrollTop,
    });
  }, [createCopy, textArea]);

  return { coods, getCaretCoods: textArea ? getCaretCoods : initFunc };
}
