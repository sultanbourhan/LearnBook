import React, { useState } from 'react';
import "./Create_Bost_Ifrem.css";
import Menu from '../main_menu/Menu';
import Chat from '../chat/Chat';
import { useNavigate } from 'react-router-dom';
import { useCookies } from 'react-cookie';
import axios from 'axios';
import Loading_button from "../Loading_button/Loading_button";
import Info_menu from "../Info_menu/Info_menu";
import Shools from "../Shools/Shools";
import { useQueryClient } from "@tanstack/react-query";
import { useTranslation } from 'react-i18next';
const Create_Bost_Ifrem = () => {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const Navigate = useNavigate();
  const [cookies] = useCookies(["token"]);
  const [errors, setErrors] = useState({});
  const [url,SetUrl] = useState("");
  const [des,SetDes] = useState("");
  const [dimensions,Setdimensions] = useState("square");
  const [Load_butt, setLoad_butt] = useState(false);
  

  const Ifrem = ()=>{
    const apiUrl = import.meta.env.VITE_API_URL;
    setLoad_butt(true);
    axios.post(`${apiUrl}/api/v2/post/post_6`,{
      url,
      des,
      dimensions
    },{
      headers: {
        Authorization: `Bearer ${cookies.token}`,
      },
    }).then((res)=>{
      console.log(res)
      Navigate("/")
      setLoad_butt(false);
      queryClient.invalidateQueries(["AllPost"]);
    }).catch((err)=>{
      if (err.response?.data?.errors) {
        const formattedErrors = {};
        err.response.data.errors.forEach((error) => {
          formattedErrors[error.path] = error.msg;
          setErrors(formattedErrors);
          console.log(formattedErrors)
        });
      }
      setLoad_butt(false);
    })
  }
  

  return (
    <div className="home">
      <div className="container">
          <div className="flexinfo">

           <Info_menu />

            <Shools/>
          </div>
        <div className="Create_Bost_Ifrem">
          <h2>{t('Create Bost Ifrem')}</h2>

          <div className="all_form">
            <div className="diverrors">
            {errors[`url`] && (
                        <p className="errors">{errors[`url`]}</p>
                      )}
              <input type="text" placeholder={t('Enter Your URL')} value={url} onChange={(e)=>SetUrl(e.target.value)}/>
            </div>

              <textarea type="text" placeholder={t('Enter you description.')} value={des} onChange={(e)=>SetDes(e.target.value)}>
                
              </textarea>
              <div className='dimensions'>
                <h3>{t('Display method')}</h3>
                <div className='distance'>
                  <div className={ `linear ${dimensions === "linear" ? "act" : null} `} onClick={()=> Setdimensions("linear")}>
                      <div className='pencil'></div>
                      <p>16/9</p>
                  </div>
                   <div className={`square  ${dimensions === "square" ? "act" : null}` } onClick={()=> Setdimensions("square")}>
                      <div className='pencil'></div>
                      <p>1/1</p>
                  </div>
                  <div className={ `broad  ${dimensions === "broad" ? "act" : null}`} onClick={()=> Setdimensions("broad")}>
                      <div className='pencil'></div>
                      <p>9/16</p>
                  </div>
                </div>
                
              </div>
          </div>
                <button
              type="submit"
              onClick={Ifrem}
              className="button"
              style={{
                opacity: Load_butt ? 0.6 : 1,
                pointerEvents: Load_butt ? "none" : "auto",
                position: "relative",
                width: t("width")
              }}
            >
              <div className="bg"></div>

              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 342 208"
                height="208"
                width="342"
                className="splash"
              >
                <path
                  strokeLinecap="round"
                  strokeWidth="3"
                  d="M54.1054 99.7837C54.1054 99.7837 40.0984 90.7874 26.6893 97.6362C13.2802 104.485 1.5 97.6362 1.5 97.6362"
                />
                <path
                  strokeLinecap="round"
                  strokeWidth="3"
                  d="M285.273 99.7841C285.273 99.7841 299.28 90.7879 312.689 97.6367C326.098 104.486 340.105 95.4893 340.105 95.4893"
                />
                {/* باقي عناصر الـ SVG نفسها بس مغلقة بشكل صحيح وتعديل style/props حسب JSX */}
                {/* لتوفير المساحة يمكنني أكمّل باقي الـ <path> إن حبيت */}
              </svg>

              <div className="wrap">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 221 42"
                  height="42"
                  width="221"
                  className="path"
                >
                  <path
                    strokeLinecap="round"
                    strokeWidth="3"
                    d="M182.674 2H203C211.837 2 219 9.16344 219 18V24C219 32.8366 211.837 40 203 40H18C9.16345 40 2 32.8366 2 24V18C2 9.16344 9.16344 2 18 2H47.8855"
                  />
                </svg>

                <div className="outline"></div>

                <div className="content">
                  <span className="char state-1">
                    {Load_butt ? (
                      <Loading_button />
                    ) : (
                      
                        <span>
                          {t("Post")}
                        </span>
                      )
                    }
                  </span>

                  <div className="icon">
                    <div></div>
                  </div>

                  {/* <span className="char state-2">
            {['P', 'o', 's', 't', 'i', 'n', 'g', '.', '.', '.'].map((char, i) => (
              <span key={i} data-label={char} style={{ '--i': i + 1 }}>
                {char}
              </span>
            ))}
          </span> */}
                </div>
              </div>
            </button>

        </div>
        <Chat />
      </div>
    </div>
  );
};

export default Create_Bost_Ifrem;
