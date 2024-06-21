import axios from "axios";
import React, { useEffect, useState } from "react";
import { io } from "socket.io-client";
import "../css/Chat.css";
import { useNavigate } from "react-router-dom";
import Footer from "../common/Footer";

const socket = io("http://192.168.0.45:3001"); // 서버 주소 확인
const domain = "http://192.168.0.45:3001";
const domain2 = "http://192.168.0.45:8000";

const ChatList = () => {
  const navigate = useNavigate();
  const [list, setList] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [userId, setUserId] = useState("");
  const [opponentProfiles, setOpponentProfiles] = useState({});
  const [opponentNickName, setOpponentNickName] = useState({});

  useEffect(() => {
    axiosGetUser();
  }, []);

  //채팅방 리스트 가져오기
  const axiosGetChatList = async (user) => {
    try {
      const response = await axios.post(`${domain}/chatting/chatRoomList`, {
        userId: user,
      });
      setList(response.data);
      setIsLoading(false);

      // 각 채팅 목록 항목에 대해 상대방 프로필 가져오기
      response.data.forEach((chatList) => {
        const opponent = chatList.participants[0];
        axiosGetOpponentProfile(opponent);
      });
    } catch (error) {
      console.error(error);
    }
  };

  //유저 아이디 가져오기
  const axiosGetUser = async () => {
    try {
      const response = await axios.get(`${domain2}/chat/json/getUser`, {
        withCredentials: true,
      });
      setUserId(response.data);
      axiosGetChatList(response.data);
    } catch (error) {
      console.error(error);
    }
  };

  // 새 메시지가 도착했을 때 전체 채팅 리스트를 갱신
  useEffect(() => {
    socket.on("chat message", () => {
      axiosGetChatList(userId);
    });

    return () => {
      socket.off("chat message");
    };
  }, [userId]);

  const clickChat = (chatId, opponentProfile, opponentNickName) => {
    console.log(opponentProfile, "sad");
    // console.log(chatId, opponentProfile, opponentNickName);
    localStorage.setItem("opponentProfile", opponentProfile);
    localStorage.setItem("opponentNickName", opponentNickName);
    navigate(`/video-call/chatroom/${chatId}`);
  };

  //상대방 정보 가져오기
  const axiosGetOpponentProfile = async (opponent) => {
    try {
      const res = await axios.post(`${domain2}/chat/json/getOponentProfile`, {
        opponent: opponent,
      });
      setOpponentProfiles((prevProfiles) => ({
        ...prevProfiles,
        [opponent]: res.data.profileImageName,
      }));

      setOpponentNickName((prevProfiles) => ({
        ...prevProfiles,
        [opponent]: res.data.nickname,
      }));
    } catch (error) {
      console.error(error);
    }
  };

  //채팅방 나가기 버튼
  const clickOutChatRoom = () => {
    alert("ㄹㅇ?");
  };

  if (isLoading) {
    return (
      <div className="content-for-footer">
        <div>Loading...</div>
      </div>
    );
  } else {
    return (
      <>
        <div className="content-for-footer">
          <div className="center">
            <div className="contact bar">
              <h2>채팅 목록</h2>
            </div>

            {list.map((chatList, index) => {
              let opponent = chatList.participants[0];
              return (
                <div
                  className="contact border"
                  key={index}
                  onClick={() =>
                    clickChat(
                      chatList._id,
                      opponentProfiles[opponent],
                      opponentNickName[opponent]
                    )
                  }
                >
                  <div className="pic">
                    {console.log(opponentProfiles[opponent])}
                    {opponentProfiles[opponent] ? (
                      <img
                        className="pic"
                        src={`${domain2}/user/rest/profile/${opponentProfiles[opponent]}`}
                        alt="profile"
                      />
                    ) : (
                      <div>No Profile Image</div>
                    )}
                  </div>
                  {chatList.unreadCount[userId] !== 0 ? (
                    <div className="badge">{chatList.unreadCount[userId]}</div>
                  ) : (
                    <div></div>
                  )}
                  <div className="name">{opponentNickName[opponent]}</div>
                  <div className="message">{chatList.lastMessage.text}</div>
                  <i className="material-icons out" onClick={clickOutChatRoom}>
                    logout
                  </i>
                </div>
              );
            })}
          </div>
        </div>
        <Footer />
      </>
    );
  }
};

export default ChatList;
