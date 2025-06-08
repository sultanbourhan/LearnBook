const Post_1 = require("../models/post_1_Models");
const Post_2 = require("../models/post_2_Models");
const Post_3 = require("../models/post_3_Models");
const Post_4 = require("../models/post_4_Models");
const Post_6 = require("../models/post_6_Models");
const Post = require("../models/post_Models");
const User = require("../models/userModels");
const ApiError = require("../ApiError");

const asyncHandler = require("express-async-handler");
const slugify = require("slugify");
const bcrypt = require("bcryptjs");
const jsonwebtoken = require("jsonwebtoken");

const multer = require("multer");
const sharp = require("sharp");
const { v4: uuidv4 } = require("uuid");

// const multerStorage = multer.memoryStorage();

const fs = require("fs");

fs.writeFile("example.txt", "Hello World!", (err) => {
  if (err) throw err;
  console.log("File created successfully!");
});

// const multer = require("multer");
// const sharp = require("sharp");
// const { v4: uuidv4 } = require("uuid");
// const fs = require("fs");

// مرشح الملفات لتحديد الصور والفيديوهات فقط
const multerFilter = (req, file, cb) => {
  if (
    file.mimetype.startsWith("image") || 
    file.mimetype.startsWith("video") || 
    file.mimetype.startsWith("audio")
  ) {
    cb(null, true); // قبول الملف إذا كان من الأنواع المسموح بها
  } else {
    cb(new ApiError("The uploaded file is not an image, video, or audio", 400), false); // رفض الملف مع خطأ
  }
};

// إعداد Multer
const multerStorage = multer.memoryStorage();
const upload = multer({
  storage: multerStorage,
  fileFilter: multerFilter,
}).any(); // يقبل أي عدد من الملفات المرسلة



exports.processAudioFile = asyncHandler(async (req, res, next) => {
  try {
    if (req.files && req.files.length > 0) {
      req.body.boxes = req.body.boxes || []; // تأكد من وجود مصفوفة `boxes`

      // إنشاء المجلد إذا لم يكن موجودًا
      await fs.promises.mkdir("audio/posts", { recursive: true });

      // معالجة الملفات الصوتية
      await Promise.all(
        req.files.map(async (file) => {
          // استخراج الإندكس من اسم الحقل، مثل `boxes[0][audio]`
          const match = file.fieldname.match(/boxes\[(\d+)\]\[audio\]/);
          if (match) {
            const index = parseInt(match[1], 10); // استخراج الإندكس كرقم
            const filename = `postAudio-${uuidv4()}-${Date.now()}.mp3`;

            console.log(`Processing audio file for box index: ${index}`);

            // حفظ الملف الصوتي مباشرة
            const filePath = `audio/posts/${filename}`;
            await fs.promises.writeFile(filePath, file.buffer);

            console.log(`Audio file processed and saved as: ${filename}`);

            // ضمان وجود العنصر المرتبط بالملف الصوتي
            req.body.boxes[index] = req.body.boxes[index] || {};
            req.body.boxes[index].postAudio = filename; // تخزين اسم الملف الصوتي
          } else {
            console.log(`Fieldname does not match expected pattern: ${file.fieldname}`);
          }
        })
      );
    } else {
      console.log("No audio files found in request.");
    }

    next(); // الانتقال إلى الـ Middleware التالي
  } catch (error) {
    console.error("Error during audio processing:", error.message);
    next(error); // تمرير الخطأ إلى Middleware الأخطاء
  }
});

