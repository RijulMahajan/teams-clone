import React, { useContext } from 'react';
import { Button } from '@material-ui/core';
import { SocketContext } from '../Context';

const Notifications = () => {
  const { callAnswer, call, acceptCall } = useContext(SocketContext);

  return (
    <>
      {call.isReceivingCall && !acceptCall && (
        <div style={{ display: 'flex', justifyContent: 'space-around' }}>
          <h1>{call.name} is calling:</h1>
          <Button variant="contained" color="primary" onClick={callAnswer}>
            Accept
          </Button>
        </div>
      )}
    </>
  );
};

export default Notifications;
