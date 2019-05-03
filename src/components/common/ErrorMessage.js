import React, { useState, useEffect } from 'react';
import { Message } from 'semantic-ui-react';
import ErrorModel from '../../models/ErrorModel';

export default function ErrorMessage() {
  const [visible, setVisible] = useState(false);
  const [message, setMessage] = useState(ErrorModel.message);

  useEffect(() => {
    ErrorModel.onUpdated(updateError);
    return () => ErrorModel.offUpdated(updateError);
  }, []); // run an effect and clean it up only once (on mount and unmount), you can pass an empty array ([])

  let timer = 0;
  function updateError(curr, prev, mutation) {
    if (mutation.error) {
      setVisible(true);
      setMessage(curr.message);
      clearTimeout(timer);
      timer = setTimeout(handleDismiss, 5000);
    }
  }

  function handleDismiss() {
    setVisible(false);
  }

  if (!visible) { return null; }
  return (
    <Message negative compact
      color='red'
      onDismiss={handleDismiss}
      className='animated fadeInUpBig'
      style={{ position: 'fixed', bottom: '4rem', right: '1rem', zIndex: 9999 }}>
      <Message.Header>Sorry~ &nbsp;&nbsp;</Message.Header>
      <p>{message}</p>
    </Message>
  )
}
