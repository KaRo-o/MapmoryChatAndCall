import React, { useState } from "react";
import { Route, Routes } from "react-router-dom";
import Chat from "./pages/Chat";
import ChatList from "./pages/ChatList";

const App = () => {
  const [currentUserId, setCurrentUserId] = useState(null);

  const handleLogin = (userId) => {
    setCurrentUserId(userId);
  };

  return (
    <>
      <div className="content=for-footer">
        <Routes>
          <Route path="/video-call/chatList" element={<ChatList />} />
          <Route
            path="/video-call/chatroom/:chat_room_id/:nickname/:profileImageName"
            element={<Chat />}
          />
        </Routes>
      </div>
      {/* <Footer /> */}
    </>
  );
};

export default App;