// رفع الصور
exports.resizeImg_post_img = asyncHandler(async (req, res, next) => {
  try {
    // التحقق من وجود ملفات مرفوعة
    if (req.files && req.files.length > 0) {
      // تصفية الملفات لحقل img_post
      const imgPosts = req.files.filter((file) => file.fieldname === "img_post");

      if (imgPosts.length > 0) {
        req.body.img_post = []; // تحويل الحقل إلى مصفوفة

        await fs.promises.mkdir("image/posts", { recursive: true });

        for (const file of imgPosts) {
          const filename = `img_post-${uuidv4()}-${Date.now()}.jpeg`;

          // معالجة الصورة باستخدام sharp
          await sharp(file.buffer)
            .toFormat("jpeg")
            .jpeg({ quality: 90 })
            .toFile(`image/posts/${filename}`);

          // إضافة اسم الملف إلى مصفوفة img_post
          req.body.img_post.push(filename);
        }
      }
    }

    next(); // الانتقال إلى الميدلوير التالي
  } catch (error) {
    next(error);
  }
});

// رفع الفيديوهات
exports.resizeVideo_video_post = asyncHandler(async (req, res, next) => {
  try {
    // التحقق من وجود ملفات مرفوعة
    if (req.files && req.files.length > 0) {
      // تصفية الملفات لحقل video_post
      const videoPosts = req.files.filter((file) => file.fieldname === "video_post");

      if (videoPosts.length > 0) {
        req.body.video_post = []; // تحويل الحقل إلى مصفوفة

        await fs.promises.mkdir("videos/posts", { recursive: true });

        for (const file of videoPosts) {
          const filename = `postVideo-${uuidv4()}-${Date.now()}.mp4`;
          const filePath = `videos/posts/${filename}`;

          // حفظ الفيديو مباشرة
          await fs.promises.writeFile(filePath, file.buffer);

          // إضافة اسم الملف إلى مصفوفة video_post
          req.body.video_post.push(filename);
        }
      }
    }

    next(); // الانتقال إلى الـ Middleware التالي
  } catch (error) {
    next(error);
  }
});

// استخدام multer في رفع الملفات
exports.uploadImages = upload;


exports.resizeImages = asyncHandler(async (req, res, next) => {
  try {
    if (req.files && req.files.length > 0) {
      req.body.boxes = req.body.boxes || []; // التأكد من وجود مصفوفة `boxes`

      // إنشاء المجلد إذا لم يكن موجودًا
      await fs.promises.mkdir("image/posts", { recursive: true });

      // معالجة الصور
      await Promise.all(
        req.files.map(async (file) => {
          // استخراج الإندكس من اسم الحقل، مثل `boxes[0][postImage]`
          const match = file.fieldname.match(/boxes\[(\d+)\]\[postImage\]/);
          if (match) {
            const index = parseInt(match[1], 10); // استخراج الإندكس كرقم
            const filename = `box_img-${uuidv4()}-${Date.now()}.jpeg`;

            console.log(`Processing file for box index: ${index}`);

            // معالجة الصورة باستخدام sharp
            await sharp(file.buffer)
              .toFormat("jpeg")
              .jpeg({ quality: 90 })
              .toFile(`image/posts/${filename}`);

            console.log(`Image processed and saved as: ${filename}`);

            // ضمان وجود العنصر المرتبط بالصورة
            req.body.boxes[index] = req.body.boxes[index] || {};
            req.body.boxes[index].postImage = filename; // تخزين اسم الصورة
          } else {
            console.log(`Fieldname does not match expected pattern: ${file.fieldname}`);
          }
        })
      );
    } else {
      console.log("No files found in request.");
    }

    next(); // الانتقال إلى الـ Middleware التالي
  } catch (error) {
    console.error("Error during image processing:", error.message);
    next(error); // تمرير الخطأ إلى Middleware الأخطاء
  }
});

