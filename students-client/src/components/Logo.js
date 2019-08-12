import React from 'react';
import styled, { keyframes } from 'styled-components';
import Backdrop from './Backdrop';
import canyonlands from './canyonlands.jpg';
import logo from './logo.svg';

const spinner = keyframes`
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}
`;

const AppLogo = styled.img`
  animation: ${spinner} infinite 20s linear;
  height: 40vmin;
  pointer-events: none;
  back
`;

function Logo() {
  return (
    <Backdrop src={canyonlands} height="500px" >
      <AppLogo src={logo} alt="logo" />
    </Backdrop>
  );
}

export default Logo;
