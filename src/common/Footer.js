import React, { useEffect, useState } from "react";
import "../css/Footer.css";
import axios from "axios";

const Footer = () => {
  const [userId, setUserId] = useState();

  useEffect(() => {
    axiosGetUser();
  });

  const axiosGetUser = async () => {
    try {
      const response = await axios.get(
        // "http://192.168.0.45:8000/chat/json/getUser",
        `https://mapmory.co.kr/chat/json/getUser`,
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

  const locationUser = () => {
    window.location.href = `/user/getProfile?userId=${userId}`;
  };

  const locationTimeline = () => {
    window.location.href = `/timeline/getTimelineList?userId=${userId}`;
  };

  const locationCommunity = () => {
    window.location.href = "/community/getSharedRecordList";
  };

  const locationMenu = () => {
    window.location.href = "/common/menu";
  };

  return (
    <div className="mobile-bottom-nav">
      <div className="mobile-bottom-nav__item">
        <div className="mobile-bottom-nav__item-content" onClick={locationUser}>
          <i className="material-icons">account_box</i>
          Profile
        </div>
      </div>
      <div className="mobile-bottom-nav__item">
        <div
          className="mobile-bottom-nav__item-content"
          onClick={locationTimeline}
        >
          <i className="material-icons">library_books</i>
          TimeLine
        </div>
      </div>
      <div className="mobile-bottom-nav__item">
        <div className="mobile-bottom-nav__item-content">
          <i className="material-icons">album</i>
          Record
        </div>
      </div>
      <div className="mobile-bottom-nav__item">
        <div
          className="mobile-bottom-nav__item-content"
          onClick={locationCommunity}
        >
          <i className="material-icons">insert_comment</i>
          Community
        </div>
      </div>
      <div className="mobile-bottom-nav__item">
        <div className="mobile-bottom-nav__item-content" onClick={locationMenu}>
          <i className="material-icons">list</i>
          Menu
        </div>
      </div>
    </div>
  );
};

export default Footer;