// ============================================================
exports.resizeImg_questions = asyncHandler(async (req, res, next) => {
  try {
    if (req.files && req.files.length > 0) {
      req.body.questions = req.body.questions || [];

      // معالجة الصور باستخدام `fieldname`
      await Promise.all(
        req.files.map(async (file , index) => {
          // استخراج الإندكس من اسم الحقل، مثل `questions[0][img]`
          const match = file.fieldname.match(/questions\[(\d+)\]\[img\]/);
          if (match) {
            const index = parseInt(match[1], 10); // استخراج الإندكس كعدد
            const filename = `question_img-${uuidv4()}-${Date.now()}.jpeg`;

            // إعادة تحجيم الصورة وحفظها
            await sharp(file.buffer)
              .toFormat("jpeg")
              .jpeg({ quality: 90 })
              .toFile(`image/posts/${filename}`);

            // ضمان وجود السؤال المرتبط بالصورة
            req.body.questions[index] = req.body.questions[index] || { words: [] };
            req.body.questions[index].img = filename; // تخزين اسم الصورة في السؤال
          }
        })
      );
    }

    next();
  } catch (error) {
    console.error("Error during image processing:", error.message);
    res.status(500).json({ message: "Error during image processing.", error: error.message });
  }
});

// =========================================================================

exports.createPost = asyncHandler(async (req, res, next) => {
  const post = await Post.create({
    user: req.user._id,
    writing: req.body.writing,
    img_post: req.body.img_post || [], // التأكد من أن الصور تُخزن كمصفوفة
    video_post: req.body.video_post || [], // التأكد من أن الفيديوهات تُخزن كمصفوفة
  });

  res.status(200).json({ data: post });
});

// =================================================

exports.createPost_1 = asyncHandler(async (req, res, next) => {
  console.log("Files received:", req.files);
  try {
    const boxes = req.body.boxes.map((box) => ({
      postImage: box.postImage, // الصورة الخاصة بـ box
      word: box.word,           // الكلمة المرتبطة بـ box
      postAudio: box.postAudio, // رابط التسجيل الصوتي الخاص بـ box
    }));

    const post = await Post_1.create({
      user: req.user._id,
      boxes, // إضافة المصفوفة إلى المنشور
    });

    res.status(200).json({ data: post });
  } catch (error) {
    next(error);
  }
});

// ======================================================================

exports.createPost_2 = asyncHandler(async (req, res, next) => {
  const { questions } = req.body;

  if (!Array.isArray(questions) || questions.length === 0) {
    return res.status(400).json({ message: "يجب إرسال أسئلة." });
  }

  const post = await Post_2.create({
    user: req.user._id,
    questions: questions.map(q => ({
      question: q.question,
      Answer_1: q.Answer_1,
      Answer_2: q.Answer_2,
      Answer_3: q.Answer_3,
      Answer_4: q.Answer_4,
      correctAnswer: q.correctAnswer,
    })),
  });

  res.status(200).json({ data: post });
});


exports.checkPost_2 = asyncHandler(async (req, res, next) => {
  const { postId, answers } = req.body;

  const post = await Post_2.findById(postId);
  if (!post) {
    return res.status(404).json({ message: "البوست غير موجود" });
  }

  const questions = post.questions;

  const questionMap = {};
  questions.forEach(q => {
    questionMap[q._id.toString()] = q;
  });

  const result = answers.map((ans) => {
    const question = questionMap[ans.questionId];
    if (!question) {
      return {
        questionId: ans.questionId,
        error: "السؤال غير موجود في هذا البوست"
      };
    }

    return {
      questionId: question._id,
      yourAnswer: ans.answer,
      correctAnswer: question.correctAnswer, // ✅ سؤال ببوست 2 بيحمل حقل correctAnswer
      isCorrect: question.correctAnswer === ans.answer
    };
  });

  // ✅ تحديث أو إضافة داخل User (مثل checkPost_3)
  const user = await User.findById(req.user._id);

  const existingAttempt = user.solvedPost_2.find(
    (attempt) => attempt.postId.toString() === postId
  );

  if (existingAttempt) {
    // حدث المحاولة القديمة
    result.forEach((newAnswer) => {
      const existingIndex = existingAttempt.result.findIndex(
        (r) => r.questionId.toString() === newAnswer.questionId.toString()
      );

      if (existingIndex !== -1) {
        // حدث الإجابة
        existingAttempt.result[existingIndex] = newAnswer;
      } else {
        // أضف إجابة جديدة
        existingAttempt.result.push(newAnswer);
      }
    });
  } else {
    // ما في محاولة قديمة، أضف جديدة
    user.solvedPost_2.push({
      postId: post._id,
      result: result
    });
  }

  await user.save();

  res.status(200).json({
    postId,
    result
  });
});





