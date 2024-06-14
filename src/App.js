import React, { useState } from "react";
import { Route, Routes } from "react-router-dom";
import VideoCall from "./pages/VideoCall";
import Chat from "./pages/Chat";
import ChatList from "./pages/ChatList";

const App = () => {
  const [currentUserId, setCurrentUserId] = useState(null);

  const handleLogin = (userId) => {
    setCurrentUserId(userId);
  };

  return (
    <div>
      <Routes>
        <Route
          path="/video-call/:toUserId"
          element={<VideoCall currentUserId={currentUserId} />}
        />
        <Route path="/video-call/chatList" element={<ChatList />} />
        <Route path="/video-call/chatroom/:chat_room_id" element={<Chat />} />
      </Routes>
    </div>
  );
};

export default App;
