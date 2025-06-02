import { useState, useRef } from "react";
import "./Create_Bost_Video_End_Image.css";
import Menu from "../main_menu/Menu";
import Chat from "../chat/Chat";
import { useNavigate } from "react-router-dom";
import { useCookies } from "react-cookie";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faImage, faVideo } from "@fortawesome/free-solid-svg-icons";
import axios from "axios";
import Loading_button from "../Loading_button/Loading_button";
import Info_menu from "../Info_menu/Info_menu";
import Shools from "../Shools/Shools";
import { useQueryClient } from "@tanstack/react-query";
import { useTranslation } from 'react-i18next';
const Create_Bost_Video_and_image = () => {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const [formErrors, setFormErrors] = useState({});
  const [cookies] = useCookies(["token"]);
  const navigate = useNavigate();

  const [qus1, Setrqs1] = useState("");
  const [Load_butt, setLoad_butt] = useState(false);

  // ✅ تخزين الملفات بشكل صحيح
  const [imageFiles, setImageFiles] = useState([]);
  const [videoFiles, setVideoFiles] = useState([]);

  const apiUrl = import.meta.env.VITE_API_URL;

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

      console.log("تم الإرسال:", response.data);
queryClient.invalidateQueries(["AllPost"]);
      // ✅ تصفية الفورم بعد الإرسال
      setImageFiles([]);
      setVideoFiles([]);
      Setrqs1("");
      imageInputRef.current.value = "";
      videoInputRef.current.value = "";

      navigate("/");
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

  return (
    <div className="home">
      <div className="container">
          <div className="flexinfo">

           <Info_menu />

            <Shools/>
          </div>
        <div className="Create_Bost_Video_and_image">
          <h2>{t('Text, image or video.')}</h2>
          <div className="all_form">
            {formErrors[""] && <p className="_error">{formErrors[""].msg}</p>}
            <div className="form">
              <textarea
                type="text"
                placeholder={t("What's on your mind ?")}
                value={qus1}
                onChange={(e) => Setrqs1(e.target.value)}
              ></textarea>

              {/* أيقونات رفع الملفات */}
              <div className="iconvideandimg">
                <FontAwesomeIcon
                  className="icon_v_m"
                  icon={faImage}
                  onClick={() => imageInputRef.current.click()}
                  style={{ cursor: "pointer", marginRight: "15px" }}
                />
                <FontAwesomeIcon
                  className="icon_v_m"
                  icon={faVideo}
                  onClick={() => videoInputRef.current.click()}
                  style={{ cursor: "pointer" }}
                />
              </div>

              {/* إدخال مخفي للصورة */}
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
      <div key={index} style={{ position: "relative", width: "calc(50% - 15px)" }}>
        {type === "image" ? (
          <img
            src={URL.createObjectURL(file)}
            alt="Selected"
            style={{ width: "100%", borderRadius: "8px" }}
          />
        ) : (
          <video
            src={URL.createObjectURL(file)}
            controls
            style={{ width: "100%", borderRadius: "8px" }}
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
        <Chat />
      </div>
    </div>
  );
};

export default Create_Bost_Video_and_image;
