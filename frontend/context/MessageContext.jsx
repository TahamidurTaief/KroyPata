"use client";

import React, { createContext, useContext, useState } from 'react';

// Create the MessageContext
const MessageContext = createContext();

// Custom hook to use the MessageContext
export const useMessage = () => {
  const context = useContext(MessageContext);
  if (context === undefined) {
    throw new Error('useMessage must be used within a MessageProvider');
  }
  // Return a safe default if context is null (during SSR or initialization)
  if (context === null) {
    console.warn('MessageContext is null - returning default values');
    return {
      isOpen: false,
      message: '',
      type: 'success',
      title: '',
      primaryActionText: '',
      onPrimaryAction: null,
      secondaryActionText: '',
      onSecondaryAction: null,
      playAudio: true,
      openMessage: () => {},
      openAdvancedMessage: () => {},
      closeMessage: () => {},
      showSuccess: () => {},
      showError: () => {},
      showWarning: () => {},
    };
  }
  return context;
};

// MessageProvider component
export const MessageProvider = ({ children }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState('');
  const [type, setType] = useState('success'); // 'success', 'error', 'warning'
  const [title, setTitle] = useState('');
  const [primaryActionText, setPrimaryActionText] = useState('');
  const [onPrimaryAction, setOnPrimaryAction] = useState(null);
  const [secondaryActionText, setSecondaryActionText] = useState('');
  const [onSecondaryAction, setOnSecondaryAction] = useState(null);
  const [playAudio, setPlayAudio] = useState(true);

  // Helper method to open message with basic parameters
  const openMessage = (messageType, messageText, messageTitle = '') => {
    setType(messageType);
    setMessage(messageText);
    setTitle(messageTitle || getDefaultTitle(messageType));
    setIsOpen(true);
    
    // Reset action buttons
    setPrimaryActionText('');
    setOnPrimaryAction(null);
    setSecondaryActionText('');
    setOnSecondaryAction(null);
    setPlayAudio(true);
  };

  // Advanced method to open message with full customization
  const openAdvancedMessage = ({
    type: messageType = 'success',
    message: messageText = '',
    title: messageTitle = '',
    primaryActionText: primaryText = '',
    onPrimaryAction: primaryAction = null,
    secondaryActionText: secondaryText = '',
    onSecondaryAction: secondaryAction = null,
    playAudio: shouldPlayAudio = true
  }) => {
    setType(messageType);
    setMessage(messageText);
    setTitle(messageTitle || getDefaultTitle(messageType));
    setPrimaryActionText(primaryText);
    setOnPrimaryAction(() => primaryAction);
    setSecondaryActionText(secondaryText);
    setOnSecondaryAction(() => secondaryAction);
    setPlayAudio(shouldPlayAudio);
    setIsOpen(true);
  };

  // Helper method to close message
  const closeMessage = () => {
    setIsOpen(false);
    // Reset all state after animation completes
    setTimeout(() => {
      setMessage('');
      setType('success');
      setTitle('');
      setPrimaryActionText('');
      setOnPrimaryAction(null);
      setSecondaryActionText('');
      setOnSecondaryAction(null);
      setPlayAudio(true);
    }, 300); // Match the modal exit animation duration
  };

  // Helper method to get default titles
  const getDefaultTitle = (messageType) => {
    switch (messageType) {
      case 'success':
        return 'Success!';
      case 'error':
        return 'Error';
      case 'warning':
        return 'Warning';
      default:
        return 'Notification';
    }
  };

  // Quick access methods for common message types
  const showSuccess = (messageText, messageTitle = '') => {
    openMessage('success', messageText, messageTitle);
  };

  const showError = (messageText, messageTitle = '') => {
    openMessage('error', messageText, messageTitle);
  };

  const showWarning = (messageText, messageTitle = '') => {
    openMessage('warning', messageText, messageTitle);
  };

  const value = {
    // State
    isOpen,
    message,
    type,
    title,
    primaryActionText,
    onPrimaryAction,
    secondaryActionText,
    onSecondaryAction,
    playAudio,
    
    // Methods
    openMessage,
    openAdvancedMessage,
    closeMessage,
    showSuccess,
    showError,
    showWarning,
  };

  return (
    <MessageContext.Provider value={value}>
      {children}
    </MessageContext.Provider>
  );
};

export default MessageContext;
