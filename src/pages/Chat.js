import axios from "axios";
import React, { useEffect, useRef, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { io } from "socket.io-client";
import "../css/Chat.css";
import Footer from "../common/footer";

const socket = io("https://mapmory.co.kr"); // 서버 주소 확인
const domain = "https://mapmory.co.kr";
const domain2 = "https://mapmory.co.kr";
// const socket = io("http://192.168.0.45:3001"); // 서버 주소 확인
// const domain = "http://192.168.0.45:3001";
// const domain2 = "http://192.168.0.45:8000";
// const socket = io("https://www.uaena.shop"); // 무중단 배포서버
// const domain = "https://www.uaena.shop";
// const domain2 = "https://www.uaena.shop";

const Chat = () => {
  const fileInputRef = useRef();
  const { chat_room_id, nickname, profileImageName } = useParams();
  const [userId, setUserId] = useState();
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const room = chat_room_id;
  const [imageList, setImageList] = useState([]);
  const [imagePreviews, setImagePreviews] = useState([]);
  const [opponentProfiles, setOpponentProfiles] = useState("");
  const [opponentNickName, setOpponentNickName] = useState("");
  const [opponent, setOpponent] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [imageUrl, setImageUrl] = useState({});
  const location = useLocation();
  const chatContainerRef = useRef(null);

  console.log(opponentProfiles);
  console.log(imageUrl);

  useEffect(() => {
    console.log("asd", localStorage.getItem("opponentProfile"));
    console.log("asd", localStorage.getItem("opponentNickName"));
    const storageProfiles = localStorage.getItem("opponentProfile");
    const storageNickName = localStorage.getItem("opponentNickName");

    setOpponentProfiles(storageProfiles);
    setOpponentNickName(storageNickName);

    localStorage.removeItem("opponentProfile");
    localStorage.removeItem("opponentNickName");
  }, []);

  //유저 아이디 가져오기
  const axiosGetUser = async () => {
    try {
      const response = await axios.get(
        // "http://192.168.0.45:8000/chat/json/getUser",
        `${domain2}/chat/rest/json/getUser`,
        {
          withCredentials: true,
        }
      );
      // console.log("getUser", response.data);
      setUserId(response.data);
      return response.data;
    } catch (error) {
      console.error(error);
    }
  };

  //어떤 방법으로든 화면이 꺼지면 채팅방 퇴장
  window.onbeforeunload = () => {
    socket.emit("leaveRoom", chat_room_id);
  };

  useEffect(() => {
    axiosGetUser().then((res) => {
      // const user = res;
      // console.log("getUser", res);
      socket.emit("joinChat", { room, userId });
    });
  }, []);

  useEffect(() => {
    socket.on("chat message", (msg) => {
      const user = userId;
      // console.log("chat mes", user);
      socket.emit("is read", { room, user });
      console.log("chat message");
      setMessages((prevMessages) => [...prevMessages, msg]);
    });
    // socket.on("previousMessages", (msgs) => {
    //   console.log("prev message");
    //   setMessages((prevMessages) => [...msgs, ...prevMessages]);
    // });
  }, []);

  useEffect(() => {
    getAllMessages();
  }, [room]);

  //채팅 스크롤 자동으로 하단위치
  useEffect(() => {
    if (chatContainerRef.current) {
      const { scrollTop, scrollHeight, clientHeight } =
        chatContainerRef.current;
      const isAtBottom = scrollHeight - scrollTop >= clientHeight;
      console.log(scrollTop, scrollHeight, clientHeight, isAtBottom);
      if (isAtBottom) {
        chatContainerRef.current.scrollTop =
          chatContainerRef.current.scrollHeight;
      }
    }
  }, [messages]);

  // //상대방 프로필 가져오기
  // useEffect(() => {
  //   axiosGetOpponentProfile();
  // }, [imageUrl]);

  // 현재 채팅방의 모든 메시지 가져오기
  const getAllMessages = async () => {
    try {
      const response = await axios.post(
        // "http://192.168.0.45:3001/chatting/getAllMessages",
        `${domain}/chatting/getAllMessages`,
        {
          chat_room_id: chat_room_id,
        }
      );
      // console.log("getAll", response.data);
      setMessages(response.data);
    } catch (error) {
      console.error(error);
    }
  };

  //채팅 전송
  const sendMessage = () => {
    if (userId !== "") {
      if (input) {
        socket.emit("chat message", {
          chatId: chat_room_id,
          senderId: userId,
          text: input,
          imageUrl: null,
          readBy: [],
        });
        setInput("");
      }
    } else {
      alert("다시 로그인 해주세요");
      window.location.href = "https://mapmory.co.kr";
    }
  };

  //타임스탬프 parse
  const parseTimeStamp = (timestamp) => {
    const t = timestamp.indexOf("T");
    const dot = timestamp.lastIndexOf(":");
    const parseTime = timestamp.substring(t + 1, dot);
    let hr = parseTime.split(":")[0];
    let min = parseTime.split(":")[1];

    if (hr < 12) {
      if (hr < 1) {
        hr = 12;
      }
      return "오전 " + hr + ":" + min;
    } else {
      if (hr > 12) {
        hr -= 12;
      }
      return "오후 " + hr + ":" + min;
    }
  };

  //Enter 눌렀을때 채팅 전송
  const pressEnter = (e) => {
    if (e.key === "Enter") {
      sendMessage();
    }
  };

  //이미지 인풋시 리스트에 추가
  const onChangeImageInput = (e) => {
    // setImageList([...imageList, ...e.target.files]);
    const files = Array.from(e.target.files);
    setImageList([...imageList, ...files]);

    const previews = files.map((file) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      return new Promise((resolve) => {
        reader.onload = () => resolve(reader.result);
      });
    });

    Promise.all(previews).then((previews) => {
      setImagePreviews([...imagePreviews, ...previews]);
    });

    //초기화 해주지 않으면 이전과 같은 이미지 추가행위를 하였을때 이미지가 추가되지 않음
    e.target.value = "";
  };

  //이미지 업로드
  const axiosImageUpload = async () => {
    const formData = new FormData();

    imageList.forEach((image) => {
      console.log(image);
      formData.append("files", image);
    });

    formData.append("chatId", chat_room_id);

    const config = {
      headers: {
        "Content-Type": "multipart/form-data",
      },
      withCredentials: true,
    };
    try {
      await axios
        .post(
          // "http://192.168.0.45:8000/chat/json/addChatImage",
          `${domain2}/chat/rest/json/addChatImage`,
          formData,
          config
        )
        .then((res) => {
          console.log(res.data);
          try {
            res.data.forEach((imageurl) => {
              console.log("imageUrl :", imageurl);
              socket.emit("chat message", {
                chatId: chat_room_id,
                senderId: userId,
                imageUrl: imageurl,
                text: null,
                readBy: [],
              });
            });
          } catch (error) {
            window.href(res);
          }
          setImagePreviews([]);
          setImageList([]);
        });
    } catch (error) {
      console.error(error);
    }
  };

  //메시지 읽음 여부
  useEffect(() => {
    const user = userId;
    socket.emit("is read", { room, user });
  }, [messages]);

  socket.on("is read", async (res) => {
    const { room, user } = res;
    // console.log("front is read :", res);
    socket.emit("is read", { room, user });
  });

  const inputImageClick = () => {
    fileInputRef.current.click();
  };

  const onClickSend = () => {
    axiosImageUpload();
    sendMessage();
  };

  const removeImage = (index) => {
    setImagePreviews(imagePreviews.filter((_, i) => i !== index));
    setImageList(imageList.filter((_, i) => i !== index));
    console.log(imageList);
  };

  // //상대방 사진, 닉네임 가져오기
  // const axiosGetOpponentProfile = async () => {
  //   const res = await axios.post(`${domain}/chatting/getOpponent`, {
  //     chat_room_id: chat_room_id,
  //     userId: userId,
  //   });
  //   setOpponent(res.data);
  //   // console.log("try", res.data);
  //   try {
  //     const res = await axios.post(`${domain2}/chat/json/getOponentProfile`, {
  //       opponent: opponent,
  //     });
  //     setOpponentProfiles((prevProfiles) => ({
  //       ...prevProfiles,
  //       [opponent]: res.data.profileImageName,
  //     }));
  //     setOpponentNickName((prevProfiles) => ({
  //       ...prevProfiles,
  //       [opponent]: res.data.nickname,
  //     }));
  //     const getImageUrl =
  //       await `${domain2}/user/rest/profile/${opponentProfiles[opponent]}`;
  //     console.log("afsafa:", getImageUrl);
  //     setImageUrl(getImageUrl);
  //     setIsLoading(false);
  //   } catch (error) {
  //     console.error(error);
  //   }
  // };
  return (
    <div className="container">
      <div className="chat">
        <div className="contact bar">
          <div className="pic">
            <img
              className="pic"
              src={`${domain2}/user/rest/profile/${profileImageName}`}
              alt="profile"
            />
          </div>
          <div className="name">{nickname}</div>
        </div>
        <div className="messages" id="chat" ref={chatContainerRef}>
          {messages.map((res, index) => {
            const nextMessage =
              index < messages.length - 1 ? messages[index + 1] : null;
            const isLastMessage =
              !nextMessage || nextMessage.senderId !== res.senderId;
            const isLastMessageInTimestamp =
              !nextMessage ||
              parseTimeStamp(res.timestamp) !==
                parseTimeStamp(nextMessage.timestamp);

            return (
              <div key={index}>
                {/* {console.log(index, res)} */}
                {res.senderId === userId ? (
                  <div className="message-container-parker">
                    {res.text !== null ? (
                      <div className="message parker">{res.text}</div>
                    ) : null}
                    {res.imageUrl !== null ? (
                      <img
                        className="message parker message-image"
                        alt=""
                        src={`${res.imageUrl}`}
                      ></img>
                    ) : null}
                    {/* 다음 메시지와 시간이 다르거나 채팅하는 사람이 다른 경우 시간을 표시 */}
                    {isLastMessage || isLastMessageInTimestamp ? (
                      <div className="timestamp">
                        {parseTimeStamp(res.timestamp)}
                      </div>
                    ) : (
                      ""
                    )}
                  </div>
                ) : (
                  <div className="message-container">
                    {res.text !== null ? (
                      <div className="message">{res.text}</div>
                    ) : null}
                    {res.imageUrl !== null ? (
                      <img
                        alt=""
                        className="message message-image"
                        src={`${res.imageUrl}`}
                      ></img>
                    ) : null}
                    {/* 다음 메시지와 시간이 다르거나 채팅하는 사람이 다른 경우 시간을 표시 */}
                    {isLastMessage || isLastMessageInTimestamp ? (
                      <div className="timestamp">
                        {parseTimeStamp(res.timestamp)}
                      </div>
                    ) : (
                      ""
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
        {/* 이미지 미리보기 화면 만들곳 */}
        {imagePreviews[0] !== undefined ? (
          <div className="image-preview-container">
            {imagePreviews.map((preview, index) => (
              <div key={index} className="image-preview-wrapper">
                <img
                  key={index}
                  src={preview}
                  alt={`preview-${index}`}
                  className="image-preview"
                />
                <button
                  className="remove-image-button"
                  onClick={() => removeImage(index)}
                >
                  X
                </button>
              </div>
            ))}
          </div>
        ) : (
          ""
        )}

        {/* 이미지 미리보기 화면 만들곳 */}
        <div className="input">
          <i className="material-icons" onClick={inputImageClick}>
            add_photo_alternate
          </i>
          <input
            type="file"
            accept="image/*"
            multiple
            ref={fileInputRef}
            onChange={onChangeImageInput}
            style={{ display: "none" }}
          />
          <input
            placeholder="여기에 메세지 입력"
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={pressEnter}
          />
          <button onClick={onClickSend} className="material-icons send-button">
            send
          </button>
        </div>
      </div>
      <div className="footer-container chat-room">
        <Footer userId={userId} />
      </div>
    </div>
  );
};

export default Chat;
