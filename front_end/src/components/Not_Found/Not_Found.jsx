import {useState , useEffect} from 'react'
import "./Not_Found.css"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import {
  faGraduationCap, // قبعة التخرج
  faBook,          // كتاب
  faUsers,   // أشخاص (مجموعة)
  faHouse        
} from "@fortawesome/free-solid-svg-icons";

import { useNavigate } from "react-router-dom";
import { useTranslation } from 'react-i18next';
export default function Not_Found() {
const { t } = useTranslation();
    const navigate = useNavigate();

  return (
    <div className='Not_Found'>
      <div className='box_Not_Found'>
        <h1>404</h1>
        <h2>{t('Page Not Found')}</h2>
        <p>{t("Oops! The learning resource you're looking for seems to have wandered off. Let's get you back to your educational journey!")}</p>
        <div className='icon'>
          <FontAwesomeIcon icon={faGraduationCap} style={{ "--i": 1 }}/>
          <FontAwesomeIcon icon={faBook} style={{ "--i": 2 }} />
          <FontAwesomeIcon icon={faUsers} style={{ "--i": 3 }} />
        </div>
        <button
        className='websit_button'  
        onClick={()=> navigate("/")}>
          <FontAwesomeIcon icon={faHouse} />
          <p>{t('Back to Home Page')}</p>
        </button>
      </div>
    </div>
  )
}
