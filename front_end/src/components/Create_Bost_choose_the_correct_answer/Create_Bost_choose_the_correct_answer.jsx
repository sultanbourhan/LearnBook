import React, { useState } from "react";
import "./Create_Bost_choose_the_correct_answer.css";
import Menu from "../main_menu/Menu";
import Chat from "../chat/Chat";
import { useNavigate } from "react-router-dom";
import { useCookies } from "react-cookie";
import axios from "axios";
import Loading_button from "../Loading_button/Loading_button";
import Info_menu from "../Info_menu/Info_menu";
import Shools from "../Shools/Shools";
import { useQueryClient } from "@tanstack/react-query";
import { useTranslation } from 'react-i18next';
const Create_Bost_choose_the_correct_answer = () => {
  const { t } = useTranslation();
    const queryClient = useQueryClient();
  const Navigate = useNavigate();
  const [cookies] = useCookies(["token"]);
  const [errors, setErrors] = useState({});
  const [Load_butt, setLoad_butt] = useState(false);
  const apiUrl = import.meta.env.VITE_API_URL;

  const [questions, setQuestions] = useState([
    { question: "", Answer_1: "", Answer_2: "", Answer_3: "", Answer_4: "" },
  ]);

  const addNewQuestion = () => {
    setQuestions((prev) => {
      const newQuestions = [
        ...prev,
        {
          question: "",
          Answer_1: "",
          Answer_2: "",
          Answer_3: "",
          Answer_4: "",
        },
      ];
      // التمرير إلى آخر عنصر بعد إضافته
      setTimeout(() => {
        const lastQuestion = document.querySelector(".form:last-child");
        lastQuestion?.scrollIntoView({ behavior: "smooth" });
      }, 0); // تأخير بسيط لضمان إضافة السؤال أولًا
      return newQuestions;
    });
  };

  const handleRemoveForm = (index) => {
    setQuestions((prevForms) => prevForms.filter((_, idx) => idx !== index)); // إزالة النموذج
  };

  const handleInputChange = (index, field, value) => {
    const updatedQuestions = [...questions];
    updatedQuestions[index][field] = value;
    setQuestions(updatedQuestions);
  };

  const handleSubmit = async () => {
    setLoad_butt(true);
    try {
      const preparedQuestions = questions.map((q) => {
        // اجمع الإجابات في مصفوفة
        const answers = [q.Answer_1, q.Answer_2, q.Answer_3, q.Answer_4];

        // حدد الإجابة الصحيحة
        const correctAnswer = q.Answer_1;

        // قم بإزالة الإجابة الصحيحة من المصفوفة
        const otherAnswers = answers.filter(
          (answer) => answer !== correctAnswer
        );

        // امزج الإجابات الأخرى عشوائيًا باستخدام خوارزمية Fisher-Yates
        const shuffleArray = (array) => {
          for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1)); // اختر فهرس عشوائي
            [array[i], array[j]] = [array[j], array[i]]; // تبديل العناصر
          }
        };

        shuffleArray(otherAnswers); // خلط الإجابات الأخرى عشوائيًا

        // ضع الإجابة الصحيحة في مكان عشوائي
        const randomIndex = Math.floor(Math.random() * 4); // اختر مكان عشوائي
        otherAnswers.splice(randomIndex, 0, correctAnswer); // إضافة الإجابة الصحيحة في مكان عشوائي

        // وضع الإجابات في الحقول المناسبة
        const [Answer_1, Answer_2, Answer_3, Answer_4] = otherAnswers;

        return {
          question: q.question,
          Answer_1: Answer_1,
          Answer_2: Answer_2,
          Answer_3: Answer_3,
          Answer_4: Answer_4,
          correctAnswer: correctAnswer, // يمكن أن تكون موجودة أيضًا للإشارة إلى الإجابة الصحيحة
        };
      });

      // إرسال البيانات إلى الخادم
      await axios.post(
        `${apiUrl}/api/v2/post/post_2`,
        {
          questions: preparedQuestions,
        },
        {
          headers: {
            Authorization: `Bearer ${cookies.token}`,
          },
        }
      );
      queryClient.invalidateQueries(["AllPost"]);

      // بعد الإرسال، نقوم بتوجيه المستخدم إلى الصفحة الرئيسية
      Navigate("/");
      setLoad_butt(false);
    } catch (err) {
      if (err.response?.data?.errors) {
        const formattedErrors = {};
        err.response.data.errors.forEach((error) => {
          formattedErrors[error.path] = error.msg;
        });
        setErrors(formattedErrors);
        console.log(formattedErrors);
        
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
        <div className="Create_Bost_choose_the_correct_answer">
          <h2>{t('Choose the correct answer.')}</h2>

          <div className="all_form">
            {questions.map((q, idx) => (
              <div className="form" key={idx}>
                <button
                  type="button"
                  className="remove_form_btn"
                  onClick={() => handleRemoveForm(idx)}
                >
                  X
                </button>
                <div className="question_error">
                  {errors[`questions[${idx}]`] && (
                    <p className="errors">{errors[`questions[${idx}]`]}</p>
                  )}
                  <input
                    type="text"
                    placeholder={`${t("Question")} ${idx + 1}`}
                    value={q.question}
                    onChange={(e) =>
                      handleInputChange(idx, "question", e.target.value)
                    }
                  />
                </div>

                <div className="inpots">
                  {["Answer_1", "Answer_2", "Answer_3", "Answer_4"].map(
                    (answerKey, i) => (
                      <div key={i} className="div_error">
                        <input
                          type="text"
                          placeholder={`${t("Answer")} ${i + 1}`}
                          value={q[answerKey]}
                          onChange={(e) =>
                            handleInputChange(idx, answerKey, e.target.value)
                          }
                        />
                      </div>
                    )
                  )}
                </div>
              </div>
            ))}
          </div>
          <div className="butin">
            <button
              type="button"
              className="add-question-btn"
              onClick={addNewQuestion}
            >
              <span className="icon">＋</span> {t('Another Question')}
            </button>
            {/* <button type="submit" className="submit_btn" onClick={handleSubmit}>Post</button> */}
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

export default Create_Bost_choose_the_correct_answer;
