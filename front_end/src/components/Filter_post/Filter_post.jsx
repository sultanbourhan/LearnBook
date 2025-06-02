import { useEffect, useState, useRef } from "react";
import './Filter_post.css'
import { useUser } from "../Context";
import { useTranslation } from 'react-i18next';
const Filter_post = () => {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState('All')

 const { type_post, setType_post } = useUser();
 const { type_post_role ,  setType_post_role} = useUser();

  const handleChange = (e) => {
    const { t } = useTranslation();
    setType_post(e.target.value);
  };

  useEffect(() => {
    
  }, []);

  const tabs = [
    {
      button_name:t('All'),
      button_role:""
    },
    {
      button_name:t('Schools'),
      button_role:"employee"
    },
    {
      button_name:t('Users'),
      button_role:"user"
    }
  ]
  return (
    <div className='Filter_post'>
      <div className="button_filter">
        {tabs.map((tab,index) => (
          <button 

            key={index}
            onClick={() => {setActiveTab(tab.button_name) ; setType_post_role(tab.button_role)
              ; tab.button_name === "Users" ? setType_post(""): null
            }}
            className={`websit_button ${activeTab === tab.button_name ? 'active' : ''}`}
          >
            {tab.button_name}
          </button>
        ))}
      </div>
      <div className="select">
        <span   style={{
          opacity: type_post_role === "user" ? "0.5" : "1",
          }}>{t("Type of posts")}</span>
          <select
  value={type_post}
  onChange={handleChange}
  disabled={type_post_role === "user"}
  style={{
    cursor: type_post_role === "user" ? "not-allowed" : "pointer",
    opacity: type_post_role === "user" ? "0.5" : "1",
  }}
>
      <option value="">{t('All Posts')}</option>
      <option value="post">{t('Text, image or video')}</option>
      <option value="post_2">{t('Choose The Correct Answer')}</option>
      <option value="post_4">{t('Based on the image, select the correct answer')}</option>
      <option value="post_1">{t('Image And Word')}</option>
      <option value="post_3">{t('True or false')}</option>
      <option value="post_6">iframe/script</option>
    </select>
      </div>
    </div>
  )
}

export default Filter_post