//==========================================================================

exports.createPost_3 = asyncHandler(async (req, res, next) => {
  const post = await Post_3.create({
    user: req.user._id, // المستخدم الحالي

    // ✅ بدل الأسئلة الثابتة، صرنا ناخد كل الأسئلة من المصفوفة:
    questions: req.body.questions, // لازم تكون مصفوفة فيها عناصر مثل: { question, condition }

    // 👍 باقي العناصر مثل ما هي:
    likes: req.body.likes || [],
    comments: req.body.comments || [],
  });

  res.status(200).json({ data: post }); // إرسال الاستجابة
});


exports.chickPost_3 = asyncHandler(async (req, res, next) => {
  const { postId, answers } = req.body;

  const post = await Post_3.findById(postId);
  if (!post) {
    return res.status(404).json({ message: "البوست غير موجود" });
  }

  const questions = post.questions;

  const questionMap = {};
  questions.forEach(q => {
    questionMap[q._id.toString()] = q;
  });

  const result = answers.map((ans) => {
    const question = questionMap[ans.questionId];
    if (!question) {
      return {
        questionId: ans.questionId,
        error: "السؤال غير موجود في هذا البوست"
      };
    }

    return {
      questionId: question._id,
      yourAnswer: ans.answer,
      correctAnswer: question.condition,
      isCorrect: ans.answer === question.condition
    };
  });

  // ✅ تحديث أو إضافة داخل User
  const user = await User.findById(req.user._id);

  const existingAttempt = user.solvedPost_3.find(
    (attempt) => attempt.postId.toString() === postId
  );

  if (existingAttempt) {
    // تحديث الأسئلة فقط، دون حذف القديم
    result.forEach((newAnswer) => {
      const existingIndex = existingAttempt.result.findIndex(
        (r) => r.questionId.toString() === newAnswer.questionId.toString()
      );

      if (existingIndex !== -1) {
        // حدث الإجابة القديمة
        existingAttempt.result[existingIndex] = newAnswer;
      } else {
        // أضف إجابة جديدة
        existingAttempt.result.push(newAnswer);
      }
    });
  } else {
    // أول مرة، أضف محاولة جديدة
    user.solvedPost_3.push({
      postId: post._id,
      result: result
    });
  }

  await user.save();

  res.status(200).json({
    postId,
    result
  });
});




// ==================================================================
exports.createPost_4 = asyncHandler(async (req, res, next) => {

  console.log("Body:", req.body); // النصوص
console.log("Files:", req.files); // الملفات (الصور)
  try {
    // التحقق من أن الأسئلة موجودة كمصفوفة
    if (!Array.isArray(req.body.questions)) {
      return res.status(400).json({ message: "الأسئلة يجب أن تكون مصفوفة تحتوي على جميع الحقول المطلوبة." });
    }

    // التحقق من صحة كل سؤال
    req.body.questions.forEach((question, index) => {
      if (!question.img || !question.word_1 || !question.word_2 || !question.word_3 || !question.word_4 || !question.correctWord) {
        throw new Error(`السؤال رقم ${index + 1} يفتقد إلى أحد الحقول المطلوبة: img, words[4], correctWord.`);
      }
    });

    // إنشاء المنشور
    const post = await Post_4.create({
      user: req.user._id,
      questions: req.body.questions,
      likes: req.body.likes || [],
      comments: req.body.comments || [],
      type: req.body.type || "post_4",
    });

    res.status(200).json({ message: "تم إنشاء المنشور بنجاح", data: post });
  } catch (error) {
    res.status(500).json({ message: "حدث خطأ ما", error: error.message });
  }
});


