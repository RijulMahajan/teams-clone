import React, { createContext, useState, useRef, useEffect } from 'react';
import { io } from 'socket.io-client';
import Peer from 'simple-peer';

const SocketContext = createContext();

const socket = io('https://connectitmsteams.herokuapp.com/');

const ContextProvider = ({ children }) => {
  const [acceptCall, setAcceptCall] = useState(false);
  const [endCall, setEndCall] = useState(false);
  const [stream, setStream] = useState();
  const [name, setName] = useState('');
  const [call, setCall] = useState({});
  const [me, setMe] = useState('');

  const myVid = useRef();
  const userVid = useRef();
  const connectRef = useRef();

  useEffect(() => {
    navigator.mediaDevices.getUserMedia({ video: true, audio: true })
      .then((currentStream) => {
        setStream(currentStream);

        myVid.current.srcObject = currentStream;
      });

    socket.on('me', (id) => setMe(id));

    socket.on('callUser', ({ from, name: callerName, signal }) => {
      setCall({ isReceivingCall: true, from, name: callerName, signal });
    });
  }, []);

  const callAnswer = () => {
    setAcceptCall(true);

    const peer = new Peer({ initiator: false, trickle: false, stream });

    peer.on('signal', (data) => {
      socket.emit('callAnswer', { signal: data, to: call.from });
    });

    peer.on('stream', (currentStream) => {
      userVid.current.srcObject = currentStream;
    });

    peer.signal(call.signal);

    connectRef.current = peer;
  };

  const callUser = (id) => {
    const peer = new Peer({ initiator: true, trickle: false, stream });

    peer.on('signal', (data) => {
      socket.emit('callUser', { userToCall: id, signalData: data, from: me, name });
    });

    peer.on('stream', (currentStream) => {
      userVid.current.srcObject = currentStream;
    });

    socket.on('acceptCall', (signal) => {
      setAcceptCall(true);

      peer.signal(signal);
    });

    connectRef.current = peer;
  };

  const hangUp = () => {
    setEndCall(true);

    connectRef.current.destroy();

    window.location.reload();
  };

  return (
    <SocketContext.Provider value={{
      call,
      acceptCall,
      myVid,
      userVid,
      stream,
      name,
      setName,
      endCall,
      me,
      callUser,
      hangUp,
      callAnswer,
    }}
    >
      {children}
    </SocketContext.Provider>
  );
};

export { ContextProvider, SocketContext };
