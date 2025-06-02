import React, { useState, useEffect, useRef, useOptimistic, startTransition } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faSearch,
  faTimes,
  faPaperPlane,
  faFile,
  faChevronLeft,
  faChevronRight,
  faPause,
  faPlay,
  faVolumeMute,
  faVolumeUp
} from "@fortawesome/free-solid-svg-icons";
import { useNavigate } from "react-router-dom";
import { useCookies } from "react-cookie";
import axios from "axios";
import { useUser } from "../Context";
import EmojiPicker from "emoji-picker-react";
import Loading_Chat from "../Loading_Chat/Loading_Chat";
import { useTranslation } from 'react-i18next';

const ChatBetweenUsers = () => {
const { t } = useTranslation();
  const apiUrl = import.meta.env.VITE_API_URL;

  const { userById } = useUser();
  const [reload, setReload] = useState(false);
  const [loadingRequest, setLoadingRequest] = useState(true);
  const { setShowChat } = useUser();
  const [cookies] = useCookies(["token"]);
  const [sentRequests, setSentRequests] = useState({});
  const [Mydata, SetMydata] = useState();

  const [loadingChat, setLoadingChat] = useState(false);

  const [not_Chat, setNot_Chat] = useState(false);

  // ⚡️ Ref for auto-scroll
  const bottomRef = useRef(null);
  const chatBoxRef = useRef(null);

  // ✅ دعم الرموز التعبيرية
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [input, setInput] = useState(""); // استخدام `input` بدلًا من `message` للحفاظ على التناسق

  // 🆕 أضف هذا في أعلى الكومبوننت
  const [selectedFiles, setSelectedFiles] = useState([]);

  // 🆕 دالة لاختيار الملفات
  const handleFileChange = (e) => {
    const filesArray = Array.from(e.target.files);
    setSelectedFiles((prev) => [...prev, ...filesArray]);
  };

  // 🆕 دالة لحذف ملف معين قبل الإرسال
  const handleRemoveFile = (index) => {
    setSelectedFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleEmojiClick = (emojiObject) => {
    setInput((prevInput) => prevInput + emojiObject.emoji);
  };

  // =====================================================
  const [chat, setChat] = useState([]);

  const [optimisticMessages, addOptimisticMessage] = useOptimistic(
    chat, (state, newMessage) => [...state, newMessage]);

  useEffect(() => {
    const chatBox = chatBoxRef.current;
    if (!chatBox) return;

    chatBox.scrollTop = chatBox.scrollHeight;
  }, [chat.length]);

  useEffect(() => {
    document.body.classList.add("chat-page");
    return () => {
      document.body.classList.remove("chat-page");
    };
  }, []);

  useEffect(() => {
    setLoadingChat(true);
  }, []);





  useEffect(() => {
    axios
      .get(`${apiUrl}/api/v2/auth/get_date_my`, {
        headers: {
          Authorization: `Bearer ${cookies.token}`,
        },
      })
      .then((res) => {
        SetMydata(res.data.data);
      })
      .catch((error) => {
        console.error("Error fetching data", error);
      })
      .finally(() => {
        setLoadingRequest(false);
      });
  }, []);

  const user1Id = Mydata?._id;
  const [user2Id, setUser2Id] = useState(null);

  // 👇 التمرير للأسفل تلقائياً عند تغير المحادثة
  // useEffect(() => {
  //   setTimeout(() => {
  //     const messages = document.querySelectorAll('.message');
  //     if (messages.length > 0) {
  //       messages[messages.length - 1].scrollIntoView({ behavior: 'smooth' });
  //     }
  //   }, 100); // تعيين تأخير بسيط لضمان تنفيذ التمرير
  // }, []);

  useEffect(() => {
    if (!user1Id || !userById) return;

    // Create a unique chat ID for caching
    const chatCacheKey = `chat_${user1Id}_${userById._id}`;
    const lastMessageTimeKey = `last_message_time_${user1Id}_${userById._id}`;

    // Get the last message timestamp to check for new messages
    const getLastMessageTime = () => {
      if (chat.length === 0) return 0;
      const lastMessage = chat[chat.length - 1];
      return lastMessage.timestamp || 0;
    };

    const fetchChat = async () => {
      try {
        // Check if we need to fetch new data
        const lastMessageTime = localStorage.getItem(lastMessageTimeKey) || 0;

        const res = await axios.get(
          `${apiUrl}/api/v2/chat/${user1Id}/${userById._id}`,
          {
            headers: {
              Authorization: `Bearer ${cookies.token}`,
            },
          }
        );

        const newMessages = res.data.data.messages;

        // Only update state if there are new messages
        setChat(newMessages);
        // Cache the messages
        localStorage.setItem(chatCacheKey, JSON.stringify(newMessages));

        // Update the last message timestamp
        if (newMessages.length > 0) {
          localStorage.setItem(lastMessageTimeKey, getLastMessageTime());
        }

        setLoadingChat(false);
      } catch (err) {
        if (err.response?.data?.errors) {
          const formattedErrors = {};
          err.response.data.errors.forEach((error) => {
            formattedErrors[error.path] = error.msg;
          });
        }

        if (
          err.response.data.message === "Chat not found between these users"
        ) {
          setLoadingChat(false);
          setNot_Chat(true);
        }
      }
    };

    // Try to load from cache first
    const cachedChat = localStorage.getItem(chatCacheKey);
    if (cachedChat) {
      setChat(JSON.parse(cachedChat));
      setLoadingChat(false);
    }

    // Then fetch fresh data
    fetchChat();

    // Use a more reasonable polling interval (3 seconds instead of 1)
    const interval = setInterval(fetchChat, 3000);
    return () => clearInterval(interval);
  }, [user1Id, userById, cookies.token]);



  const formruf = useRef();

  const sendMessage = async (Data) => {
    if (!input.trim() && selectedFiles.length === 0) return;
    const newMessage = { content: Data.get('content'), sender: user1Id };
    startTransition(() => {
      addOptimisticMessage(newMessage);
    });
    formruf.current?.reset()
    //     const chatBox = chatBoxRef.current;
    // if (!chatBox) return;

    // chatBox.scrollTop = chatBox.scrollHeight; 

    setTimeout(() => {
      if (chatBoxRef.current) {
        chatBoxRef.current.scrollTop = chatBoxRef.current.scrollHeight;
      }
    }, 100);

    
    const formData = new FormData();
    formData.append("user1Id", user1Id);
    formData.append("user2Id", userById._id);
    formData.append("content", Data.get('content'));
    selectedFiles.forEach((file) => {
      formData.append("files", file);
    });

    try {
      const res = await axios.post(
        `${apiUrl}/api/v2/chat`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${cookies.token}`,
            "Content-Type": "multipart/form-data",
          },
        }
      );

      setChat(res.data.chat.messages);
      setSelectedFiles([]); // 🆕 إفراغ الملفات بعد الإرسال
      setNot_Chat(false);


    } catch (err) {
      console.error("فشل في الإرسال:", err.response?.data || err.message);
    }
  };

  // =======================================================================

  const [showImageViewer, setShowImageViewer] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [allImages, setAllImages] = useState([]);

  const openImageViewer = (mediaList, index) => {
    setAllImages(mediaList); // mediaList لازم تكون فيها { url, type }
    setCurrentImageIndex(index);
    setShowImageViewer(true);
  };

  const closeImageViewer = () => {
    setShowImageViewer(false);
  };

  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % allImages.length);
  };

  const prevImage = () => {
    setCurrentImageIndex((prev) =>
      prev === 0 ? allImages.length - 1 : prev - 1
    );
  };












  // Reference for the emoji picker container
  const emojiPickerRef = useRef(null);

  // Close emoji picker when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      // Check if the click is on the emoji toggle button
      const isEmojiToggleButton = event.target.closest('.emoji-toggle-button');

      // Only close if click is outside picker AND not on the toggle button
      if (showEmojiPicker && emojiPickerRef.current &&
        !emojiPickerRef.current.contains(event.target) &&
        !isEmojiToggleButton) {
        setShowEmojiPicker(false);
      }
    };

    // Add event listener with a small delay to avoid immediate triggering
    const timeoutId = setTimeout(() => {
      document.addEventListener('mousedown', handleClickOutside);
    }, 100);

    // Clean up the event listener and timeout
    return () => {
      clearTimeout(timeoutId);
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showEmojiPicker]);

  return (
    <div className="chat-container">
      {loadingChat ? (
        <Loading_Chat />
      ) : (
        <div style={{
          width: "100%",
          overflowY: "auto",
          display: "flex",
          flexDirection: "column",
          gap: "10px",
          scrollBehavior: "smooth",
          position: "relative",
          scrollbarWidth: "none",
          msOverflowStyle: "none",
          height:"100%",
        }}>
          <div className="chat-box" ref={chatBoxRef}>
            <div className="header_chat">
              <div className="user_img_name">
                <img
                  src={
                    userById.profilImage
                      ? userById.profilImage.startsWith("http")
                        ? userById.profilImage
                        : `${apiUrl}/user/${userById.profilImage}`
                      : "/image/pngegg.png"
                  }
                  alt={`Image of ${userById.name}`}
                />
                <p>{userById?.name}</p>
              </div>
              <FontAwesomeIcon
                className="search_icon"
                onClick={() => setShowChat(false)}
                icon={faTimes}
              />
            </div>
            {not_Chat ? (
              <p className="not_chat">
                {t('No previous conversations with. You can start a new chat now!')}
              </p>
            ) : null}

            {optimisticMessages.map((msg, index) => {
              const senderIsMe =
                msg.sender === Mydata?._id || msg.sender?._id === Mydata?._id;

              // 🧠 إذا كانت files موجودة كسلسلة JSON، نحولها لمصفوفة
              let files = [];
              if (msg.files?.length) {
                try {
                  files =
                    typeof msg.files[0] === "string"
                      ? JSON.parse(msg.files[0])
                      : msg.files;
                } catch (e) {
                  console.error("Failed to parse files", e);
                }
              }

              return (
                <div
                  key={index}
                  className={`message ${senderIsMe ? "me" : "other"}`}
                >
                  {/* {msg.content && <p>{msg.content}</p>} */}

                  {/* عرض الملفات إذا موجودة */}
                  {files.length > 0 && (
                    <div className="message-files">
                      {files.map((file, i) => {
                        if (!file || !file.url) return null;

                        const isImage = /\.(jpg|jpeg|png|gif|bmp|webp)$/i.test(file.name);
                        const isVideo = /\.(mp4|webm|ogg|mov)$/i.test(file.name);
                        const isAudio = /\.(mp3|wav|ogg|m4a)$/i.test(file.name);

                        // فقط الصور والفيديوهات للعرض داخل العارض
                        const previewableFiles = files
                          .filter(f => /\.(jpg|jpeg|png|gif|bmp|webp|mp4|webm|ogg|mov)$/i.test(f.name))
                          .map(f => ({
                            ...f,
                            type: /\.(mp4|webm|ogg|mov)$/i.test(f.name) ? 'video' : 'image'
                          }));

                        const currentIndex = previewableFiles.findIndex(f => f.name === file.name);

                        return (
                          <div key={i} className="file-bubble">
                            {isImage ? (
                              <img
                                src={file.url}
                                alt={file.name || "image"}
                                className="message-image"
                                onClick={() => openImageViewer(previewableFiles, currentIndex)}
                                style={{ cursor: "pointer" }}
                              />
                            ) : isVideo ? (
                              <video
                                src={file.url}
                                className="message-video"
                                controls
                                onClick={() => openImageViewer(previewableFiles, currentIndex)}
                                style={{
                                  maxWidth: "100%",
                                  borderRadius: "10px",
                                  cursor: "pointer",
                                }}
                              />
                            ) : isAudio ? (
                              <audio
                                src={file.url}
                                controls
                                className="message-audio"
                              />
                            ) : (
                              <div className="containerrs">
                                <div className="folder">
                                  <div className="front-side">
                                    <div className="tip"></div>
                                    <div className="cover"></div>
                                  </div>
                                </div>
                                <label className="custom-file-upload">
                                  <a className="title" href={file.url || "#"} download>
                                    <span className="scroll-wrapper">
                                      <span className="scrolling-text">
                                        {file.name || "Download File"}
                                      </span>
                                    </span>
                                  </a>
                                </label>
                              </div>
                            )}
                          </div>
                        );
                      })}



                    </div>
                  )}


                  {msg.content && <p>{msg.content}</p>}
                </div>
              );
            })}

            <div ref={bottomRef} />
          </div>
          <form ref={formruf} className="chat-input" action={sendMessage}>
            <div className="Emoji_input">
              <span
                type="button"
                className="emoji-button"
                onClick={() => setShowEmojiPicker(!showEmojiPicker)}
              >
                😊
              </span>

              <input
                name="file"
                type="file"
                id="file-upload"
                multiple
                style={{ display: "none" }}
                onChange={handleFileChange}
              />
              <label
                htmlFor="file-upload"
                className="emoji-button"
                title="Attach file"
              >
<svg  xmlns="http://www.w3.org/2000/svg"   viewBox="0 0 24 24"  fill="none"  stroke="currentColor"  stroke-width="2"  stroke-linecap="round"  stroke-linejoin="round" ><path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M9 15h-3a3 3 0 0 1 -3 -3v-6a3 3 0 0 1 3 -3h6a3 3 0 0 1 3 3v3" /><path d="M9 9m0 3a3 3 0 0 1 3 -3h6a3 3 0 0 1 3 3v6a3 3 0 0 1 -3 3h-6a3 3 0 0 1 -3 -3z" /><path d="M3 12l2.296 -2.296a2.41 2.41 0 0 1 3.408 0l.296 .296" /><path d="M14 13.5v3l2.5 -1.5z" /><path d="M7 6v.01" /></svg>              </label>

              <input
                name="content"
                type="text"
                onChange={(e) => setInput(e.target.value)}
                onClick={() => setShowEmojiPicker(false)}
                placeholder="Write a letter..."
              />
            </div>

            {/* 🆕 عرض معاينة الملفات المرفقة */}
            {selectedFiles.length > 0 && (
              <div className="file-preview-container">
                {selectedFiles.map((file, index) => (
                  <div key={index} className="file-preview-item">
                    {file.type.startsWith("image/") ? (
                      <img
                        src={URL.createObjectURL(file)}
                        alt={file.name}
                        className="preview-image"
                      />
                    ) : (
                      <div className="preview-file">
                        <span role="img" aria-label="file">
                          📄
                        </span>{" "}
                        {file.name}
                      </div>
                    )}
                    <button type="button" onClick={() => handleRemoveFile(index)}>
                      <FontAwesomeIcon icon={faTimes} />
                    </button>
                  </div>
                ))}
              </div>
            )}

            <button
              type="submit"
              style={
                loadingChat
                  ? { pointerEvents: "none", opacity: 0.5, cursor: "not-allowed" }
                  : {}
              }
            >
              {/* Send */}
<svg  xmlns="http://www.w3.org/2000/svg"  width="25"  height="25"  viewBox="0 0 24 24"  fill="none"  stroke="currentColor"  stroke-width="2"  stroke-linecap="round"  stroke-linejoin="round"  ><path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M15 10l-4 4l6 6l4 -16l-18 7l4 2l2 6l3 -4" /></svg>            </button>
            {/* <FontAwesomeIcon icon={faPaperPlane} /> */}
          </form>
        </div>

      )}






      {showEmojiPicker && (
        <div style={{ width: "100%", height: "calc(50% - 70px)", position: "absolute", button: "10px", left: "0" }} ref={emojiPickerRef}>
          <EmojiPicker
            width={"100%"}
            theme="dark"
            emojiStyle="apple"
            searchDisabled
            previewConfig={{ showPreview: false }}
            onEmojiClick={handleEmojiClick}
          />
        </div>

      )}

      {showImageViewer && allImages[currentImageIndex] && (
        <div className="image-viewer-overlay" onClick={closeImageViewer}>
          <div className="image-viewer" onClick={(e) => e.stopPropagation()}>
            <button className="close-btn" onClick={closeImageViewer}>
              <FontAwesomeIcon icon={faTimes} />
            </button>
            <button className="nav-btn left" onClick={prevImage}>
              <FontAwesomeIcon icon={faChevronLeft} />
            </button>
            <button className="nav-btn right" onClick={nextImage}>
              <FontAwesomeIcon icon={faChevronRight} />
            </button>

            {/* عرض حسب النوع */}
            {allImages[currentImageIndex]?.type === "video" ? (
              <video
                src={allImages[currentImageIndex].url}
                controls
                autoPlay
                className="full-image"
              />
            ) : allImages[currentImageIndex]?.type === "image" ? (
              <img
                src={allImages[currentImageIndex].url}
                alt="preview"
                className="full-image"
              />
            ) : allImages[currentImageIndex]?.type === "audio" ? (
              <audio
                src={allImages[currentImageIndex].url}
                controls
                autoPlay
                className="full-audio"
              />
            ) : (
              <div className="full-file">
                <p>📁 {allImages[currentImageIndex].name}</p>
                <a
                  href={allImages[currentImageIndex].url}
                  download
                  className="download-link"
                >
                  تحميل الملف
                </a>
              </div>
            )}
          </div>
        </div>
      )}

    </div>
  );
};

export default ChatBetweenUsers;
