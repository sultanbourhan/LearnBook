import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { useCookies } from "react-cookie";
import "./Publish_post.css"

import { useNavigate } from "react-router-dom";
import { useMyData } from '../UseMydata';
import { useQueryClient } from "@tanstack/react-query";
import { useTranslation } from 'react-i18next';
const Publish_post = () => {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const {data:MyData} = useMyData();
  const [cookies, setCookies] = useCookies(["token"]);




const apiUrl = import.meta.env.VITE_API_URL;




  const [formErrors, setFormErrors] = useState({});
  const navigate = useNavigate();

  const [qus1, Setrqs1] = useState("");
  const [Load_butt, setLoad_butt] = useState(false);

  // ✅ تخزين الملفات بشكل صحيح
  const [imageFiles, setImageFiles] = useState([]);
  const [videoFiles, setVideoFiles] = useState([]);

  const imageInputRef = useRef(null);
  const videoInputRef = useRef(null);

  // ✅ معالجة رفع الصور المتعددة
  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    if (files.length > 0) {
      setImageFiles((prev) => [...prev, ...files]);
    }
  };

  // ✅ معالجة رفع الفيديوهات المتعددة
  const handleVideoChange = (e) => {
    const files = Array.from(e.target.files);
    if (files.length > 0) {
      setVideoFiles((prev) => [...prev, ...files]);
    }
  };

  // ✅ حذف صورة محددة
  const removeImage = (index) => {
    setImageFiles((prev) => prev.filter((_, i) => i !== index));
  };

  // ✅ حذف فيديو محدد
  const removeVideo = (index) => {
    setVideoFiles((prev) => prev.filter((_, i) => i !== index));
  };

  // ✅ تعديل `handleSubmit` لإرسال عدة صور وفيديوهات
  const handleSubmit = async (e) => {
    setLoad_butt(true);
    e.preventDefault();
    const formData = new FormData();

    if (qus1) {
      formData.append("writing", qus1);
    }

    // ✅ إضافة جميع الصور بشكل صحيح
    imageFiles.forEach((file) => formData.append("img_post", file));

    // ✅ إضافة جميع الفيديوهات بشكل صحيح
    videoFiles.forEach((file) => formData.append("video_post", file));

    // ✅ طباعة `FormData` للتحقق
    for (let pair of formData.entries()) {
      // console.log(pair[0], pair[1]);
    }

    try {
      const response = await axios.post(
        `${apiUrl}/api/v2/post/post`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${cookies.token}`,
            "Content-Type": "multipart/form-data",
          },
        }
      );

queryClient.invalidateQueries(["AllPost"]);
      // ✅ تصفية الفورم بعد الإرسال
      setImageFiles([]);
      setVideoFiles([]);
      Setrqs1("");
      imageInputRef.current.value = "";
      videoInputRef.current.value = "";
      setLoad_butt(false);
    } catch (err) {
      if (err.response?.data?.errors) {
        const formattedErrors = {};
        err.response.data.errors.forEach((error) => {
          formattedErrors[error.path] = error;
        });
        setFormErrors(formattedErrors);
      }
      setLoad_butt(false);
    }
  };








  const [text, setText] = useState("");
  const textareaRef = useRef(null);

  const handleChange = (e) => {
    setText(e.target.value);

    // اضبط الارتفاع حسب المحتوى، بس خليه ما ينزل عن 40px
    const minHeight = 40;
    textareaRef.current.style.height = "40px";
    textareaRef.current.style.height = Math.max(textareaRef.current.scrollHeight, minHeight) + "px";
  };

  useEffect(() => {
    if (textareaRef.current) {
      const minHeight = 40;
      textareaRef.current.style.height = "40px";
      textareaRef.current.style.height = Math.max(textareaRef.current.scrollHeight, minHeight) + "px";
    }
  }, []);

  return (
    <div className='Publish_post'>
      <div className="info_publish">
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
        <textarea type="text" name="" id="" placeholder={t("What are you thinking today?")}
          value={qus1}
          ref={textareaRef}
          style={{
            minHeight: "40px", height: "40px"

          }}
          onChange={(e) => { Setrqs1(e.target.value); handleChange(e) }} />
        <button
          className='websit_button'
          type="submit"
          onClick={handleSubmit}>Post</button>
      </div>

      <div className="icon_publish">
        <div className="icon_text_publish"
          onClick={() => videoInputRef.current.click()}>
          <svg xmlns="http://www.w3.org/2000/svg"  viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-square-play-icon lucide-square-play"><rect width="18" height="18" x="3" y="3" rx="2" /><path d="m9 8 6 4-6 4Z" /></svg>
          <p>{t('Video')}</p>
        </div>
        <div className="icon_text_publish"
          onClick={() => imageInputRef.current.click()}>
<svg  xmlns="http://www.w3.org/2000/svg"  viewBox="0 0 24 24"  fill="none"  stroke="currentColor"  strokeWidth="2"  strokeLinecap="round"  strokeLinejoin="round" ><path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M15 8h.01" /><path d="M3 6a3 3 0 0 1 3 -3h12a3 3 0 0 1 3 3v12a3 3 0 0 1 -3 3h-12a3 3 0 0 1 -3 -3v-12z" /><path d="M3 16l5 -5c.928 -.893 2.072 -.893 3 0l5 5" /><path d="M14 14l1 -1c.928 -.893 2.072 -.893 3 0l3 3" /></svg>
          <p>{t('Photo')}</p>
        </div>
        <div className="icon_text_publish">
<svg  xmlns="http://www.w3.org/2000/svg"  viewBox="0 0 24 24"  fill="none"  stroke="currentColor"  strokeWidth="2"  strokeLinecap="round"  strokeLinejoin="round"  ><path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M14 3v4a1 1 0 0 0 1 1h4" /><path d="M17 21h-10a2 2 0 0 1 -2 -2v-14a2 2 0 0 1 2 -2h7l5 5v11a2 2 0 0 1 -2 2z" /><path d="M9 7l1 0" /><path d="M9 13l6 0" /><path d="M13 17l2 0" /></svg>        
  <p>{t('File')}</p>
        </div>
        <input
          type="file"
          accept="image/*"
          ref={imageInputRef}
          onChange={handleImageChange}
          style={{ display: "none" }}
          multiple
        />

        {/* إدخال مخفي للفيديو */}
        <input
          type="file"
          accept="video/*"
          ref={videoInputRef}
          onChange={handleVideoChange}
          style={{ display: "none" }}
          multiple
        />
      </div>
      {/* ✅ عرض الصور والفيديوهات بعد الرفع */}
      <div className="img_vid_flex">
        {[
          ...imageFiles.map((img) => ({ type: "image", file: img })),
          ...videoFiles.map((video) => ({ type: "video", file: video })),
        ]
          .slice(0, 4)
          .map(({ type, file }, index) => (
            <div key={index} style={{ position: "relative", width: "calc(50% - 1px)", height: '200px' }}>
              {type === "image" ? (
                <img
                  src={URL.createObjectURL(file)}
                  alt="Selected"
                  style={{ width: "100%", height: '200px' }}
                />
              ) : (
                <video
                  src={URL.createObjectURL(file)}
                  controls
                  style={{ width: "100%", height: '200px' }}
                />
              )}
              <button
                onClick={() =>
                  type === "image"
                    ? removeImage(index)
                    : removeVideo(index - imageFiles.length)
                }
                className="remove-btn"
              >
                ×
              </button>

              {index === 3 && (imageFiles.length + videoFiles.length) > 4 && (  // هنا شرط الظهور ب 4
                <div
                  style={{
                    position: "absolute",
                    top: 0,
                    left: 0,
                    width: "100%",
                    height: "100%",
                    backgroundColor: "rgba(0, 0, 0, 0.6)",
                    color: "white",
                    fontSize: "2rem",
                    fontWeight: "bold",
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    borderRadius: "8px",
                    userSelect: "none",
                  }}
                >
                  +{(imageFiles.length + videoFiles.length) - 4}
                </div>
              )}
            </div>
          ))}
      </div>


    </div>
  )
}

export default Publish_post