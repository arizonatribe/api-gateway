import React, { Fragment } from 'react';
import styled from 'styled-components';
import Header from './components/Header';
import StudentList from './components/StudentList';
import Logo from './components/Logo';

const Main = styled.main`
  display: block;
  text-align: center;
  background-color: white;
`;

function App() {
  return (
    <Fragment>
      <Header />
      <Main>
        <Logo />
        <StudentList />
      </Main>
    </Fragment>
  );
}

export default App;
