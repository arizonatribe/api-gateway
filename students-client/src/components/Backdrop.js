import styled from 'styled-components';

const Backdrop = styled.div`
  position: relative;
  background: transparent;
  width: 100%;
  min-height: ${p => p.height || '110px'};
  &::after {
    content: "";
    ${p => p.src && `background: url(${p.src}) no-repeat;`}
    background-size: 100%;
    max-height: ${p => p.height || '110px'};
    opacity: ${p => p.opacity || 0.3};
    top: 0;
    left: 0;
    bottom: 0;
    right: 0;
    position: absolute;
  }
`;

export default Backdrop;
