import React from 'react'
import "./Explore.css";
import Menu from '../main_menu/Menu';
import Bosts from '../bosts/Bosts';
import Chat from '../chat/Chat';
import Info_menu from "../Info_menu/Info_menu";
import Shools from "../Shools/Shools";
const Explore = () => {
  return (
    <>
    <div className='explore'>
      <div className='container'>
          <div className="flexinfo">

           <Info_menu />

            <Shools/>
          </div>
        <Bosts/>
        <Chat/>
      </div>
    </div>
    </>
  )
}

export default Explore