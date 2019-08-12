import uuid from 'uuid';
import React from 'react';
import styled from 'styled-components';
import icons from './icons';

const Button = styled.button`
  display: block;
  outline: none;
  cursor: pointer;
  padding: 0.4em 0.2em;
  background-color: #3c4d55;
  border: none;
  border-radius: 5px;

  & svg {
    fill: lightblue;
  }
`;

function IconButton({ iconName, ...restOfProps }) {
  const { width, height, viewBox = '0 0 0 0', paths = [] } = icons[iconName] || {};

  return (
    <Button type="button" {...restOfProps}>
      <svg viewBox={viewBox} width={restOfProps.width || width} height={restOfProps.height || height}>
        <g>{paths.map(p => <path key={uuid()} d={p} />)}</g>
      </svg>
    </Button>
  );
}

export default IconButton;
