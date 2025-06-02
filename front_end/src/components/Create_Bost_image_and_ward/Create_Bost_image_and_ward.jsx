import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { useCookies } from "react-cookie";
import "./Create_Bost_image_and_ward.css";
import Menu from "../main_menu/Menu";
import Chat from "../chat/Chat";
import Loading_button from "../Loading_button/Loading_button";
import Info_menu from "../Info_menu/Info_menu";
import Shools from "../Shools/Shools";
import { useQueryClient } from "@tanstack/react-query";
import { useTranslation } from 'react-i18next';

const Create_Bost_image_and_ward = () => {
      const { t } = useTranslation();
  
  const queryClient = useQueryClient();
  const [cookies] = useCookies(["token"]);
  const navigate = useNavigate();
  const [Load_butt, setLoad_butt] = useState(false);
  const apiUrl = import.meta.env.VITE_API_URL;

  // الحالة لتتبع النماذج المضافة
  const [forms, setForms] = useState([{ image: null, audio: null, word: "" }]);
  const [formErrors, setFormErrors] = useState({});

  const handleAddForm = () => {
    setForms([...forms, { image: null, audio: null, word: "" }]);
    setTimeout(() => {
      const lastQuestion = document.querySelector('.form:last-child');
      lastQuestion?.scrollIntoView({ behavior: 'smooth' });
    }, 0); // إضافة نموذج جديد
  };

  const handleFormChange = (index, field, value) => {
    setForms((prevForms) =>
      prevForms.map((form, idx) =>
        idx === index ? { ...form, [field]: value } : form
      )
    );
  };

  const handleRemoveForm = (index) => {
    setForms((prevForms) => prevForms.filter((_, idx) => idx !== index)); // إزالة النموذج
  };

  const handleSubmit = (event) => {
    setLoad_butt(true);
    event.preventDefault();
    const formData = new FormData();

    forms.forEach((form, index) => {
      setLoad_butt(true);
      if (form.image) {
        formData.append(`boxes[${index}][postImage]`, form.image);
      }
      if (form.audio) {
        formData.append(`boxes[${index}][audio]`, form.audio);
      }
      formData.append(`boxes[${index}][word]`, form.word);
    });

    axios
      .post(`${apiUrl}/api/v2/post/post_1`, formData, {
        headers: {
          Authorization: `Bearer ${cookies.token}`,
        },
      })
      .then((res) => {
        queryClient.invalidateQueries(["AllPost"]);
        navigate("/");
        setLoad_butt(false);
      })
      .catch((err) => {
        if (err.response?.data?.errors) {
          const formattedErrors = {};
          err.response.data.errors.forEach((error) => {
            formattedErrors[error.path] = error.msg;
            setFormErrors(formattedErrors);
            console.log(formattedErrors)
          });
        }
        setLoad_butt(false);
      });
  };

  return (
    <div className="home">
      <div className="container">
          <div className="flexinfo">

           <Info_menu />

            <Shools/>
          </div>
        <div className="bost_image_and_ward">
          <h2>{t('Upload an image along with its audio file.')}</h2>
          <form className="unified_form">
            {forms.map((form, index) => (
              <div className="form" key={index}>
                {/* زر الإغلاق */}
                <button
                  type="button"
                  className="remove_form_btn"
                  onClick={() => handleRemoveForm(index)}
                >
                  X
                </button>
                <label className="image-box">
                  {form.image ? (
                    <img
                      src={URL.createObjectURL(form.image)}
                      alt="preview"
                      className="preview-image"
                    />
                  ) : formErrors[`files[${index}]`] ? (
                    <p className="image_error">
                      {formErrors[`files[${index}]`]}
                    </p>
                  ) : (
                    <span className="plus-sign">+</span>
                  )}
                  <input
                    type="file"
                    accept="image/*"
                    style={{ display: "none" }}
                    onChange={(e) =>
                      handleFormChange(index, "image", e.target.files[0])
                    }
                  />
                </label>

                <label className="audio-box">
                  <div className="audio-container">
                    {form.audio ? (
                      <p className="audio-name">
                        {t('Uploaded Audio:')} {form.audio.name}
                      </p>
                    ) : formErrors[`boxes[${index}][audio]`] ? (
                      <p className="image_error">
                        {formErrors[`boxes[${index}][audio]`]}
                      </p>
                    ) : (
                      <div className="upload-placeholder">
                        <span className="upload-icon">🎵</span>
                        <p className="upload-text">
                          {t('Click to upload an audio file')}
                        </p>
                      </div>
                    )}
                    <input
                      type="file"
                      accept="audio/*"
                      style={{ display: "none" }}
                      onChange={(e) =>
                        handleFormChange(index, "audio", e.target.files[0])
                      }
                    />
                  </div>
                </label>

                <div className="word_error">
                  {formErrors[`boxes[${index}][word]`] && (
                    <p className="_error">
                      {formErrors[`boxes[${index}][word]`]}
                    </p>
                  )}
                  <input
                    className="input_ward"
                    type="text"
                    value={form.word}
                    onChange={(e) =>
                      handleFormChange(index, "word", e.target.value)
                    }
                    placeholder={t("What's on your mind ?")}
                  />
                </div>
              </div>
            ))}
          </form>
          <div className="butin">
                      <button type="button" className="add-question-btn" onClick={handleAddForm}>
            <span className="icon">＋</span> {t('Another Question')}
          </button>
          <button
              type="submit"
              onClick={handleSubmit}
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
                    )}
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

        </div>
        <Chat />
      </div>
    </div>
  );
};

export default Create_Bost_image_and_ward;
