import React, { useState } from 'react';
import "./Create_Bost_image_and_answer.css";
import Menu from '../main_menu/Menu';
import Chat from '../chat/Chat';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { useCookies } from 'react-cookie';
import Loading_button from "../Loading_button/Loading_button";
import Info_menu from "../Info_menu/Info_menu";
import Shools from "../Shools/Shools";
import { useQueryClient } from "@tanstack/react-query";
import { useTranslation } from 'react-i18next';
const Create_Bost_image_and_answer = () => {
  const { t } = useTranslation();
  const apiUrl = import.meta.env.VITE_API_URL;
  const queryClient = useQueryClient();
  const [questions, setQuestions] = useState([
    { img: null, word_1: "", word_2: "", word_3: "", word_4: "", correctWord: "" ,question: ""}
  ]);
  const [formErrors, setFormErrors] = useState({});
  const [cookies] = useCookies(['token']);
  const navigate = useNavigate();

  const [Load_butt, setLoad_butt] = useState(false);

  const addNewQuestion = () => {
    setQuestions([...questions, { img: null, word_1: "", word_2: "", word_3: "", word_4: "", correctWord: "" ,question: ""}]);
    setTimeout(() => {
      const lastQuestion = document.querySelector('.form:last-child');
      console.log(lastQuestion)
      lastQuestion?.scrollIntoView({ behavior: 'smooth' });
    }, );
  };
    const handleRemoveForm = (index) => {
    setQuestions((prevForms) => prevForms.filter((_, idx) => idx !== index)); // إزالة النموذج
  };

  const handleImageChange = (e, index) => {
    const file = e.target.files[0];
    if (file) {
      const updatedQuestions = [...questions];
      updatedQuestions[index].img = file;
      setQuestions(updatedQuestions);
    }
  };

  const handleInputChange = (questionIndex, field, value) => {
    const updatedQuestions = [...questions];
    updatedQuestions[questionIndex][field] = value;
    setQuestions(updatedQuestions);
  };

  const handleSubmit = async (event) => {
    setLoad_butt(true);
    event.preventDefault();
  
    try {
      const formData = new FormData();
  
      // تحضير الأسئلة وإجاباتها مع ترتيب عشوائي
      const preparedQuestions = questions.map((q) => {
        const answers = [q.word_1, q.word_2, q.word_3, q.word_4];
        const correctAnswer = q.word_1;
  
        // إزالة الإجابة الصحيحة وخلط الباقي
        const otherAnswers = answers.filter(answer => answer !== correctAnswer);
  
        const shuffleArray = (array) => {
          for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
          }
        };
  
        shuffleArray(otherAnswers);
  
        // إدخال الإجابة الصحيحة في مكان عشوائي
        const randomIndex = Math.floor(Math.random() * 4);
        otherAnswers.splice(randomIndex, 0, correctAnswer);
  
        const [word_1, word_2, word_3, word_4] = otherAnswers;
  
        return {
          question: q.question,  // إضافة السؤال
          word_1,
          word_2,
          word_3,
          word_4,
          correctWord: correctAnswer,
          img: q.img || null  // التأكد من إضافة الصورة إذا كانت موجودة
        };
      });


  
      // تعبئة البيانات في formData
      preparedQuestions.forEach((q, index) => {
        formData.append(`questions[${index}][question]`, q.question);
        if (q.img) {
          formData.append(`questions[${index}][img]`, q.img);
        }
        formData.append(`questions[${index}][word_1]`, q.word_1);
        formData.append(`questions[${index}][word_2]`, q.word_2);
        formData.append(`questions[${index}][word_3]`, q.word_3);
        formData.append(`questions[${index}][word_4]`, q.word_4);
        formData.append(`questions[${index}][correctWord]`, q.correctWord);
      });
  for (let pair of formData.entries()) {
  console.log(pair[0], pair[1]);
}
      // إرسال البيانات إلى الخادم
      await axios.post(`${apiUrl}/api/v2/post/post_4`, formData, {
        headers: {
          Authorization: `Bearer ${cookies.token}`,
        },
      });
  
      navigate('/');
      setLoad_butt(false);
      queryClient.invalidateQueries(["AllPost"]);
    } catch (err) {
      console.error(err)
      if (err.response?.data?.errors) {
        const formattedErrors = {};
        err.response.data.errors.forEach(error => {
          formattedErrors[error.path] = error.msg;
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
        <div className="Create_Bost_image_and_answer">
          <h2>{t('Based on the image, select the correct answer.')}</h2>
          <form className="unified_form" onSubmit={handleSubmit}>
            {questions.map((question, index) => (
              <div key={index} className="form">
                <button
                  type="button"
                  className="remove_form_btn"
                  onClick={() => handleRemoveForm(index)}
                >
                  X
                </button>
                    <input
                      className="question"
                      type="text"
                      placeholder={t("Question")}
                      value={question.question}
                      onChange={(e) => handleInputChange(index, "question", e.target.value)}
                    />  
                <div className='form_flex'>
                  <label className="image-box">
                  {question.img ? (
                    <img src={URL.createObjectURL(question.img)} alt="preview" className="preview-image" />
                  ) : formErrors[`questions[${index}].img`] ? (
                    <p className="image_error">{formErrors[`questions[${index}].img`]}</p>
                  ) : (
                    <span className="plus-sign">+</span>
                  )}
                  <input
                    type="file"
                    accept="image/*"
                    style={{ display: 'none' }}
                    onChange={(e) => handleImageChange(e, index)}
                  />
                </label>
                <div className="all_input_answer">
                  <div className="word_error">
                  {formErrors[`questions`] && (
                      <p className="_error">{formErrors[`questions`]}</p>
                    )}
                    <input
                      className="input_ward"
                      type="text"
                      placeholder={`${t("Word")} 1`}
                      value={question.word_1}
                      onChange={(e) => handleInputChange(index, "word_1", e.target.value)}
                    />
                  </div>

                  <div className="word_error">

                    <input
                      className="input_ward"
                      type="text"
                      placeholder={`${t("Word")} 2`}
                      value={question.word_2}
                      onChange={(e) => handleInputChange(index, "word_2", e.target.value)}
                    />
                  </div>

                  <div className="word_error">
    
                    <input
                      className="input_ward"
                      type="text"
                      placeholder={`${t("Word")} 3`}
                      value={question.word_3}
                      onChange={(e) => handleInputChange(index, "word_3", e.target.value)}
                    />
                  </div>

                  <div className="word_error">

                    <input
                      className="input_ward"
                      type="text"
                      placeholder={`${t("Word")} 4`}
                      value={question.word_4}
                      onChange={(e) => handleInputChange(index, "word_4", e.target.value)}
                    />
                  </div>
                </div>
                </div>
                
              </div>
            ))}
<button type="button" className="add-question-btn" onClick={addNewQuestion}>
  <span className="icon">＋</span> {t('Another Question')}
</button>

            <button
              type="submit"
              // onClick={handleSubmit}
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
          </form>
        </div>
        <Chat />
      </div>
    </div>
  );
};

export default Create_Bost_image_and_answer;