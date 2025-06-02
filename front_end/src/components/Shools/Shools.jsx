import React, { useState, useEffect, useOptimistic } from "react";
import axios from "axios";
import { useCookies } from "react-cookie";
import './Shools.css'
import { useAllUsers } from "../UseAllUser";
import { useMyData } from "../UseMydata";

import { useNavigate } from "react-router-dom";
import { useTranslation } from 'react-i18next';
const Shools = () => {
  const { t } = useTranslation();
  const apiUrl = import.meta.env.VITE_API_URL;
  const [cookies] = useCookies(["token"]);
  const API = `${apiUrl}/api/v2`;

    const Navigate = useNavigate();
  
  const headers = {
    headers: { Authorization: `Bearer ${cookies.token}` },
  };
  
  const {data: MyData} = useMyData();
  const [sentRequests, setSentRequests] = useState({});
  const {data:allUsers} = useAllUsers();





  const sendFriendRequest = (id) => {
  // فعليًا نحدث فورًا نسخة من optimistic state

  setSentRequests((prev) => ({ ...prev, [id]: true }));

  axios
    .post(`${API}/auth/Send_friend_request/${id}`, {}, headers)
    .catch((err) => {
      console.error(err);
      setSentRequests((prev) => ({ ...prev, [id]: false }));
    });
  };

  return (
    <div className="schoolss">
      <p className="Suggestions">{t('Suggestions to follow')}</p>
      <div className="ov">
        {MyData && allUsers
          ?.filter(
            (school) =>
              school?.role === "employee" &&  school._id !== MyData?._id
          )
          .map((school) => (
            <div className="main_info" key={school?._id}>
              <div className="info_schools" onClick={() => Navigate(`/Get_Shoole_By/${school._id}`)}>
                <img
                  src={
                    school?.profilImage
                      ? `${apiUrl}/user/${school?.profilImage}`
                      : "/image/pngegg.png"
                  }
                  alt={`Image of ${school?.name}`}
                />
                <div className="schools_infos">
                  <p>{school?.name}</p>
                  <span>{school?.email}</span>
                </div>
              </div>
<button
  className={`websit_button ${sentRequests[school?._id]|| school?.followers.some((f) => f.friend === MyData?._id) ? "follow_active" : ""}`}
  onClick={() => sendFriendRequest(school._id)}
  disabled={sentRequests[school?._id]} // حتى ما ينضغط مرتين
>
  {sentRequests[school?._id] || school?.followers.some((f) => f.friend === MyData?._id) ? t("Followed") : t("Follow")}
</button>


            </div>
          ))}
      </div>
    </div>
  );
};

export default Shools;

