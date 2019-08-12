import styled from 'styled-components';

export const TableHeader = styled.div`
  display: grid;
  grid-template-columns: ${p => p.cols === 3 ? '1fr 1fr auto' : `repeat(${p.cols}, 1fr)`};
  padding: 0.2em 1em;
  background-color: #5a8e75;
  & button, & p {
    color: white;
    font-weight: bold;
    font-size: 110%;
    text-align: left;
  }
`;

export const TableBody = styled.div`
  padding: 0;
  display: grid;
  a {
    color: lightblue;
  }
  & div:nth-child(even) {
    background-color: whitesmoke;
  }
  & div:nth-child(odd) {
    background-color: white;
  }
  & > div {
    border-right: 1px solid lightgray;
    border-left: 1px solid lightgray;
    display: grid;
    grid-template-columns: ${p => p.cols === 3 ? '1fr 1fr auto' : `repeat(${p.cols}, 1fr)`};
    padding: 0.2em 1em;
    ${props => props.noHover
      ? ''
      : `&:hover {
        cursor: pointer;
        & p {
          color: white;
        }
        background: #2da6cc;
        transition: background 0.2s ease;
    }`
  }
  }
  & p {
    text-align: left;
    display: block;
    padding: 0.4em;
    color: darkgray;
  }
`;

export const TableFooter = styled.div`
  display: grid;
  text-align: center;
  justify-items: center;
  grid-template-columns: repeat(2, 1fr);
  & button {
    font-weight: bold;
    padding: 0.5em 1.7em;
    color: white;
    background-color: #4cd4ee;
    border: 0.5px solid whitesmoke;
    &:disabled {
      color: lightgray;
      background-color: gray;
    }
  }
  color: white;
  padding: 0.4em;
  background-color: lightgray;
`;

export const Table = styled.div`
  display: grid;
  text-align: center;
  padding: 0 4em 6em 4em;
  justify-items: stretch;
  grid-column-gap: 0.5em;
  background: transparent;
  border-radius: 8px;
`;
