import React, { useEffect } from 'react';

interface MessengerChatProps {
  pageId: string;
}

declare global {
  interface Window {
    fbAsyncInit: () => void;
    FB: any;
  }
}

export const MessengerChat: React.FC<MessengerChatProps> = ({ pageId }) => {
  useEffect(() => {
    // Set up the Messenger Chat Box
    const chatbox = document.getElementById('fb-customer-chat');
    if (chatbox) {
      chatbox.setAttribute("page_id", pageId);
      chatbox.setAttribute("attribution", "biz_inbox");
    }

    // Init Facebook SDK
    window.fbAsyncInit = function() {
      window.FB.init({
        xfbml: true,
        version: 'v18.0'
      });
    };

    // Load SDK asynchronously
    (function(d, s, id) {
      let js: any, fjs: any = d.getElementsByTagName(s)[0];
      if (d.getElementById(id)) return;
      js = d.createElement(s); js.id = id;
      js.src = 'https://connect.facebook.net/fr_FR/sdk/xfbml.customerchat.js';
      fjs.parentNode.insertBefore(js, fjs);
    }(document, 'script', 'facebook-jssdk'));

    // Cleanup logic if needed (optional)
    return () => {
      // Typically the script stays, but we can hide the chatbox if wanted
    };
  }, [pageId]);

  return (
    <>
      <div id="fb-root"></div>
      <div id="fb-customer-chat" className="fb-customerchat"></div>
    </>
  );
};
