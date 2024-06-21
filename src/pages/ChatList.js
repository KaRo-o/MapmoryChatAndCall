import axios from "axios";
import React, { useEffect, useState } from "react";
import { io } from "socket.io-client";
import "../css/Chat.css";
import { useNavigate } from "react-router-dom";
import { confirmAlert } from "react-confirm-alert";
import "../css/react-confirm-alert.css";
import Footer from "../common/footer";

// const socket = io("http://192.168.0.45:3001"); // 서버 주소 확인
// const domain = "http://192.168.0.45:3001";
// const domain2 = "http://192.168.0.45:8000";
const socket = io("https://mapmory.co.kr"); // 서버 주소 확인
const domain = "https://mapmory.co.kr";
const domain2 = "https://mapmory.co.kr";

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
      console.log("asd");
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
  }, [userId, list]);

  const clickChat = (chatId, opponentProfile, opponentNickName) => {
    console.log(opponentProfile, "sad");
    // console.log(chatId, opponentProfile, opponentNickName);
    localStorage.setItem("opponentProfile", opponentProfile);
    localStorage.setItem("opponentNickName", opponentNickName);
    navigate(
      `/video-call/chatroom/${chatId}/${opponentNickName}/${opponentProfile}`
    );
  };

  //상대방 정보 가져오기
  const axiosGetOpponentProfile = async (opponent) => {
    try {
      const res = await axios.post(`${domain2}/chat/json/getOpponentProfile`, {
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
  const clickOutChatRoom = (event, chatId) => {
    event.stopPropagation();
    confirmAlert({
      title: "채팅방 나가기",
      message:
        "채팅방을 나가면 채팅내용 복구가 불가능 하며, 상대방에게서도 채팅방이 보이지 않게 됩니다. 정말로 나가시겠습니까?",
      buttons: [
        {
          label: "확인",
          onClick: () => axiosOutChatRoom(chatId),
        },
        {
          label: "취소",
        },
      ],
      closeOnEscape: true,
      closeOnClickOutside: true,
    });
  };

  const axiosOutChatRoom = async (chatId) => {
    try {
      console.log("1");
      await axios.post(`${domain}/chatting/removeChatRoom`, {
        chat_room_id: chatId,
      });
      console.log("2");

      // Chat list 업데이트
      await axiosGetChatList(userId);

      // 채팅방 목록 초기화 (필요한 경우)
      setList([]);
    } catch (error) {
      console.error(error);
    }
  };

  if (isLoading) {
    return (
      <div className="content-for-footer">
        <div>Loading...</div>
      </div>
    );
  } else {
    return (
      <div>
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
                <i
                  className="material-icons out"
                  onClick={(event) => {
                    clickOutChatRoom(event, chatList._id);
                  }}
                >
                  logout
                </i>
              </div>
            );
          })}
        </div>
        <div className="footer-container chat-list">
          <Footer />
        </div>
      </div>
    );
  }
};

export default ChatList;
