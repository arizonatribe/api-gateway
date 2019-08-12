import React from 'react';
import styled from 'styled-components';
import { createPortal } from 'react-dom';
import StudentForm from './StudentForm';
import usePortal from './usePortal';

const ModalWrapper = styled.div`
  position: fixed;
  top: 40%;
  width: 100%;
  display: grid;
  justify-content: center;
  align-content: center;
  z-index: 10;
`;

function Portal({ id, children }) {
  const target = usePortal(id);
  return createPortal(children, target);
}

function AddEditModal(props) {
  return (
    <Portal id="modal-root">
      <ModalWrapper>
        <StudentForm {...props} />
      </ModalWrapper>
    </Portal>
  );
}

export default AddEditModal;
