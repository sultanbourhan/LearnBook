import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import { useCookies } from "react-cookie";
import { useNavigate } from "react-router-dom";
import "./Header.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSignOutAlt , faFlag} from "@fortawesome/free-solid-svg-icons";
import { NavLink } from "react-router-dom";
import { useUser } from "../Context";
import { useLocation } from "react-router-dom";
import Info_menu from "../Info_menu/Info_menu";
import { useMyData } from "../UseMydata";
import Loading_Filter_post from "../Loading_Filter_post/Loading_Filter_post";
import { useQueryClient } from "@tanstack/react-query";
import Shools from "../Shools/Shools";
import { useTranslation } from 'react-i18next';
import Flag from 'react-world-flags'

const Header = () => {
  const queryClient = useQueryClient();
  const apiUrl = import.meta.env.VITE_API_URL;
  const { data: MyData, isFetching } = useMyData();

  const [cookies, setCookies] = useCookies(["token"]);
  const API = `${apiUrl}/api/v2`;

  const headers = {
    headers: { Authorization: `Bearer ${cookies.token}` },
  };

  const [showComponent, setShowComponent] = useState(false);
  const toggle = () => {
    setShowComponent((prev) => !prev);
  };

  const Navigate = useNavigate();

  const logout = () => {
    axios
      .put(
        `${apiUrl}/api/v2/auth/logout`,
        {},
        {
          headers: {
            Authorization: `Bearer ${cookies.token}`,
          },
        }
      )
      .then((res) => {
        setCookies("token", "");
        window.localStorage.removeItem("token");
        Navigate("/signandlog");
      })
      .catch((err) => {
        console.log(err);
      });
  };

  const [menuVisible, setMenuVisible] = useState(false);
  const commentRef = useRef(null);
  const location = useLocation();

  // 🔁 فقط لإغلاق القائمة لما تكبس برّا
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (commentRef.current && !commentRef.current.contains(event.target)) {
        setMenuVisible(false);
      }
    };

    if (menuVisible) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [menuVisible]);

  useEffect(() => {
    setMenuVisible(false); // سكّر المينيو لما تتغير الصفحة
  }, [location]);

  // 🟢 هاد للفتح والإغلاق فقط لما تكبس على الصورة
  const toggleMenu = (e) => {
    e.stopPropagation();
    setMenuVisible((prev) => !prev);
  };

  const { setUserTheme } = useUser();

  const [isToggled, setIsToggled] = useState(() => {
    const storedTheme = localStorage.getItem("theme");
    return storedTheme === "dark";
  });

  useEffect(() => {
    const themeColorMeta = document.querySelector('meta[name="theme-color"]');

    if (isToggled) {
      document.body.classList.add("root_da");
      localStorage.setItem("theme", "dark");
      if (themeColorMeta) themeColorMeta.setAttribute("content", "#1c1c1d"); // لون الدارك
    } else {
      document.body.classList.remove("root_da");
      localStorage.setItem("theme", "light");
      if (themeColorMeta) themeColorMeta.setAttribute("content", "#f0edf5"); // لون اللايت
    }
  }, [isToggled]);

  const handleToggle = () => {
    setIsToggled((prev) => !prev);
    setUserTheme((prev) => !prev);
  };

  const [showMore, setShowMore] = useState(false);

  const handleMoreClick = () => {
    setShowMore(!showMore);
  };

  // ==============================================================
  const [Accept, setAccept] = useState({});
  const acceptRequest = async (id) => {
    setAccept((prev) => ({ ...prev, [id]: "accepted" }));
    try {
      await axios.post(`${API}/auth/Accept_friend_request/${id}`, {}, headers);
      queryClient.invalidateQueries(["myData"]);
    } catch (err) {
      console.error(err);
    }
  };

  const rejectRequest = async (id) => {
    setAccept((prev) => ({ ...prev, [id]: "rejected" }));
    try {
      await axios.post(`${API}/auth/Reject_friend_request/${id}`, {}, headers);
      queryClient.invalidateQueries(["myData"]);
    } catch (err) {
      console.error(err);
    }
  };
  // ==============================================================

  const { t, i18n } = useTranslation();

  const changeLanguage = (lng) => {
    i18n.changeLanguage(lng);
  };


  return (
    <header>
      <div className="container">
        <div className="header_respon">
          <NavLink to={"/"}>
            <img className="logo" src="./image/log1.png" alt="" />
          </NavLink>
          <form action="">
            {/* <FontAwesomeIcon className='search_icon' icon={faSearch} /> */}
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="currentColor"
            >
              <path d="M11 2C15.968 2 20 6.032 20 11C20 15.968 15.968 20 11 20C6.032 20 2 15.968 2 11C2 6.032 6.032 2 11 2ZM11 18C14.8675 18 18 14.8675 18 11C18 7.1325 14.8675 4 11 4C7.1325 4 4 7.1325 4 11C4 14.8675 7.1325 18 11 18ZM19.4853 18.0711L22.3137 20.8995L20.8995 22.3137L18.0711 19.4853L19.4853 18.0711Z"></path>
            </svg>
            <input type="text" placeholder={t("Search.")} />
          </form>

          <div className="profile">
             <div className="show_item_header">
              <div className="profile_svg">
               <FontAwesomeIcon icon={faFlag} />
               <div className="Languages">
                <p onClick={() => changeLanguage('en')}> English</p>
                <p onClick={() => changeLanguage('es')}> Español</p>
                <p onClick={() => changeLanguage('ca')}> Català</p>
                <p onClick={() => changeLanguage('fr')}> Français</p>
              </div>
              </div>
              
            </div>
            <div className="show_item_header">
              <div className="profile_svg">
                {MyData?.Friend_requests?.length > 0 && (
                  <span>{MyData?.Friend_requests.length}</span>
                )}
                <div className="info_requsts_header">
                  <h3>{t('Requests')}</h3>
                  <div className="box_bro_req">
                    {MyData?.Friend_requests?.length > 0 ? (
                      MyData?.Friend_requests.map(({ friend }, i) => (
                        <div className="box_req" key={friend._id || i}>
                          <div className="info_req_user">
                            <img
                              src={
                                friend.profilImage
                                  ? friend.profilImage.startsWith("http")
                                    ? friend.profilImage
                                    : `${apiUrl}/user/${friend.profilImage}`
                                  : "/image/pngegg.png"
                              }
                              alt={`Image of ${friend.name}`}
                            />
                            <p>{friend?.name}</p>
                          </div>

                          <div className="button_req">
                            {Accept[friend._id] === "accepted" ? (
                              <p>
                                {t('You are friends now')}
                                <svg
                                  className="accept_req_friend"
                                  xmlns="http://www.w3.org/2000/svg"
                                  viewBox="0 0 24 24"
                                  fill="currentColor"
                                >
                                  <path d="M9.9997 15.1709L19.1921 5.97852L20.6063 7.39273L9.9997 17.9993L3.63574 11.6354L5.04996 10.2212L9.9997 15.1709Z"></path>
                                </svg>
                              </p>
                            ) : Accept[friend._id] === "rejected" ? (
                              <p>
                                {t('The request was rejected')}
                                <svg
                                  className="reject_req_friend"
                                  xmlns="http://www.w3.org/2000/svg"
                                  viewBox="0 0 24 24"
                                  fill="currentColor"
                                >
                                  <path d="M11.9997 10.5865L16.9495 5.63672L18.3637 7.05093L13.4139 12.0007L18.3637 16.9504L16.9495 18.3646L11.9997 13.4149L7.04996 18.3646L5.63574 16.9504L10.5855 12.0007L5.63574 7.05093L7.04996 5.63672L11.9997 10.5865Z"></path>
                                </svg>
                              </p>
                            ) : (
                              <>
                                <button
                                  className="websit_button reject"
                                  onClick={() => rejectRequest(friend._id)}
                                >
                                  {t('Reject')}
                                </button>
                                <button
                                  className="websit_button"
                                  onClick={() => acceptRequest(friend._id)}
                                >
                                  {t('Accept')}
                                </button>
                              </>
                            )}
                          </div>
                        </div>
                      ))
                    ) : (
                      <p className="no-requests-message">
                        😴 {t('There are no requests currently.')}
                      </p>
                    )}
                  </div>
                </div>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokelinejoin="round"
                >
                  <path stroke="none" d="M0 0h24v24H0z" fill="none" />
                  <path d="M8 7a4 4 0 1 0 8 0a4 4 0 0 0 -8 0" />
                  <path d="M6 21v-2a4 4 0 0 1 4 -4h4" />
                  <path d="M15 19l2 2l4 -4" />
                </svg>
              </div>
            </div>

            <div className="show_item_header">
              <div className="profile_svg">
                <span>18</span>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                >
                  <path d="M5 18H19V11.0314C19 7.14806 15.866 4 12 4C8.13401 4 5 7.14806 5 11.0314V18ZM12 2C16.9706 2 21 6.04348 21 11.0314V20H3V11.0314C3 6.04348 7.02944 2 12 2ZM9.5 21H14.5C14.5 22.3807 13.3807 23.5 12 23.5C10.6193 23.5 9.5 22.3807 9.5 21Z"></path>
                </svg>
              </div>
            </div>
            <div className="show_item_header">
              <div className="profile_svg">
                <span>31</span>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path stroke="none" d="M0 0h24v24H0z" fill="none" />
                  <path d="M8 9h8" />
                  <path d="M8 13h6" />
                  <path d="M18 4a3 3 0 0 1 3 3v8a3 3 0 0 1 -3 3h-5l-5 3v-3h-2a3 3 0 0 1 -3 -3v-8a3 3 0 0 1 3 -3h12z" />
                </svg>
              </div>
            </div>

            <div ref={commentRef}>
              <div className="show_item_header desnone" onClick={toggleMenu}>
                <div className="profile_svg">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path stroke="none" d="M0 0h24v24H0z" fill="none" />
                    <path d="M10 6h10" />
                    <path d="M4 12h16" />
                    <path d="M7 12h13" />
                    <path d="M4 18h10" />
                  </svg>
                </div>
              </div>
              {menuVisible && (
                <div className={`mobile-toggle ${showComponent ? "show" : ""}`}>
                  <Info_menu />
                </div>
              )}
            </div>

            {/* <p>{MyData.name}</p> */}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
