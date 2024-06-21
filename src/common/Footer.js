import React from "react";
import "../css/Footer.css";

const Footer = () => {
  return (
    <footer className="footer-container">
      <nav className="mobile-bottom-nav">
        <div className="mobile-bottom-nav__item mobile-bottom-nav__item--active">
          <div className="mobile-bottom-nav__item-content" name="프로필">
            <i className="material-icons">account_box</i>
            Profile
          </div>
        </div>
        <div className="mobile-bottom-nav__item">
          <div className="mobile-bottom-nav__item-content" name="타임라인">
            <i className="material-icons">library_books</i>
            TimeLine
          </div>
        </div>
        <div className="mobile-bottom-nav__item">
          <div className="mobile-bottom-nav__item-content" name="체크포인트">
            <i className="material-icons">album</i>
            Record
          </div>
        </div>
        <div className="mobile-bottom-nav__item">
          <div className="mobile-bottom-nav__item-content" name="커뮤니티">
            <i className="material-icons">insert_comment</i>
            Community
          </div>
        </div>
        <div className="mobile-bottom-nav__item">
          <div className="mobile-bottom-nav__item-content" name="메뉴">
            <i className="material-icons">list</i>
            Menu
          </div>
        </div>
      </nav>
    </footer>
  );
};

export default Footer;
