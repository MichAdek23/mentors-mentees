import React, { useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';

const JitsiMeeting = () => {
  const { roomId } = useParams();
  const jitsiContainerRef = useRef(null);
  const api = useRef(null);

  useEffect(() => {
    const domain = 'meet.jit.si';

    const loadJitsiScript = () => {
      if (!window.JitsiMeetExternalAPI) {
        const script = document.createElement('script');
        script.src = `https://${domain}/external_api.js`;
        script.onload = () => {
          console.log('Jitsi Meet API script loaded successfully');
          initializeJitsiMeeting();
        };
        script.onerror = (error) => {
          console.error('Failed to load Jitsi Meet API script:', error);
        };
        document.head.appendChild(script);
      } else {
        console.log('Jitsi Meet API script already loaded');
        initializeJitsiMeeting();
      }
    };

    const initializeJitsiMeeting = () => {
      if (jitsiContainerRef.current && window.JitsiMeetExternalAPI) {
        const options = {
          roomName: roomId,
          width: '100%',
          height: '100%', // Use 100% to fill the container
          parentNode: jitsiContainerRef.current,
          configOverwrite: {
            // Add configuration overrides here if needed
            startWithAudioMuted: true,
            startWithVideoMuted: true,
          },
          interfaceConfigOverwrite: {
            // Add interface configuration overrides here if needed
            TOOLBAR_ALWAYS_VISIBLE: true,
            filmStripBottomOfToolbar: true,
          },
          userInfo: {
            // Add user info if available (e.g., from authentication context)
            // email: 'user@example.com',
            // displayName: 'User Name'
          },
        };

        try {
          api.current = new window.JitsiMeetExternalAPI(domain, options);

          api.current.addEventListeners({
            readyToClose: () => {
              console.log('Meeting is closing');
              // Handle meeting end, e.g., navigate back
            },
            participantJoined: (participant) => {
              console.log('Participant joined:', participant);
            },
            participantLeft: (participant) => {
              console.log('Participant left:', participant);
            },
            videoConferenceJoined: (participant) => {
              console.log('Video conference joined:', participant);
            },
            videoConferenceLeft: () => {
              console.log('Video conference left');
              // Handle leaving the conference
            },
          });

        } catch (error) {
          console.error('Failed to create JitsiMeetExternalAPI:', error);
        }
      }
    };

    loadJitsiScript();

    return () => {
      if (api.current) {
        api.current.dispose();
      }
    };
  }, [roomId]);

  return (
    <div className="jitsi-container" ref={jitsiContainerRef} style={{ height: '100vh', width: '100%' }}>
      {/* The Jitsi meeting will be embedded here */}
    </div>
  );
};

export default JitsiMeeting;