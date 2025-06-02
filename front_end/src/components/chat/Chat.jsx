import React, { useState, useEffect, useRef } from "react";
import "./Chat.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSearch, faPaperPlane } from "@fortawesome/free-solid-svg-icons";
import { useNavigate } from "react-router-dom";
import { useCookies } from "react-cookie";
import ChatBetweenUsers from "../ChatBetweenUsers/ChatBetweenUsers";
import axios from "axios";
import { useUser } from "../Context";

import Loading_input from "../Loading_input/Loading_input";
import Loading_button from "../Loading_button/Loading_button";
import Info_menu from "../Info_menu/Info_menu";
import { useMyData } from "../UseMydata";
import { useAllUsers } from "../UseAllUser";
import { useQueryClient } from "@tanstack/react-query";
import { useTranslation } from 'react-i18next';
const Chat = () => {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const { setUserById } = useUser();
  const { userTheme, setUserTheme } = useUser();
  const [cookies] = useCookies(["token"]);

  const [activeTab, setActiveTab] = useState(t("Chats"));
  const { showChat, setShowChat } = useUser();
  const [sentRequests, setSentRequests] = useState({});
  const [searchTerm, setSearchTerm] = useState("");

  const { data: MyData} = useMyData();
  const { data: allUsers} = useAllUsers();

  
const apiUrl = import.meta.env.VITE_API_URL;




  // useEffect(() => {
  //   const delayDebounce = setTimeout(() => {
  //     axios
  //       .get(`${API}/user?name=${searchTerm}`, headers)
  //       .then((res) => {
  //         setAllUsers(res.data.data);
  //         setLoad(false);
  //         setReqLoading(false);
  //         setReqLoadingId(null);
  //       })
  //       .catch(console.error);
  //   }, 400);
  //   return () => clearTimeout(delayDebounce);
  // }, [searchTerm]);





  const [friends, setFriends] = useState([]);
  const [friendRequests, setFriendRequests] = useState([]);
  

  const [folloRequests, setfollRequests] = useState([]);
  

  const [reloadToggle, setReloadToggle] = useState(false);
  const [loadingRequests, setLoadingRequests] = useState(true);
  const [load, setLoad] = useState(false);
  const [loadid, setLoadid] = useState("");

  const [reqLoading, setReqLoading] = useState(false);
  const [reqLoadingId, setReqLoadingId] = useState(null);
  const [rejectedIds, setRejectedIds] = useState([]);

  const [showsearsh, SetSearsh] = useState(false)
  const inputRef = useRef(null);

  const ShowInoutSearsh = () => {
    SetSearsh(!showsearsh)

    setTimeout(() => {
      if (inputRef.current) {
        inputRef.current.focus();
      }
    }, 100);
  }
  // =============================================

  const Navigate = useNavigate();

  // ====================================================

  const API = `${apiUrl}/api/v2`;

  const headers = {
    headers: { Authorization: `Bearer ${cookies.token}` },
  };

  useEffect(() => {
    document.body.classList.add("chat-page");
    return () => document.body.classList.remove("chat-page");
  }, []);

  useEffect(() => {
    // Check if we have cached data and it's not expired (less than 5 minutes old)
    const raw = localStorage.getItem("chatData");
    let cachedData = null;
    if (raw && raw !== "undefined") {
      try {
        cachedData = JSON.parse(raw);
      } catch (err) {
        console.error("فشل في تحليل JSON:", err);
      }
    }
    const cachedTime = localStorage.getItem("chatDataTimestamp");
    const currentTime = new Date().getTime();
    const isDataFresh = cachedTime && currentTime - cachedTime < 5 * 60 * 1000;

    if (cachedData && isDataFresh && !loadingRequests) {
      // Use cached data if it exists and is fresh
      setMyData(cachedData);
      setFriendRequests(cachedData.Friend_requests);
      setFriends(cachedData.friends);
      setfollRequests(cachedData.followers);
      setLoadingRequests(false);
    } 
    // else {
    //   // Fetch new data if no cache or cache is stale
      
    //   axios
    //     .get(`${API}/auth/get_date_my`, headers)
    //     .then((res) => {
    //       const data = res.data.data;
    //       setMyData(data);
    //       setFriendRequests(data.Friend_requests);
    //       setFriends(data.friends);
          

    //       // Cache the data
    //       localStorage.setItem("chatData", JSON.stringify(data));
    //       localStorage.setItem("chatDataTimestamp", currentTime.toString());
    //     })
    //     .catch(console.error)
    //     .finally(() => setLoadingRequests(false));
    // }
  }, []); // Only depend on token and explicit reloads

  // useEffect(() => {
  //   if (searchTerm.trim() === '') {
  //     setAllUsers([]);
  //     return;
  //   }

  //   const delayDebounce = setTimeout(() => {
  //     // Check if we have cached search results for this term
  //     const cachedSearches = JSON.parse(localStorage.getItem('chatSearches') || '{}');

  //     if (cachedSearches[searchTerm]) {
  //       setAllUsers(cachedSearches[searchTerm]);
  //     } else {
  //       axios.get(`${API}/user?name=${searchTerm}`, headers)
  //         .then(res => {
  //           const results = res.data.data;
  //           setAllUsers(results);
  //           console.log(results);

  //           // Cache the search results
  //           const updatedCache = { ...cachedSearches, [searchTerm]: results };
  //           localStorage.setItem('chatSearches', JSON.stringify(updatedCache));
  //         })
  //         .catch(console.error);
  //     }
  //   }, 400);

  //   return () => clearTimeout(delayDebounce);
  // }, [searchTerm, cookies.token]);



  useEffect(() => {
    const savedRequests =
      JSON.parse(localStorage.getItem("sentRequests")) || {};
    setSentRequests(savedRequests);
  }, []);
const [sentRequestss, setSentRequestss] = useState({});
  const sendFriendRequest = (id) => {
    setLoad(true);
    setSentRequestss((prev) => ({ ...prev, [id]: true }));
    axios.post(`${API}/auth/Send_friend_request/${id}`, {}, headers)
      .then(() => {
        setReloadToggle((prev) => !prev);
queryClient.invalidateQueries(['myData']);
queryClient.invalidateQueries(['AllUser']);
      })
      .catch(()=>{
            setSentRequestss((prev) => ({ ...prev, [id]: false }));
      });
  };

  const handleSendRequest = (id) => {
    sendFriendRequest(id);
    const updated = { ...sentRequests, [id]: true };
    setSentRequests(updated);
    // localStorage.setItem('sentRequests', JSON.stringify(updated));
  };

  // const acceptRequest = (id) => {
  //   axios
  //     .post(`${API}/auth/Accept_friend_request/${id}`, {}, headers)
  //     .then(() => setLoadingRequests((prev) => !prev))
  //     .catch(console.error);
  // };

  // const rejectRequest = (id) => {
  //   axios
  //     .post(`${API}/auth/Reject_friend_request/${id}`, {}, headers)
  //     .then(() => {
  //       setReloadToggle((prev) => !prev);
  //     })
  //     .catch(console.error);
  // };


  // ============================================================

  useEffect(() => {
    const ff = localStorage.getItem("theme");
    if (ff === "dark") {
      setUserTheme(true);
    } else {
      setUserTheme(false);
    }
  }, [userTheme]);
  // ============================================================
  return (
    <div className="chat">
      <div className="test">
        <p className="messages_request">{t('Messages & Requests')}</p>
        <form onSubmit={(e) => e.preventDefault()}>
          <svg
            onClick={ShowInoutSearsh}
            className="search_icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M11 2C15.968 2 20 6.032 20 11C20 15.968 15.968 20 11 20C6.032 20 2 15.968 2 11C2 6.032 6.032 2 11 2ZM11 18C14.8675 18 18 14.8675 18 11C18 7.1325 14.8675 4 11 4C7.1325 4 4 7.1325 4 11C4 14.8675 7.1325 18 11 18ZM19.4853 18.0711L22.3137 20.8995L20.8995 22.3137L18.0711 19.4853L19.4853 18.0711Z"></path></svg>
          <input
            className={`${showsearsh ? "showinput" : ""}`}
            type="text"
            placeholder={t("Search for people..")}
            value={searchTerm}
            onFocus={() => setSearchTerm("")}
            onChange={(e) => setSearchTerm(e.target.value)}
            ref={inputRef}
          />
        </form>

        <div className="request">
          {[
            {
              name: t("Chats"),
              path_svg: "M5.76282 17H20V5H4V18.3851L5.76282 17ZM6.45455 19L2 22.5V4C2 3.44772 2.44772 3 3 3H21C21.5523 3 22 3.44772 22 4V18C22 18.5523 21.5523 19 21 19H6.45455Z"

            },

            {
              name: t("General"),
              path_svg: "M14 14.252V16.3414C13.3744 16.1203 12.7013 16 12 16C8.68629 16 6 18.6863 6 22H4C4 17.5817 7.58172 14 12 14C12.6906 14 13.3608 14.0875 14 14.252ZM12 13C8.685 13 6 10.315 6 7C6 3.685 8.685 1 12 1C15.315 1 18 3.685 18 7C18 10.315 15.315 13 12 13ZM12 11C14.21 11 16 9.21 16 7C16 4.79 14.21 3 12 3C9.79 3 8 4.79 8 7C8 9.21 9.79 11 12 11ZM18 17V14H20V17H23V19H20V22H18V19H15V17H18Z"
            },
           
            // {
            //   name: "Settings",
            //   path_svg: "M12 1L21.5 6.5V17.5L12 23L2.5 17.5V6.5L12 1ZM12 3.311L4.5 7.65311V16.3469L12 20.689L19.5 16.3469V7.65311L12 3.311ZM12 16C9.79086 16 8 14.2091 8 12C8 9.79086 9.79086 8 12 8C14.2091 8 16 9.79086 16 12C16 14.2091 14.2091 16 12 16ZM12 14C13.1046 14 14 13.1046 14 12C14 10.8954 13.1046 10 12 10C10.8954 10 10 10.8954 10 12C10 13.1046 10.8954 14 12 14Z"
            // },
          ].map((tab, index) => (
            <div key={index}
              className={`chats_req_gen ${activeTab === tab.name ? "active" : ""}`}
              onClick={() => setActiveTab(tab.name)} >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d={tab?.path_svg}></path></svg>
              <p >{tab?.name}</p>
            </div>
          ))}
        </div>
      </div>
      {(activeTab === "Chats" || activeTab === "Xats")  && !showChat && (
        <div className="friends">
          {MyData?.friends?.length ? (
            MyData?.friends.map(({ friend }, i) => (
              <div
                className="friend"
                key={i}
                onClick={() => {
                  setShowChat(true);
                  setUserById(friend);
                }}
              >
                <img
                  src={
                    friend?.profilImage
                      ? friend.profilImage.startsWith("http")
                        ? friend.profilImage
                        : `${apiUrl}/user/${friend.profilImage}`
                      : "/image/pngegg.png"
                  }
                  alt={`Image of ${friend?.name}`}
                />
                <p>{friend?.name}</p>
              </div>
            ))
          ) : (
            <img
              style={{ margin: "auto", width: "70%" }}
              src={
                userTheme
                  ? "/image/no-friend-requests-found (2).png"
                  : "/image/no-friend-requests-found (1).png"
              }
            />
          )}
        </div>
      )}

      {showChat && <ChatBetweenUsers />}

      {activeTab === "General" && (
        <div className="general">
          {MyData && MyData?.friends && allUsers?.length ? (
            allUsers
              .filter((user) => user._id !== MyData.friends?._id && user.role === "user" && user._id !== MyData?._id && !MyData?.Friend_requests.some(f => f.friend._id === user._id)) // تصفية المستخدم الذي يتوافق مع myData
              .map((user, i) => (
                friendRequests.some((f) => f.friend._id === user._id) ? null : 
                  <div key={i} className="req">
                  <div
                    className="img_req"
                onClick={async () => {
  Navigate(`/Get_Shoole_By/${user._id}`);
}}

                  >
                    {/* {console.log(user)} */}
                    <img
                      src={
                        user.profilImage
                          ? user.profilImage.startsWith("http")
                            ? user.profilImage
                            : `${apiUrl}/user/${user.profilImage}`
                          : "/image/pngegg.png"
                      }
                      alt={`Image of ${user.name}`}
                    />
                    <p>{user.name}</p>
                  </div>
                  <div className="accept">
                    {/* {friends.some((f) => f.friend?._id === user?._id) ? (
                      <p>Friends</p>
                    ) : null} */}
                    { user.Friend_requests.some((f) => f.friend === MyData?._id) || sentRequestss[user._id] ? (
                      <p>{t('Sent successfully')}</p>
                    ) : MyData?.friends.some((f) => f.friend?._id === user?._id) ? (
                      <p>{t('Friends')}</p>
                    ) : 
                    
                     <button
                        type="submit"
                        onClick={() => {
                          handleSendRequest(user._id);
                          setLoadid(user._id);
                        }}
                        className="websit_button"
                      >
                        {t('Add Friend')}
                      </button>}
                  </div>
                </div>
                
                
              ))
          ) : (
            <p>{t('No users found')}</p>
          )}
        </div>
      )}
    </div>
  );
};

export default Chat;
