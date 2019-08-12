import styled from 'styled-components';

export const TabRow = styled.div`
  display: grid;
  grid-template-columns: repeat(2, auto);
  justify-content: center;
  grid-column-gap: 0.4em;
`;

export const Tab = styled.section`
  display: grid;
  cursor: pointer;
  padding: 1.4em 2em 0.6em 2em;
  color: white;
  opacity: ${props => props.isBackground ? 0.7 : 1};
  border-top-left-radius: 40%;
  border-top-right-radius: 40%;
  border-bottom: 0.2px solid darkorange;
  font-weight: bold;
  background-color: #f6681d;
  justify-content: center;
  justify-items: center;
`;
