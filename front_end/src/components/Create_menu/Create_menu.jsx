import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import './Create_menu.css';
import { NavLink } from 'react-router-dom';
import { useCookies } from 'react-cookie';
import { useMyData } from '../UseMydata';
import { useTranslation } from 'react-i18next';
const Create_menu = () => {
  const { t } = useTranslation();
  const [showMenu, setShowMenu] = useState(false);
  // const [Mydata, SetMydata] = useState({});
  const { data: Mydata} = useMyData();
  const [cookies] = useCookies(['token']);

  const menuRef = useRef(null);
  const buttonRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        menuRef.current &&
        !menuRef.current.contains(event.target) &&
        buttonRef.current &&
        !buttonRef.current.contains(event.target)
      ) {
        setShowMenu(false);
      }
    };

    if (showMenu) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showMenu]);

  const toggleMenu = () => {
    setShowMenu((prev) => !prev);
  };










  const [tooltip, setTooltip] = useState({ visible: false, text: '', x: 0, y: 0 });

  const handleMouseEnter = (e, text) => {
    setTooltip({ visible: true, text, x: e.clientX, y: e.clientY });
  };

  const handleMouseLeave = () => {
    setTooltip({ ...tooltip, visible: false });
  };

  const handleMouseMove = (e) => {
    if (tooltip.visible) {
      setTooltip((prev) => ({ ...prev, x: e.clientX, y: e.clientY }));
    }
  };

  const links = [
    {
      to: "/Create_Bost_Video_and_image",
      text: t('Text, image or video.'),
      tooltip: t('Share images, videos, and text together. Ideal for explaining ideas or sharing visual and educational content.')
    },
    {
      to: "/create_bost_choose_the_correct_answer",
      text: t('Choose The Correct Answer'),
      tooltip: t('Interactive quiz with multiple-choice questions. Suitable for educational tests and engagement.')
    },
    {
      to: "/create_bost_image_and_answer",
      text: t('Based on the image, select the correct answer.'),
      tooltip: t('Display an image with multiple answer choices to select the correct one. Ideal for testing visual comprehension.')
    },
    {
      to: "/create_bost_image_and_ward",
      text: t('Image And Word'),
      tooltip: t('Display an image with a word pronunciation upon clicking. Useful for teaching vocabulary.')
    },
    {
      to: "/create_bost_true_or_false",
      text: t('True or false.'),
      tooltip: t("Present a statement and determine if it's true or false. Perfect for testing concepts and information.")
    },
    {
      to: "/Create_Bost_Ifrem",
      text: "<iframe>/<script>",
      tooltip: t('Embed external content such as YouTube videos or interactive tools using an iframe.')
    }
  ];
  const apiUrl = import.meta.env.VITE_API_URL;
  
  

  return (
    <div className="create_menu">
      <div className="img_create" >
<img
  src={
    Mydata.profilImage
      ? Mydata.profilImage.startsWith("http")
        ? Mydata.profilImage
        : `${apiUrl}/user/${Mydata.profilImage}`
      : "/image/pngegg.png"
  }
  alt={`Image of ${Mydata.name}`}
/>
        <p>{t('Please choose from the list the')} {Mydata.name}</p>
      </div>

            <button
              type="submit"
              onClick={toggleMenu}
              className="websit_button"
            >
              {t('Create Post')}
            </button>




      <div className="menus" style={{ display: showMenu ? 'block' : 'none' }} ref={menuRef} >
      {links.map((link, index) => (
        <NavLink
          key={index}
          to={link.to}
          className="links"
          onMouseEnter={(e) => handleMouseEnter(e, link.tooltip)}
          onMouseLeave={handleMouseLeave}
          onMouseMove={handleMouseMove}
        >
          <p>{link.text}</p>
        </NavLink>
      ))}

      {tooltip.visible && (
        <div
          className="tooltip"
          style={{
            width:"400px",
            position: 'fixed',
            top: tooltip.y - 70,
            left: tooltip.x + -10,
            backgroundColor: '#1c1c1d',
            color: '#fff',
            padding: '5px 10px',
            borderRadius: '8px',
            pointerEvents: 'none',
            fontSize: '12px',
            zIndex: 9999,
          }}
        >
          {tooltip.text}
          {/* {description.text} */}
        </div>
      )}
    </div>
    </div>
  );
};

export default Create_menu;
