import { Input } from 'antd';
import {
  LegacyRef,
  useCallback, useMemo, useRef, useState,
} from 'react';

import { cloneDeep } from 'lodash';
import { Virtuoso, VirtuosoHandle } from 'react-virtuoso';  
import useTextareaCaretPosition from './useTextareaCaretPosition';

import { StyledWrapper } from './styled';
import MentionItem from './components/MentionItem';

import { getCursorPosition, setCursorPosition } from './utils';

import {
  WIDTH,
  HEIGHT,
  OFFSET,
  ARROW_LEFT,
  ARROW_UP,
  ARROW_RIGHT,
  ARROW_DOWN,
  ENTER,
  NUMBER_KEY,
  NINE_NUM,
} from './constant';
import { TextAreaRef } from 'antd/es/input/TextArea';
import { TTreeDataItem } from './type';

type TSelectMentionProps = {
  triggerSymbol?: string;
  value?: string;
  treeData?: TTreeDataItem[];
  onChange?: (value?: string) =>void;
}

export default function SelectMention(props: TSelectMentionProps) {
  const { triggerSymbol = '/', onChange, value, treeData } = props;

  const textAreaRef = useRef<TextAreaRef>();
  const newTextArea = textAreaRef.current?.resizableTextArea?.textArea;

  const lockRef = useRef(false);
  const [textareaValue, setTextAreaValue] = useState(value || '');
  const [openWordsModal, setOpenWordsModal] = useState(false);
  const [selectMentionIndex, setSelectMentionIndex] = useState<number>(0);

  const [mentionOptions, setMentionOptions] = useState<TTreeDataItem[]>([]);
  const [replacePosition, setReplacePosition] = useState<number[]>([]);
  const virtuosoRef = useRef<VirtuosoHandle>(null);

  /** 记录当前输入的数字 用于快捷选择 */
  const cacheNumberRef = useRef<string | undefined>();

  const { coods, getCaretCoods } = useTextareaCaretPosition(newTextArea as HTMLTextAreaElement);

  const pos = useMemo(() => {
    if (!openWordsModal) {
      return { x: -WIDTH, y: -HEIGHT };
    }

    const { x, y } = coods;

    /** 简单的边界处理 */
    return {
      x:
        x + WIDTH + OFFSET > document.body.offsetWidth
          ? document.body.offsetWidth - WIDTH
          : x + OFFSET,
      y: y - HEIGHT <= 0 ? y + OFFSET : y - HEIGHT,
    };
  }, [coods, openWordsModal]);

  const onSelectMentionItem = useCallback(
    (item: TTreeDataItem) => {
      const str = textareaValue.substring(0, replacePosition[0] - 1)
        + item?.content
        + textareaValue.substring(replacePosition[1]);

      /** 设置光标位置 */
      const selectStartIndex = Number(item?.content?.length) + replacePosition?.[0] - 1;

      setTimeout(() => {
        textAreaRef?.current?.focus?.();
        setCursorPosition(textAreaRef?.current as HTMLTextAreaElement, selectStartIndex, selectStartIndex);
      }, 200);

      setTextAreaValue(str);
      onChange?.(str);
      setOpenWordsModal(false);
      setSelectMentionIndex(0);
      setReplacePosition([]);
      cacheNumberRef.current = undefined;
    },
    [onChange, replacePosition, textareaValue],
  );

  const filterMentionOptions = useCallback(
    ({ tagetText = '', replaceIndex }: { tagetText?: string; replaceIndex?: number[] }) => {
      let newData = cloneDeep(treeData) || [];
      newData = newData
        ?.filter((t) => t?.code?.includes(tagetText) || t?.content?.includes(tagetText))
        ?.map((t, index) => ({ ...t, index: index > NINE_NUM ? undefined : index }));

      /** 触发快捷选择 */
      if (cacheNumberRef?.current !== undefined && !newData?.length) {
        const index = Number(cacheNumberRef?.current) === 0
          ? NINE_NUM : Number(cacheNumberRef?.current) - 1;
        if (mentionOptions?.[index]) {
          onSelectMentionItem(mentionOptions?.[index]);
          return;
        }
      }

      if (newData?.length > 0) {
        setOpenWordsModal(true);
      } else {
        setOpenWordsModal(false);
      }

      setMentionOptions(newData);
      setReplacePosition(replaceIndex || []);
    },
    [treeData, mentionOptions, onSelectMentionItem],
  );

  /**
   * 0、获取光标位置
   * 1、当直接输入 [triggerSymbol] 直接打开
   * 2、截取当前光标位置到光标前第一个 [triggerSymbol] 文字内容 如果没有就跳过，如果有走下面
   * 3、找到是否存在列表中的内容相匹配的，如果有就打开，如果没有就关闭
   * 4、如果命中快捷命令，替换内容并将快捷短语插入进来
   * 5、如果没有命中就去过滤，如果过滤为空数据，就关闭，否则
   */
  const handleRecordCursorPosition = useCallback(
    ({ inputValue, type }: { inputValue?: string; type?: string }) => {
      let replaceIndex;
      // 获取光标位置
      const position = getCursorPosition(textAreaRef.current as HTMLTextAreaElement);
      const { start, end } = position;

      // 当直接输入 [triggerSymbol] 直接打开
      if (type === 'trigger') {
        getCaretCoods();
        replaceIndex = [start, end];
        filterMentionOptions({ replaceIndex });
        return;
      }

      if (!inputValue) {
        setSelectMentionIndex(0);
        setOpenWordsModal(false);
        return;
      }

      // 截取当前光标位置到光标前第一个 [triggerSymbol] 文字内容
      let tagetText = inputValue?.slice(0, start);
      tagetText = tagetText?.split('')?.reverse()?.join('');
      const beforePosition = tagetText?.indexOf(triggerSymbol);

      if (beforePosition === -1) {
        setSelectMentionIndex(0);
        setOpenWordsModal(false);
        return;
      }

      // 用于替换文本使用
      replaceIndex = [start - beforePosition, end];

      tagetText = tagetText?.slice(0, beforePosition);
      tagetText = tagetText?.split('')?.reverse()?.join('');

      /** 走到这里就是要打开弹窗了 */
      filterMentionOptions({ tagetText, replaceIndex });
      getCaretCoods();
    },
    [filterMentionOptions, getCaretCoods, triggerSymbol],
  );

  const onTextareaChange = useCallback(
    (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      setTextAreaValue(e?.target?.value);
      onChange?.(e?.target?.value);
      if (!lockRef.current) {
        handleRecordCursorPosition({ inputValue: e?.target?.value, type: 'change' });
      }
    },
    [handleRecordCursorPosition, onChange],
  );

  /** 组词 */
  const handleComposition = useCallback(
    (e: React.CompositionEvent<HTMLTextAreaElement>) => {
      const { type } = e;
      if (type === 'compositionstart') {
        lockRef.current = true;
      }

      if (type === 'compositionend') {
        lockRef.current = false;
        handleRecordCursorPosition({ inputValue: (e?.target as HTMLTextAreaElement)?.value, type: 'compositionend' });
      }
    },
    [handleRecordCursorPosition],
  );

  const scrollToIndex = useCallback((index: number) => {
    virtuosoRef?.current?.scrollToIndex?.({
      index,
      align: 'center',
    });
  }, []);

  /** 汉语组词的时候 keyCode 是会变化的 使用key */
  const onKeyUp = useCallback(
    (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
      if (e?.key === triggerSymbol) {
        handleRecordCursorPosition({ type: 'trigger' });
      }

      if ([ARROW_LEFT, ARROW_RIGHT].includes(e?.keyCode) && !lockRef.current) {
        handleRecordCursorPosition({ inputValue: textareaValue, type: 'arrow' });
      }

      if ([ARROW_UP, ARROW_DOWN].includes(e?.keyCode) && !lockRef.current && !openWordsModal) {
        handleRecordCursorPosition({ inputValue: textareaValue, type: 'arrow' });
      }

      if ([ARROW_UP, ARROW_DOWN].includes(e?.keyCode) && !lockRef.current && openWordsModal) {
        let selectIndex = 0;
        if (e?.keyCode === ARROW_UP) {
          selectIndex = selectMentionIndex - 1
          >= 0 ? selectMentionIndex - 1 : mentionOptions?.length - 1;
        }

        if (e?.keyCode === ARROW_DOWN) {
          selectIndex = selectMentionIndex + 1
           >= mentionOptions?.length ? 0 : selectMentionIndex + 1;
        }
        setSelectMentionIndex(selectIndex);
        scrollToIndex(selectIndex);
      }

      if (e?.keyCode === ENTER && !lockRef.current && openWordsModal) {
        const str = textareaValue.substring(0, replacePosition[0] - 1)
          + mentionOptions[selectMentionIndex]?.content
          + textareaValue.substring(replacePosition[1]);

        /** 设置光标位置 */
        const selectStartIndex = Number(mentionOptions?.[selectMentionIndex]?.content?.length)
        + replacePosition?.[0] - 1;

        setTimeout(() => {
          textAreaRef?.current?.focus?.();
          setCursorPosition(textAreaRef?.current as HTMLTextAreaElement, selectStartIndex, selectStartIndex);
        }, 200);

        setTextAreaValue(str);
        onChange?.(str);
        setOpenWordsModal(false);
        setSelectMentionIndex(0);
        setReplacePosition([]);
      }
    },
    [
      handleRecordCursorPosition,
      mentionOptions,
      scrollToIndex,
      selectMentionIndex,
      openWordsModal,
      replacePosition,
      triggerSymbol,
      textareaValue,
      onChange,
    ],
  );

  const onClick = useCallback(() => {
    handleRecordCursorPosition({ inputValue: textareaValue, type: 'click' });
  }, [handleRecordCursorPosition, textareaValue]);

  const onBlur = useCallback(() => {
    setSelectMentionIndex(0);
    setOpenWordsModal(false);
  }, []);

  /** 弹窗打开非组词阶段时阻止上下键输入 用来选择快捷短语的 */
  const onKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
      if (
        openWordsModal
        && [ARROW_UP, ARROW_DOWN, ENTER].includes(e?.keyCode)
        && !lockRef.current
      ) {
        e.preventDefault();
      }

      /** 直接抛出某个选择项需满足
       * 1、满意列表过滤之后没有数据
       * 2、输入的数字是1-9并且再加上当前输入的数字是查不到的
       * 3、在过滤前是有的数组中 index 位置是有相对应的
       */
      if (NUMBER_KEY.includes(e?.key) && !lockRef.current && openWordsModal) {
        cacheNumberRef.current = e?.key;
      }
    },
    [openWordsModal],
  );

  return (
    <>
      <Input.TextArea
        autoSize={{ minRows: 4, maxRows: 4 }}
        onCompositionEnd={handleComposition}
        onCompositionStart={handleComposition}
        ref={textAreaRef as LegacyRef<TextAreaRef> | undefined}
        onChange={onTextareaChange}
        value={value || textareaValue}
        onBlur={onBlur}
        onKeyUp={onKeyUp}
        onKeyDown={onKeyDown}
        onClick={onClick}
        placeholder={`请输入内容 或 输入 “${triggerSymbol}” 插入快捷短语`}
      />

      {openWordsModal ? (
        <StyledWrapper
          style={{
            top: pos?.y ?? 0,
            left: pos?.x ?? 0,
          }}
        >
          <Virtuoso
            ref={virtuosoRef}
            data={mentionOptions}
            style={{ height: HEIGHT }}
            itemContent={(i, item) => (
              <MentionItem
                itemIndex={i}
                datasource={item as TTreeDataItem & { index: number }}
                onSelectMentionItem={onSelectMentionItem}
                selectId={mentionOptions?.[selectMentionIndex]?.id}
              />
            )}
          />
        </StyledWrapper>
      ) : null}
    </>
  );
}
