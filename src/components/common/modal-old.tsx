import React from 'react';
import styled from 'styled-components';

const ModalCard = styled.div`
  position: fixed; /* Stay in place */
  z-index: 1; /* Sit on top */
  left: 0;
  top: 0;
  width: 100%; /* Full width */
  height: 100%; /* Full height */
  overflow: auto; /* Enable scroll if needed */
  background-color: rgb(0, 0, 0); /* Fallback color */
  background-color: rgba(0, 0, 0, 0.4); /* Black w/ opacity */

  .modal-content {
    position: relative;
    top: 100px;
    background-color: #fefefe;
    margin: auto;
    padding: 20px;
    min-height: 200px;
    width: 80%;
    border-radius: 10px;
  }

  .close {
    color: #aaaaaa;
    position: absolute;
    right: 10px;
    top: 10px;
    font-size: 28px;
    font-weight: bold;
  }

  .close:hover,
  .close:focus {
    color: #000;
    text-decoration: none;
    cursor: pointer;
  }
`;

const Modal = ({
  children,
  onClose,
}: {
  children: React.ReactNode;
  onClose: () => {};
}) => {
  return (
    <ModalCard>
      <div className="modal-content">
        <div className="close">X</div>
        {children}
      </div>
    </ModalCard>
  );
};

export default Modal;
