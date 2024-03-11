import styled from 'styled-components';
import { WIDTH } from './constant';

export const StyledWrapper = styled.div`
${() => ({
    position: 'absolute',
    width: WIDTH,
    backgroundColor: '#fff',
    overflowY: 'auto',
    borderRadius: '4px',
    border: '1px solid #efefef',
    zIndex: '100',
    cursor: 'pointer',
  })}
`;

export const StyledItem = styled.div<React.CSSProperties & { selected?: boolean }>`
width: 100%;
height: 24px;
line-height: 24px;
display: flex;
background: ${({ selected }) => (selected ? '#e0e0e0' : '')};
box-sizing: border-box;
&:hover {
  background-color: #eee;
}
span {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  color: #aaa;
}
& > span:nth-of-type(1) {
  width: 36px;
  margin-left: 10px;
}
& > span:nth-of-type(2) {
  width: 36px;
  margin-left: 6px;
}
& > span:nth-of-type(3) {
  width: 100px;
  margin-left: 10px;
}
& > span:nth-of-type(4) {
  margin-left: 30px;
  width: 240px;
  color: #333;
  margin-right: 10px;
}
`;
