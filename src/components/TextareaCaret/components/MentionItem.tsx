import { useMemo } from 'react';
import { NINE_NUM } from '../constant';
import { StyledItem } from '../styled';
import { TTreeDataItem } from '../mock';

type TMentionItemProps = {
  selectId?: string;
  itemIndex?: number;
  onSelectMentionItem?: (item: TTreeDataItem) => void;
  datasource?: TTreeDataItem & { index: number }
}

export default function MentionItem({ datasource, selectId, onSelectMentionItem }: TMentionItemProps) {
  const {
    code, groupName, content, index, id,
  } = datasource || {};
  const i = useMemo(() => {
    if (Number(index) < NINE_NUM) {
      return Number(index) + 1;
    }

    if (Number(index) === NINE_NUM) {
      return 0;
    }

    return undefined;
  }, [index]);

  return (
    <StyledItem
      onMouseDown={(e) => {
        e.preventDefault();
        onSelectMentionItem?.(datasource as TTreeDataItem);
      }}
      selected={id === selectId}
    >
      <span>{groupName}</span>
      <span>{i !== undefined ? `${i}.` : code}</span>
      <span>{i === undefined ? '' : code}</span>
      <span>{content}</span>
    </StyledItem>
  );
}