exports.chickPost_4 = asyncHandler(async (req, res, next) => {
  const { postId, answers } = req.body; // استلام بيانات البوست والإجابات المرسلة من المستخدم

  // البحث عن البوست بواسطة ID
  const post = await Post_4.findById(postId);
  if (!post) {
    return res.status(404).json({ message: "البوست غير موجود" });
  }

  const questions = post.questions;

  // تحويل الأسئلة إلى خريطة لسهولة الوصول
  const questionMap = {};
  questions.forEach(q => {
    questionMap[q._id.toString()] = q; // استخدام ID لكل سؤال كمفتاح
  });

  // مقارنة الإجابات
  const result = answers.map((ans) => {
    const question = questionMap[ans.questionId];
    if (!question) {
      return {
        questionId: ans.questionId,
        error: "السؤال غير موجود في هذا البوست"
      };
    }

    return {
      questionId: question._id,
      yourAnswer: ans.answer,
      correctAnswer: question.correctWord,
      isCorrect: ans.answer === question.correctWord
    };
  });

  // تحديث بيانات المحاولة داخل المستخدم
  const user = await User.findById(req.user._id);

  const existingAttempt = user.solvedPost_4.find(
    (attempt) => attempt.postId.toString() === postId
  );

  if (existingAttempt) {
    // تحديث الإجابات فقط
    result.forEach((newAnswer) => {
      const existingIndex = existingAttempt.result.findIndex(
        (r) => r.questionId.toString() === newAnswer.questionId.toString()
      );

      if (existingIndex !== -1) {
        // تحديث الإجابة القديمة
        existingAttempt.result[existingIndex] = newAnswer;
      } else {
        // إضافة إجابة جديدة
        existingAttempt.result.push(newAnswer);
      }
    });
  } else {
    // أول مرة، إضافة محاولة جديدة
    user.solvedPost_4.push({
      postId: post._id,
      result: result
    });
  }

  await user.save(); // حفظ بيانات المستخدم

  res.status(200).json({
    postId,
    result
  });
});


// ===================================================================
exports.createPost_6 = asyncHandler(async (req, res, next) => {

  try {
    // إنشاء المنشور
    const post = await Post_6.create({
      user: req.user._id,
      ifrem:{ 
        url: req.body.url,
        des: req.body.des,
        dimensions:req.body.dimensions,
    }
    
    });
    console.log(req.body)

    res.status(200).json({ message: "تم إنشاء المنشور بنجاح", data: post });
  } catch (error) {
    res.status(500).json({ message: "حدث خطأ ما", error: error.message });
  }
});
// ===================================================================


exports.getAllPosts = asyncHandler(async (req, res, next) => {
  try {
    const { type, role } = req.query; // ناخذ النوع والدور من الكويري
    let allPosts = [];

    const populateOptions = [
      { path: 'user', match: role ? { role } : {} }, // فلترة المستخدمين حسب الدور
      { path: 'comments.user_comment' },
    ];

    if (!type || type === 'post_1') {
      const posts1 = await Post_1.find().populate(populateOptions);
      allPosts.push(...posts1);
    }
    if (!type || type === 'post_2') {
      const posts2 = await Post_2.find().populate(populateOptions);
      allPosts.push(...posts2);
    }
    if (!type || type === 'post_3') {
      const posts3 = await Post_3.find().populate(populateOptions);
      allPosts.push(...posts3);
    }
    if (!type || type === 'post_4') {
      const posts4 = await Post_4.find().populate(populateOptions);
      allPosts.push(...posts4);
    }
    if (!type || type === 'post') {
      const posts = await Post.find().populate(populateOptions);
      allPosts.push(...posts);
    }
    if (!type || type === 'post_6') {
      const post_6 = await Post_6.find().populate(populateOptions);
      allPosts.push(...post_6);
    }

    // حذف البوستات يلي المستخدم تبعها undefined (لأنو ما طابق الدور)
    allPosts = allPosts.filter(post => post.user); 

    // ترتيب حسب التاريخ
    allPosts = allPosts.sort((a, b) => b.createdAt - a.createdAt);

    res.status(200).json({ data: allPosts });
  } catch (error) {
    next(error);
  }
});

