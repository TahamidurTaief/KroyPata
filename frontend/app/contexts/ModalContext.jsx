"use client";

import React, { createContext, useState, useContext, useCallback } from 'react';
import NotificationModal from '@/app/Components/Common/NotificationModal';

const ModalContext = createContext();

export const useModal = () => useContext(ModalContext);

export const ModalProvider = ({ children }) => {
  const [modalState, setModalState] = useState({
    isOpen: false,
    status: 'success',
    title: '',
    message: '',
    primaryActionText: '',
    onPrimaryAction: null,
    secondaryActionText: '',
    onSecondaryAction: null,
  });

  const showModal = useCallback((config) => {
    setModalState({ ...config, isOpen: true });
  }, []);

  const hideModal = useCallback(() => {
    setModalState((prev) => ({ ...prev, isOpen: false }));
  }, []);

  return (
    <ModalContext.Provider value={{ showModal, hideModal }}>
      {children}
      <NotificationModal 
        {...modalState}
        onClose={hideModal}
      />
    </ModalContext.Provider>
  );
};
