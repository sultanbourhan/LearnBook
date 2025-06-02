import { useEffect, useState } from "react";
import "./Home.css";
import Menu from "../main_menu/Menu";
import Bosts from "../bosts/Bosts";
import Chat from "../chat/Chat";
import ImageSlider from "../ImageSlider/ImageSlider";
import Create_menu from "../Create_menu/Create_menu";
import { CookiesProvider, useCookies } from "react-cookie";
import { useNavigate } from "react-router-dom";
import Info_menu from "../Info_menu/Info_menu";
import Shools from "../Shools/Shools";
import axios from "axios";
import Publish_post from "../Publish_post/Publish_post";
import Filter_post from "../Filter_post/Filter_post";
import Load_home from "../Load_home/Load_home";
import { useMyData } from "../UseMydata";
const Home = () => {
  const {data:Mydata} = useMyData();

  const [cookies, setCookies] = useCookies("token");


  const navigate = useNavigate();
  const token = window.localStorage.getItem("token");

    useEffect(() => {
      if (token && !cookies.token) {
        setCookies("token", token, { path: "/" });
      } else if (!token) {
        navigate("/signandlog");
      }
    }, [token, cookies, navigate, setCookies]);


  return (
    <>
    <div className="home">
        <div className="container">
          <div className="flexinfo">
           <Info_menu />
            <Shools/>
          </div>
          <div className="rew">
            <Publish_post/>
            {Mydata?.role === "employee" || Mydata?.role === "admin" ? (
              <Create_menu />
            ) : null}
            <Filter_post/>
            <Bosts />
          </div>

          <Chat />
        </div>
      </div>
    </>
  );
};

export default Home;