// =======================================================================


exports.getOnePost = asyncHandler(async (req, res, next) => {
  const { id, type } = req.params;

  // تأكد من وجود النوع
  if (!type) {
    return res.status(400).json({ message: "Post type is required in the URL" });
  }

  // خيارات populate
  const populateOptions = [
    { path: 'user' },
    { path: 'comments.user_comment' },
  ];

  let post;
  switch (type) {
    case "post":
      post = await Post.findById(id).populate(populateOptions);
      break;
    case "post_1":
      post = await Post_1.findById(id).populate(populateOptions);
      break;
    case "post_2":
      post = await Post_2.findById(id).populate(populateOptions);
      break;
    case "post_3":
      post = await Post_3.findById(id).populate(populateOptions);
      break;
    case "post_4":
      post = await Post_4.findById(id).populate(populateOptions);
      break;
    case "post_6":
      post = await Post_6.findById(id).populate(populateOptions);
      break;
    default:
      return res.status(400).json({ message: "Invalid post type" });
  }

  if (!post) {
    return res.status(404).json({ message: "Post not found" });
  }

  res.status(200).json({ data: post });
});




// =======================================================================

exports.getUserPosts = asyncHandler(async (req, res, next) => {
  try {
    const userId = req.params.userId; // جلب معرف المستخدم من الطلب

    // جلب البوستات لكل سكيمة بناءً على معرف المستخدم
    const posts1 = await Post_1.find({ user: userId }).populate('user').populate('comments.user_comment');
    const posts2 = await Post_2.find({ user: userId }).populate('user').populate('comments.user_comment');
    const posts3 = await Post_3.find({ user: userId }).populate('user').populate('comments.user_comment');
    const posts4 = await Post_4.find({ user: userId }).populate('user').populate('comments.user_comment');
    const posts = await Post.find({ user: userId }).populate('user').populate('comments.user_comment');
    const post_6 = await Post_6.find({ user: userId }).populate('user').populate('comments.user_comment');
    
    // دمج جميع البوستات في مصفوفة واحدة
    let userPosts = [
      ...posts1,
      ...posts2,
      ...posts3,
      ...posts4,
      ...posts,
      ...post_6,
    ];

    // فرز البوستات حسب تاريخ الإنشاء من الأحدث إلى الأقدم
    userPosts = userPosts.sort((a, b) => b.createdAt - a.createdAt);

    // إرسال البيانات كاستجابة
    res.status(200).json({ data: userPosts });
  } catch (error) {
    next(error); // معالجة أي خطأ وتمريره إلى الـ Middleware
  }
});


// =======================================================================

