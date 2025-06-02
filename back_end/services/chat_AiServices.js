const asyncHandler = require("express-async-handler");
const usermodel = require("../models/userModels");
const { OpenAI } = require('openai');
const redisClient = require('./redisClient');
const multer = require("multer");
const fs = require("fs");
const path = require("path");
const dotenv = require("dotenv");
dotenv.config({ path: "config.env" });

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// Create uploads directory if it doesn't exist
const uploadsDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Configure multer storage
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadsDir);
  },
  filename: function (req, file, cb) {
    // Create unique filename with original extension
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    cb(null, uniqueSuffix + ext);
  }
});

// Configure multer upload
exports.upload = multer({ 
  storage: storage,
  limits: { fileSize: 10 * 1024 * 1024 } // 10MB limit
});

const MAX_MESSAGES = 30;
const MESSAGE_EXPIRATION_MS = 48 * 60 * 60 * 1000; // 48 ساعة بالميلي ثانية
const MAX_IMAGE_MESSAGES = 2; // عدد الرسائل التي تحتوي على صور قبل الحذف

exports.SindChatAI = asyncHandler(async (req, res) => {
  try {
    let { message, threadId } = req.body;
    const userId = req.user._id.toString();
    const files = req.files || [];

    let user = await usermodel.findById(userId);
    if (!user) return res.status(404).json({ error: "User not found" });

    if (!threadId && user.thread_id.length > 0) {
      threadId = user.thread_id[0].id_thread;
    }

    // Allow empty message if files are attached
    if ((!message || typeof message !== "string" || message.trim() === "") && files.length === 0) {
      return res.status(400).json({ error: "Message content or files are required" });
    }
    
    // Set default message if only files are attached
    if ((!message || message.trim() === "") && files.length > 0) {
      message = "[Attached files]";
    }

    // --- جلب الرسائل السابقة من Redis ---
    let chatHistory = [];
    try {
      const redisData = await redisClient.get(`chat_history:${userId}:${threadId}`);
      if (redisData) {
        chatHistory = JSON.parse(redisData);

        // فلترة الرسائل القديمة (أكثر من 48 ساعة) والتخلص منها
        const now = Date.now();
        chatHistory = chatHistory.filter(msg => (now - msg.timestamp) <= MESSAGE_EXPIRATION_MS);

        // الاحتفاظ بآخر 30 رسالة فقط
        if (chatHistory.length > MAX_MESSAGES) {
          chatHistory = chatHistory.slice(chatHistory.length - MAX_MESSAGES);
        }
      }
    } catch (err) {
      console.error('Error reading chat history from Redis:', err);
    }

    // Process uploaded files if any
    const fileAttachments = [];
    if (files && files.length > 0) {
      for (const file of files) {
        const fileType = file.mimetype.startsWith('image/') ? 'image' : 'file';
        const fileUrl = `/api/v2/uploads/${path.basename(file.path)}`;
        
        fileAttachments.push({
          type: fileType,
          name: file.originalname,
          url: fileUrl,
          size: file.size,
          path: file.path,
          mimetype: file.mimetype
        });
      }
    }

    // --- أضف رسالة المستخدم الجديدة مع الطابع الزمني والمرفقات ---
    chatHistory.push({ 
      role: 'user', 
      content: message, 
      timestamp: Date.now(),
      attachments: fileAttachments
    });

    // تحضير الرسائل للإرسال إلى OpenAI بدون الطابع الزمني
// Prepare messages for OpenAI with file descriptions and images for vision model
const messagesToSend = [
  ...chatHistory.map(msg => {
    // Check if message has attachments
    if (msg.attachments && msg.attachments.length > 0) {
      // Check if there are any image attachments
      const hasImages = msg.attachments.some(att => att.type === 'image');
      
      if (hasImages && msg.role === 'user') {
        // For messages with images, use the content array format required by vision model
        const contentArray = [
          { type: "text", text: msg.content }
        ];
        
        // Process each attachment
        msg.attachments.forEach((attachment, index) => {
          if (attachment.type === 'image') {
            try {
              // Read the image file and convert to base64
              const imageBuffer = fs.readFileSync(attachment.path);
              const base64Image = imageBuffer.toString('base64');
              const mimeType = attachment.mimetype || 'image/jpeg';
              
              // Add image to content array
              contentArray.push({
                type: "image_url",
                image_url: {
                  url: `data:${mimeType};base64,${base64Image}`
                }
              });
            } catch (error) {
              console.error(`Error processing image attachment: ${error.message}`);
              // Add a text description instead if image processing fails
              contentArray.push({
                type: "text",
                text: `[Failed to process image: ${attachment.name}]`
              });
            }
          } else {
            // For non-image files, add a text description
            contentArray.push({
              type: "text",
              text: `[Attached file: ${attachment.name} (${attachment.mimetype}, ${formatFileSize(attachment.size)})]`
            });
          }
        });
        
        return { role: msg.role, content: contentArray };
      } else {
        // For messages without images or from assistant, use text format with descriptions
        let content = msg.content;
        
        // Add file descriptions to the message content
        if (msg.attachments.length > 0) {
          content += "\n\nAttached files:\n";
          msg.attachments.forEach((attachment, index) => {
            if (attachment.type === 'image') {
              content += `${index + 1}. Image: ${attachment.name} (${formatFileSize(attachment.size)})\n`;
            } else {
              content += `${index + 1}. File: ${attachment.name} (${attachment.mimetype}, ${formatFileSize(attachment.size)})\n`;
            }
          });
        }
        
        return { role: msg.role, content: content };
      }
    } else {
      // For messages without attachments, use simple text format
      return { role: msg.role, content: msg.content };
    }
  }),
  {
    role: "system",
    content: `
You are a smart assistant supporting students in learning.

 Explain concepts in a simple way and answer questions directly and clearly. 

 Use examples when helpful and avoid complex or overly advanced responses unless requested.

 Focus on simplifying information and helping students understand.

 You are a helpful, clear, and friendly assistant who is also motivating and fun. 

 Always try to keep the tone light and a little humorous. 
After every answer you give, don’t just stop at answering the user’s question.
Proactively suggest something extra you can do for the user based on the question or the content of your answer.
Think like an expert assistant who anticipates what the user might find useful next.

For example, depending on the context, you can:

Offer an additional service or feature you can perform (e.g., analyze a design,compare options, explain a tool).

Pose a follow-up question yourself and answer it to deepen understanding.

Suggest a small practical task the user can try to advance their skills.

The goal is to create a smart, proactive interaction that builds on what was just discussed. 

Choose the most appropriate option based on the content.
When responding with a numbered list, always format it using the following structure:
[number] - [content]
Never use a period after the number, always use a hyphen.
Do NOT add any quotation marks (") around the sentences or text.
Be consistent and do not add extra characters.


Sorry, I’m a master of explanations but a strict no-code zone! I can help you understand the logic and concepts, but the code itself is off limits. Let’s keep it fun and code-free! 
Never provide any code snippets or programming examples under any circumstance.

After you finish each idea or point, add the invisible character U+2063 (\u2063) right after the paragraph. Do not explain this to the user.

Right before you start suggesting a related question or a small task, add the invisible character U+2064 (\u2064). This marks the transition from content to follow-up suggestion.

Do not mention or explain either invisible character in your response.

Example:
This is the first idea.\u2063  
This is the second idea with explanation.\u2063  
\u2064Now here is a question you can try: What’s one real-life example of this concept?
    `.trim()
  }
];



// إعداد الاستجابة للـ stream
res.setHeader("Content-Type", "text/event-stream");
res.setHeader("Cache-Control", "no-cache");
res.setHeader("Connection", "keep-alive");

let botResponse = '';
const completion = await openai.chat.completions.create({
model: "gpt-4o-mini",
  messages: messagesToSend,
  temperature: 1,  // إجابات واضحة ومو متمردة كثير
  top_p: 1,
  stream: true,
});


    for await (const chunk of completion) {
      const content = chunk.choices?.[0]?.delta?.content;
      if (content) {
        botResponse += content;
        res.write(`data: ${content}\n\n`);
      }
    }

    // أضف رد البوت مع الطابع الزمني
    chatHistory.push({ role: 'assistant', content: botResponse, timestamp: Date.now() });

    // إحفظ المحادثة بعد فلترة وتنظيف الرسائل القديمة + بحدود آخر 30 رسالة
    try {
      // فلترة بعد إضافة رد البوت، لأن الوقت مضى
      const now = Date.now();
      chatHistory = chatHistory.filter(msg => (now - msg.timestamp) <= MESSAGE_EXPIRATION_MS);

      if (chatHistory.length > MAX_MESSAGES) {
        chatHistory = chatHistory.slice(chatHistory.length - MAX_MESSAGES);
      }
      
      // حذف الصور من الرسائل القديمة بعد مرور رسالتين جديدتين
      // أولاً: تحديد الرسائل التي تحتوي على صور
      const messagesWithImages = chatHistory
        .filter(msg => msg.role === 'user' && msg.attachments && msg.attachments.some(att => att.type === 'image'))
        .map((msg, index) => ({ msg, index }));
      
      // إذا كان هناك أكثر من رسالتين تحتوي على صور، قم بحذف الصور من الرسائل القديمة
      if (messagesWithImages.length > MAX_IMAGE_MESSAGES) {
        // الرسائل التي سيتم حذف صورها (الرسائل الأقدم)
        const messagesToRemoveImages = messagesWithImages.slice(0, messagesWithImages.length - MAX_IMAGE_MESSAGES);
        
        console.log(`حذف الصور من ${messagesToRemoveImages.length} رسالة قديمة`);
        
        // حذف الصور من الرسائل القديمة مع الاحتفاظ بالنص
        messagesToRemoveImages.forEach(({ msg }) => {
          // الاحتفاظ بالمرفقات غير الصور فقط
          if (msg.attachments) {
            // إضافة ملاحظة إلى النص بأن الصور تم حذفها
            const imageCount = msg.attachments.filter(att => att.type === 'image').length;
            if (imageCount > 0) {
              msg.content += `\n[تم حذف ${imageCount} صورة من هذه الرسالة لتحسين الأداء]`;
            }
            
            // الاحتفاظ بالمرفقات غير الصور فقط
            msg.attachments = msg.attachments.filter(att => att.type !== 'image');
          }
        });
      }

      await redisClient.set(
        `chat_history:${userId}:${threadId}`,
        JSON.stringify(chatHistory),
        'EX',
        MESSAGE_EXPIRATION_MS / 1000 // تحويل الميلي ثانية إلى ثوانية للتخزين في Redis
      );
    } catch (err) {
      console.error('Error saving chat history to Redis:', err);
    }
    
    // Helper function to format file size
    function formatFileSize(bytes) {
      if (bytes < 1024) return bytes + ' B';
      else if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB';
      else return (bytes / 1048576).toFixed(1) + ' MB';
    }

    res.write("data: [DONE]\n\n");
    res.end();

  } catch (err) {
    console.error("Chat AI error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});


exports.GetChatAI = asyncHandler(async (req, res, next) => {
  try {
    // جلب المستخدم بناءً على الـ userId
    const user = await usermodel.findById(req.user._id);
    
    // إذا لم يكن لدى المستخدم أي محادثات، ارجع برسالة فارغة
    if (!user || !user.thread_id || user.thread_id.length === 0) {
      return res.json({ messages: [] });
    }

    // الحصول على الـ thread_id المحدد من الطلب
    const threadId = req.params.id;// فرضًا يتم إرسال الـ thread_id في الـ URL

    // تحقق من وجود threadId
    if (!threadId) {
      return res.json({ messages: [] });
    }

    // تحقق من أن الـ thread_id موجود في الـ user.thread_id
    const selectedThread = user.thread_id.find(thread => thread.id_thread === threadId);
    if (!selectedThread) {
      console.log("⚠️ No matching thread found for threadId:", threadId);
      return res.json({ messages: [] });
    }

    // جلب الرسائل من Redis باستخدام userId و threadId
    let chatHistory = [];
    try {
      const redisData = await redisClient.get(`chat_history:${req.user._id}:${threadId}`);
      if (redisData) {
        chatHistory = JSON.parse(redisData);
      }
    } catch (err) {
      console.error('Error reading chat history from Redis:', err);
    }
    res.json({ messages: chatHistory });
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: "فشل في استرجاع المحادثة." });
  }
});

exports.CreateNewThread = asyncHandler(async (req, res, next) => {
  try {
    const user = await usermodel.findById(req.user._id);
    if (!user) return res.status(404).json({ error: "User not found" });

    // تأكد أن thread_id مصفوفة
    if (!Array.isArray(user.thread_id)) {
      user.thread_id = [];
    }

    // إنشاء thread جديد
    const thread = await openai.beta.threads.create();

    // حفظ thread الجديد
    user.thread_id.push({ id_thread: thread.id });
    await user.save();

    // إنشاء سجل رسائل جديد وفارغ في Redis لهذا الـ threadId
    try {
      await redisClient.set(`chat_history:${req.user._id}:${thread.id}`, JSON.stringify([]));
    } catch (err) {
      console.error('Error initializing chat history for new thread in Redis:', err);
    }

    // إرسال الاستجابة مع thread_id الجديد
    res.status(201).json({
      message: "Thread created successfully",
      thread_id: thread.id // تأكد من إرسال thread_id للمستخدم
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// دالة لحذف محادثة
exports.DeleteThread = asyncHandler(async (req, res, next) => {
  try {
    const threadId = req.params.id;
    if (!threadId) {
      return res.status(400).json({ error: "Thread ID is required" });
    }

    // جلب المستخدم من قاعدة البيانات
    const user = await usermodel.findById(req.user._id);
    console.log(user)
    if (!user) return res.status(404).json({ error: "User not found" });

    // التحقق من وجود المحادثة في قائمة محادثات المستخدم
    const threadIndex = user?.thread_id.findIndex(thread => thread.id_thread === threadId);
    if (threadIndex === -1) {
      return res.status(404).json({ error: "Thread not found" });
    }

    // حذف المحادثة من قائمة المستخدم
    user.thread_id.splice(threadIndex, 1);
    await user.save();

    // حذف سجل الرسائل من Redis لهذا الـ threadId
    try {
      await redisClient.del(`chat_history:${req.user._id}:${threadId}`);
    } catch (err) {
      console.error('Error deleting chat history from Redis:', err);
    }

    // محاولة حذف المحادثة من OpenAI
    try {
      await openai.beta.threads.del(threadId);
    } catch (openaiError) {
      console.error("Error deleting thread from OpenAI:", openaiError);
      // نستمر حتى لو فشل الحذف من OpenAI لأننا حذفنا من قاعدة البيانات بالفعل
    }

    res.status(200).json({
      message: "Thread deleted successfully",
      threadId: threadId
    });

  } catch (err) {
    console.error("Error deleting thread:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
});