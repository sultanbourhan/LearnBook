import React, { useState, useEffect } from 'react';
import './Info_menu.css'
import { NavLink } from 'react-router-dom';
import { useUser } from '../Context';
import axios from 'axios';
import { useCookies } from "react-cookie";
import { useNavigate } from 'react-router-dom';
import Loading_img from '../Loading_img/Loading_img';
import { useMyData } from '../UseMydata';
import { useQueryClient } from "@tanstack/react-query";
import Loading_Filter_post from "../Loading_Filter_post/Loading_Filter_post";
import { useTranslation } from 'react-i18next';
const Info_menu = () => {
    const { t } = useTranslation();
    // {t('')}
    const queryClient = useQueryClient();
    const { setUserTheme } = useUser();
    const { data: MyData ,isLoading,isFetching} = useMyData();
    const [cookies, setCookies] = useCookies(["token"]);
    const Navigate = useNavigate();
    const apiUrl = import.meta.env.VITE_API_URL;

    const [isToggled, setIsToggled] = useState(() => {
        const storedTheme = localStorage.getItem('theme');
        return storedTheme === 'dark';
    });

    useEffect(() => {
        const themeColorMeta = document.querySelector('meta[name="theme-color"]');

        if (isToggled) {
            document.body.classList.add('root_da');
            localStorage.setItem('theme', 'dark');
            if (themeColorMeta) themeColorMeta.setAttribute('content', '#1c1c1d'); // لون الدارك
        } else {
            document.body.classList.remove('root_da');
            localStorage.setItem('theme', 'light');
            if (themeColorMeta) themeColorMeta.setAttribute('content', '#f0edf5'); // لون اللايت
        }
    }, [isToggled]);


    const handleToggle = () => {
        setIsToggled((prev) => !prev);
        setUserTheme((prev) => !prev);
    };

    const logout = () => {
        axios.put(`${apiUrl}/api/v2/auth/logout`, {}, {
            headers: {
                Authorization: `Bearer ${cookies.token}`,
            }
        }).then((res) => {
            queryClient.removeQueries(["myData"]);
            queryClient.removeQueries(["AllUser"]);
            setCookies("token", "");
            window.localStorage.removeItem("token");
            Navigate('/signandlog')
        }).catch((err) => {
            console.log({ "error": err })
        })
    }


    const [showMore, setShowMore] = useState(false);

    const handleMoreClick = () => {
        setShowMore(!showMore);
    };
    return (
        <div className="mobile-toggle">
            <div className="info_menu">
                {isLoading ? (<Loading_img />) : (
                    <div className="info_user">
                        <img
                            src={
                                MyData?.profilImage
                                    ? MyData?.profilImage.startsWith("http")
                                        ? MyData?.profilImage
                                        : `${apiUrl}/user/${MyData?.profilImage}`
                                    : "/image/pngegg.png"
                            }
                            alt={`Image of ${MyData?.name}`}
                        />
                        <div className="info_data">
                            <p>{MyData?.name}</p>
                            <span>{MyData?.email}</span>
                        </div>
                    </div>
                )}

                <div className="info_link">
                    <NavLink to="/profile" className={({ isActive }) => `navbar_link${isActive ? ' active' : ''}`}>
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M4 22C4 17.5817 7.58172 14 12 14C16.4183 14 20 17.5817 20 22H18C18 18.6863 15.3137 16 12 16C8.68629 16 6 18.6863 6 22H4ZM12 13C8.685 13 6 10.315 6 7C6 3.685 8.685 1 12 1C15.315 1 18 3.685 18 7C18 10.315 15.315 13 12 13ZM12 11C14.21 11 16 9.21 16 7C16 4.79 14.21 3 12 3C9.79 3 8 4.79 8 7C8 9.21 9.79 11 12 11Z"></path></svg>
                        <p>{t('Profile')}</p>
                    </NavLink>

                    <NavLink to="/groups" className={({ isActive }) => `navbar_link${isActive ? ' active' : ''}`}>
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M2 22C2 17.5817 5.58172 14 10 14C14.4183 14 18 17.5817 18 22H16C16 18.6863 13.3137 16 10 16C6.68629 16 4 18.6863 4 22H2ZM10 13C6.685 13 4 10.315 4 7C4 3.685 6.685 1 10 1C13.315 1 16 3.685 16 7C16 10.315 13.315 13 10 13ZM10 11C12.21 11 14 9.21 14 7C14 4.79 12.21 3 10 3C7.79 3 6 4.79 6 7C6 9.21 7.79 11 10 11ZM18.2837 14.7028C21.0644 15.9561 23 18.752 23 22H21C21 19.564 19.5483 17.4671 17.4628 16.5271L18.2837 14.7028ZM17.5962 3.41321C19.5944 4.23703 21 6.20361 21 8.5C21 11.3702 18.8042 13.7252 16 13.9776V11.9646C17.6967 11.7222 19 10.264 19 8.5C19 7.11935 18.2016 5.92603 17.041 5.35635L17.5962 3.41321Z"></path></svg>
                        <p> {t('Groups')}</p>
                    </NavLink>
                    <NavLink to="/mycourses" className={({ isActive }) => `navbar_link${isActive ? ' active' : ''}`}>
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"  ><path stroke="none" d="M0 0h24v24H0z" fill="none" /><path d="M3 19a9 9 0 0 1 9 0a9 9 0 0 1 9 0" /><path d="M3 6a9 9 0 0 1 9 0a9 9 0 0 1 9 0" /><path d="M3 6l0 13" /><path d="M12 6l0 13" /><path d="M21 6l0 13" /></svg>
                        <p> {t('My Courses')}</p>
                    </NavLink>
                    <NavLink to="/bookmark" className={({ isActive }) => `navbar_link${isActive ? ' active' : ''}`}>
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"  ><path stroke="none" d="M0 0h24v24H0z" fill="none" /><path d="M15 10v11l-5 -3l-5 3v-11a3 3 0 0 1 3 -3h4a3 3 0 0 1 3 3z" /><path d="M11 3h5a3 3 0 0 1 3 3v11" /></svg>
                        <p> {t('Saved')}</p>
                    </NavLink>



                    <div className={`extra-options ${showMore ? 'show' : ''}`}>
                        <div className="navbar_link icon_filter">
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" ><path stroke="none" d="M0 0h24v24H0z" fill="none" /><path d="M14 6m-2 0a2 2 0 1 0 4 0a2 2 0 1 0 -4 0" /><path d="M4 6l8 0" /><path d="M16 6l4 0" /><path d="M8 12m-2 0a2 2 0 1 0 4 0a2 2 0 1 0 -4 0" /><path d="M4 12l2 0" /><path d="M10 12l10 0" /><path d="M17 18m-2 0a2 2 0 1 0 4 0a2 2 0 1 0 -4 0" /><path d="M4 18l11 0" /><path d="M19 18l1 0" /></svg>
                            <p> {t('Filter')}</p>
                        </div>
                        <div className="navbar_link" onClick={handleToggle}>
                            {isToggled ? (
                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                                    <path d="M12 18C8.68629 18 6 15.3137 6 12C6 8.68629 8.68629 6 12 6C15.3137 6 18 8.68629 18 12C18 15.3137 15.3137 18 12 18ZM12 16C14.2091 16 16 14.2091 16 12C16 9.79086 14.2091 8 12 8C9.79086 8 8 9.79086 8 12C8 14.2091 9.79086 16 12 16ZM11 1H13V4H11V1ZM11 20H13V23H11V20ZM3.51472 4.92893L4.92893 3.51472L7.05025 5.63604L5.63604 7.05025L3.51472 4.92893ZM16.9497 18.364L18.364 16.9497L20.4853 19.0711L19.0711 20.4853L16.9497 18.364ZM19.0711 3.51472L20.4853 4.92893L18.364 7.05025L16.9497 5.63604L19.0711 3.51472ZM5.63604 16.9497L7.05025 18.364L4.92893 20.4853L3.51472 19.0711L5.63604 16.9497ZM23 11V13H20V11H23ZM4 11V13H1V11H4Z"></path>
                                </svg>
                            ) : (
                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" ><path stroke="none" d="M0 0h24v24H0z" fill="none" /><path d="M12 3c.132 0 .263 0 .393 0a7.5 7.5 0 0 0 7.92 12.446a9 9 0 1 1 -8.313 -12.454z" /><path d="M17 4a2 2 0 0 0 2 2a2 2 0 0 0 -2 2a2 2 0 0 0 -2 -2a2 2 0 0 0 2 -2" /><path d="M19 11h2m-1 -1v2" /></svg>
                            )}
                            <p>{isToggled ? 'Light Mode' : 'Dark Mode'}</p>
                        </div>
                        <div className="navbar_link logout" onClick={logout}>
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M12 22C6.47715 22 2 17.5228 2 12C2 6.47715 6.47715 2 12 2C15.2713 2 18.1757 3.57078 20.0002 5.99923L17.2909 5.99931C15.8807 4.75499 14.0285 4 12 4C7.58172 4 4 7.58172 4 12C4 16.4183 7.58172 20 12 20C14.029 20 15.8816 19.2446 17.2919 17.9998L20.0009 17.9998C18.1765 20.4288 15.2717 22 12 22ZM19 16V13H11V11H19V8L24 12L19 16Z"></path>
                            </svg>
                            <p> {t('Log Out')}</p>
                        </div>
                    </div>



                    <div className={`navbar_link more ${showMore ? 'active' : ''}`} onClick={handleMoreClick}>
                        <p> {t('More')}</p>
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 24 24"
                            fill="currentColor"
                            style={{
                                transform: showMore ? 'rotate(-90deg)' : 'rotate(0deg)',
                                transition: 'transform 0.3s ease',
                            }}
                        >
                            <path d="M13.1717 12.0007L8.22192 7.05093L9.63614 5.63672L16.0001 12.0007L9.63614 18.3646L8.22192 16.9504L13.1717 12.0007Z" />
                        </svg>
                    </div>
                    {/* نحتفظ بالعناصر دائماً، ونضيف كلاس "show" حسب الحالة */}

                </div>

            </div>
             
        </div>


    )
}

export default Info_menu