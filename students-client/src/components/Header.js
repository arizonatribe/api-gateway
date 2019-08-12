import React from 'react';
import styled from 'styled-components';
import ruddy from './ruddy.jpg';

const AppHeader = styled.header`
  display: grid;
  width: 100%;
  grid-template-columns: auto 1fr;
  justify-items: center;
  align-items: flex-start;
  align-content: flex-end;
  background: white;
  height: 117px;
  padding: 10px

  & h1 {
    font-face: Helvetica;
    color: gray;
  }
`;

const HeaderLogo = styled.img`
  display: block;
  height: 101px
`;

function Header(props) {
  return (
    <AppHeader {...props}>
      <HeaderLogo src={ruddy} alt="ruddy duck" />
      <h1>Some Arizona University Student Contact List (demo)</h1>
    </AppHeader>
  );
}

export default Header;