exports.deletePost = asyncHandler(async (req, res, next) => {
  try {
    const { id } = req.params; // قراءة الـid من البرامس (params)
    let post;
    let schema;

    // البحث عن البوست في كل السكيمات
    post = await Post_1.findById(id);
    if (post) schema = "Post_1";

    if (!post) {
      post = await Post_2.findById(id);
      if (post) schema = "Post_2";
    }

    if (!post) {
      post = await Post_3.findById(id);
      if (post) schema = "Post_3";
    }

    if (!post) {
      post = await Post_4.findById(id);
      if (post) schema = "Post_4";
    }

    if (!post) {
      post = await Post.findById(id);
      if (post) schema = "post";
    }
    if (!post) {
      post = await Post_6.findById(id);
      if (post) schema = "post_6";
    }

    // التحقق من وجود البوست
    if (!post) {
      return res.status(404).json({ message: "Post not found." });
    }

    // التحقق من أن المستخدم الحالي هو نفس الذي أنشأ البوست
    if (post.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "You do not have permission to delete this post." });
    }

    // حذف البوست
    await post.deleteOne();

    res.status(200).json({
      message: "Post has been successfully deleted.",
      schema, // إرسال اسم السكيمة للتأكيد
    });
  } catch (error) {
    next(error); // في حالة وجود خطأ، يتم تمرير الخطأ إلى Middleware للمعالجة
  }
});
// exports.deletePost = asyncHandler(async (req, res, next) => {
//   try {
//     await Promise.all([
//       Post_1.deleteMany({}),
//       Post_2.deleteMany({}),
//       Post_3.deleteMany({}),
//       Post_4.deleteMany({}),
//       Post.deleteMany({}),
//       Post_6.deleteMany({}),
//     ]);

//     res.status(200).json({ message: "All posts have been deleted successfully." });
//   } catch (error) {
//     next(error);
//   }
// });




// =================================================================


const schemas = [Post_1, Post_2, Post_3, Post_4, Post,Post_6]; // جميع السكيمات مجمعة في مصفوفة

exports.create_post_comments = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  const userId = req.user._id;

  // التحقق من وجود التعليق
  if (!req.body.comment) {
    return next(new ApiError("يجب كتابة تعليق صالح.", 400));
  }

  let postFound = null;
  let schemaUsed = null;

  // البحث عن البوست في جميع السكيمات
  for (const schema of schemas) {
    postFound = await schema.findById(id);
    if (postFound) {
      schemaUsed = schema;
      break;
    }
  }

  if (!postFound) {
    return next(new ApiError(`لا يوجد بوست بهذا المعرف ${id}.`, 404));
  }

  // استخدام push لإضافة التعليق ثم الحفظ
  postFound.comments.push({
    comment: req.body.comment,
    user_comment: userId,
  });

  await postFound.save();

  res.status(200).json({ data: postFound }); // الرد بعد التحديث
});




// ================================================================================

// const schemas = [Post_1, Post_2, Post_3, Post_4]; // جميع السكيمات مجمعة في مصفوفة

exports.toggle_post_like = asyncHandler(async (req, res, next) => {
  const { id } = req.params; // معرف البوست
  const userId = req.user._id; // معرف المستخدم

  let postFound = null; // لتخزين البوست الذي يتم العثور عليه
  let schemaUsed = null; // لتحديد السكيمة المستخدمة

  // البحث بالتسلسل في جميع السكيمات
  for (const schema of schemas) {
    postFound = await schema.findById(id);
    if (postFound) {
      schemaUsed = schema; // تحديد السكيمة التي تم العثور فيها على البوست
      break;
    }
  }

  if (!postFound) {
    return next(new ApiError(`لا توجد مشاركة بهذا الرقم ${id}.`, 404)); // إذا لم يتم العثور على البوست
  }

  // التحقق إذا كان "likes" يحتوي على المستخدم الحالي
  if (!Array.isArray(postFound.likes)) {
    postFound.likes = []; // تهيئة الحقل كمصفوفة إذا لم يكن موجودًا أو معرفًا بشكل صحيح
  }

  const userLikeIndex = postFound.likes.findIndex((like) => like.toString() === userId.toString());

  if (userLikeIndex === -1) {
    // إضافة إعجاب إذا لم يكن موجودًا
    postFound.likes.push(userId);
  } else {
    // إزالة الإعجاب إذا كان موجودًا
    postFound.likes.splice(userLikeIndex, 1);
  }

  // حفظ التغييرات
  await postFound.save();

  res.status(200).json({ data: postFound }); // رد النجاح مع البيانات المحدثة
});