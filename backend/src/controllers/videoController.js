const crypto = require("crypto");
const prisma = require("../lib/prisma");
const logger = require("../utils/logger");
const { isLessonUnlockedForUser } = require("../services/lessonUnlockService");
const {
  getSupabaseAdmin,
  getVideoBucket,
  getVideoSignedUrlTtl,
} = require("../lib/supabase");
const bunny = require("../lib/bunnyStream");

function useBunnyStream() {
  return process.env.VIDEO_PROVIDER?.trim().toLowerCase() === "bunny";
}

const allowedVideoTypes = {
  "video/mp4": "mp4",
  "video/webm": "webm",
  "video/quicktime": "mov",
};

const defaultMaximumSize = 500 * 1024 * 1024;

function getMaximumVideoSize() {
  const configuredSize = Number(
    process.env.MAX_VIDEO_SIZE_BYTES,
  );

  if (
    Number.isInteger(configuredSize) &&
    configuredSize > 0
  ) {
    return configuredSize;
  }

  return defaultMaximumSize;
}

function parsePositiveInteger(value) {
  const parsedValue = Number(value);

  if (
    !Number.isInteger(parsedValue) ||
    parsedValue < 1
  ) {
    return null;
  }

  return parsedValue;
}

function validateBunnyUploadBinding(lesson, videoId, now = new Date()) {
  if (!lesson.pendingVideoProviderId || lesson.pendingVideoProviderId !== videoId) {
    return { status: 400, error: "Bu Bunny videosu həmin dərs üçün yaradılmayıb." };
  }
  if (!lesson.pendingVideoExpiresAt || new Date(lesson.pendingVideoExpiresAt) <= now) {
    return { status: 410, error: "Video yükləmə sessiyasının vaxtı bitib. Yeni yükləmə keçidi yaradın." };
  }
  return null;
}

async function createLessonUploadUrl(req, res) {
  const lessonId = parsePositiveInteger(
    req.params.lessonId,
  );

  const {
    contentType,
    sizeBytes,
  } = req.body;

  if (!lessonId) {
    return res.status(400).json({
      error: "Dərs identifikatoru yanlışdır.",
    });
  }

  if (!allowedVideoTypes[contentType]) {
    return res.status(400).json({
      error:
        "Yalnız MP4, WebM və MOV video formatlarına icazə verilir.",
    });
  }

  const normalizedSize = Number(sizeBytes);

  if (
    !Number.isInteger(normalizedSize) ||
    normalizedSize < 1
  ) {
    return res.status(400).json({
      error: "Video faylının ölçüsü yanlışdır.",
    });
  }

  if (normalizedSize > getMaximumVideoSize()) {
    return res.status(413).json({
      error:
        "Video faylı icazə verilən maksimum ölçüdən böyükdür.",
    });
  }

  try {
    const lesson = await prisma.lesson.findUnique({
      where: {
        id: lessonId,
      },
      include: {
        module: {
          select: {
            id: true,
            courseId: true,
          },
        },
      },
    });

    if (!lesson) {
      return res.status(404).json({
        error: "Dərs tapılmadı.",
      });
    }

    if (useBunnyStream()) {
      const video = await bunny.createVideo(`${lesson.module.courseId}-${lesson.id}-${lesson.title}`);
      const pendingVideoExpiresAt = new Date(Date.now() + 60 * 60 * 1000);
      try {
        await prisma.lesson.update({
          where: { id: lessonId },
          data: { pendingVideoProviderId: video.guid, pendingVideoExpiresAt },
        });
      } catch (error) {
        await bunny.deleteVideo(video.guid).catch((cleanupError) => logger.error("Yarımçıq Bunny videosu silinərkən xəta:", cleanupError));
        throw error;
      }
      if (lesson.pendingVideoProviderId && lesson.pendingVideoProviderId !== video.guid) {
        await bunny.deleteVideo(lesson.pendingVideoProviderId).catch((error) => logger.error("Əvvəlki yarımçıq Bunny videosu silinərkən xəta:", error));
      }
      return res.status(201).json({
        provider: "BUNNY",
        videoId: video.guid,
        contentType,
        sizeBytes: normalizedSize,
        ...bunny.createTusCredentials(video.guid),
      });
    }

    const extension =
      allowedVideoTypes[contentType];

    const videoPath = [
      "courses",
      lesson.module.courseId,
      "modules",
      lesson.module.id,
      "lessons",
      lesson.id,
      `${crypto.randomUUID()}.${extension}`,
    ].join("/");

    const bucket = getVideoBucket();
    const supabase = getSupabaseAdmin();

    const {
      data,
      error,
    } = await supabase.storage
      .from(bucket)
      .createSignedUploadUrl(videoPath, {
        upsert: false,
      });

    if (error) {
      throw error;
    }

    return res.status(201).json({
      bucket,
      path: videoPath,
      token: data.token,
      signedUrl: data.signedUrl,
      expiresIn: 7200,
      contentType,
      sizeBytes: normalizedSize,
    });
  } catch (error) {
    logger.error(
      "Video yükləmə keçidi yaradılarkən xəta:",
      error,
    );

    return res.status(500).json({
      error:
        "Video yükləmə keçidini yaratmaq mümkün olmadı.",
    });
  }
}

async function completeLessonVideoUpload(req, res) {
  const lessonId = parsePositiveInteger(
    req.params.lessonId,
  );

  const {
    path: videoPath,
    contentType,
    sizeBytes,
    durationSeconds,
  } = req.body;

  if (!lessonId) {
    return res.status(400).json({
      error: "Dərs identifikatoru yanlışdır.",
    });
  }

  if (req.body.provider === "BUNNY") {
    const videoId = typeof req.body.videoId === "string" ? req.body.videoId.trim() : "";
    if (!videoId) return res.status(400).json({ error: "Bunny video identifikatoru daxil edilməyib." });
    try {
      const lesson = await prisma.lesson.findUnique({ where: { id: lessonId } });
      if (!lesson) return res.status(404).json({ error: "Dərs tapılmadı." });
      const bindingError = validateBunnyUploadBinding(lesson, videoId);
      if (bindingError) return res.status(bindingError.status).json({ error: bindingError.error });
      const video = await bunny.getVideo(videoId);
      if (video.status === 5) {
        return res.status(422).json({ error: "Bunny Stream videonu emal edə bilmədi.", status: video.status });
      }
      if (lesson.videoProvider === "BUNNY" && lesson.videoProviderId && lesson.videoProviderId !== videoId) {
        await bunny.deleteVideo(lesson.videoProviderId).catch((error) => logger.error("Köhnə Bunny videosu silinərkən xəta:", error));
      }
      const updatedLesson = await prisma.lesson.update({
        where: { id: lessonId },
        data: { videoProvider: "BUNNY", videoProviderId: videoId, pendingVideoProviderId: null, pendingVideoExpiresAt: null, videoPath: null, videoMimeType: req.body.contentType || null, videoSizeBytes: Number(req.body.sizeBytes) || null, durationSeconds: Number(video.length) || Number(req.body.durationSeconds) || null },
      });
      return res.status(200).json(updatedLesson);
    } catch (error) {
      logger.error("Bunny video yüklənməsi tamamlanarkən xəta:", error);
      return res.status(500).json({ error: "Bunny video məlumatlarını yadda saxlamaq mümkün olmadı." });
    }
  }

  if (
    typeof videoPath !== "string" ||
    !videoPath.trim()
  ) {
    return res.status(400).json({
      error: "Video faylının yolu daxil edilməyib.",
    });
  }

  if (!allowedVideoTypes[contentType]) {
    return res.status(400).json({
      error: "Video formatı yanlışdır.",
    });
  }

  const normalizedSize = Number(sizeBytes);

  if (
    !Number.isInteger(normalizedSize) ||
    normalizedSize < 1 ||
    normalizedSize > getMaximumVideoSize()
  ) {
    return res.status(400).json({
      error: "Video faylının ölçüsü yanlışdır.",
    });
  }

  const normalizedDuration =
    durationSeconds === undefined ||
    durationSeconds === null
      ? null
      : Number(durationSeconds);

  if (
    normalizedDuration !== null &&
    (
      !Number.isInteger(normalizedDuration) ||
      normalizedDuration < 0
    )
  ) {
    return res.status(400).json({
      error: "Video müddəti yanlışdır.",
    });
  }

  try {
    const lesson = await prisma.lesson.findUnique({
      where: {
        id: lessonId,
      },
      include: {
        module: {
          select: {
            id: true,
            courseId: true,
          },
        },
      },
    });

    if (!lesson) {
      return res.status(404).json({
        error: "Dərs tapılmadı.",
      });
    }

    const expectedPrefix = [
      "courses",
      lesson.module.courseId,
      "modules",
      lesson.module.id,
      "lessons",
      lesson.id,
      "",
    ].join("/");

    if (!videoPath.startsWith(expectedPrefix)) {
      return res.status(400).json({
        error:
          "Video yolu bu dərsə uyğun deyil.",
      });
    }

    const pathParts = videoPath.split("/");
    const fileName = pathParts.pop();
    const folderPath = pathParts.join("/");

    const supabase = getSupabaseAdmin();
    const bucket = getVideoBucket();

    const {
      data: storedFiles,
      error: storageError,
    } = await supabase.storage
      .from(bucket)
      .list(folderPath, {
        search: fileName,
        limit: 10,
      });

    if (storageError) {
      throw storageError;
    }

    const uploadedFileExists =
      storedFiles?.some(
        (file) => file.name === fileName,
      );

    if (!uploadedFileExists) {
      return res.status(400).json({
        error:
          "Yüklənmiş video Supabase Storage daxilində tapılmadı.",
      });
    }

    if (
      lesson.videoPath &&
      lesson.videoPath !== videoPath
    ) {
      const {
        error: removeError,
      } = await supabase.storage
        .from(bucket)
        .remove([lesson.videoPath]);

      if (removeError) {
        logger.error(
          "Köhnə video silinərkən xəta:",
          removeError,
        );
      }
    }

    const updatedLesson =
      await prisma.lesson.update({
        where: {
          id: lessonId,
        },
        data: {
          videoPath,
          videoProvider: "SUPABASE",
          videoProviderId: null,
          videoMimeType: contentType,
          videoSizeBytes: normalizedSize,
          durationSeconds: normalizedDuration,
        },
      });

    return res.status(200).json(updatedLesson);
  } catch (error) {
    logger.error(
      "Video yüklənməsi tamamlanarkən xəta:",
      error,
    );

    return res.status(500).json({
      error:
        "Video məlumatlarını yadda saxlamaq mümkün olmadı.",
    });
  }
}

async function getLessonVideoUrl(req, res) {
  const lessonId = parsePositiveInteger(
    req.params.lessonId,
  );

  if (!lessonId) {
    return res.status(400).json({
      error: "Dərs identifikatoru yanlışdır.",
    });
  }

  try {
    const lesson = await prisma.lesson.findUnique({
      where: {
        id: lessonId,
      },
      include: {
        module: {
          select: {
            courseId: true,
          },
        },
      },
    });

    if (!lesson) {
      return res.status(404).json({
        error: "Dərs tapılmadı.",
      });
    }

    if (!lesson.videoPath && !lesson.videoProviderId) {
      return res.status(404).json({
        error: "Bu dərs üçün video yüklənməyib.",
      });
    }

    const user = req.user ? await prisma.user.findUnique({
      where: {
        id: req.user.id,
      },
      select: {
        role: true,
        email: true,
      },
    }) : null;

    if (!user && !lesson.isFreePreview) {
      return res.status(401).json({
        error: "İstifadəçi tapılmadı.",
      });
    }

    const isAdmin = user?.role === "ADMIN";

    if (!isAdmin) {
      if (!lesson.published) {
        return res.status(403).json({
          error:
            "Bu dərs hələ yayımlanmayıb.",
        });
      }

      const enrollment = user ? await prisma.enrollment.findUnique({
          where: {
            userId_courseId: {
              userId: req.user.id,
              courseId: lesson.module.courseId,
            },
          },
          select: {
            id: true,
          },
        }) : null;

      if (!lesson.isFreePreview) {
        if (!enrollment) {
          return res.status(403).json({
            error:
              "Bu videoya baxmaq üçün kursa qeydiyyatdan keçməlisiniz.",
          });
        }
      }

      if (enrollment && !(await isLessonUnlockedForUser(req.user.id, lesson.module.courseId, lesson.id))) {
        return res.status(403).json({
          error: "Əvvəlki dərsi tamamlayın və tələb olunan dərs testindən keçin.",
        });
      }
    }

    if (lesson.videoProvider === "BUNNY" && lesson.videoProviderId) {
      const expiresIn = getVideoSignedUrlTtl();
      const access = bunny.createEmbedUrl(lesson.videoProviderId, expiresIn);
      return res.status(200).json({ ...access, playbackType: "embed", provider: "BUNNY", lessonId: lesson.id, title: lesson.title, watermark: user ? { userId: user.id, email: user.email } : { userId: "preview", email: "Synex Academy" } });
    }

    const expiresIn = getVideoSignedUrlTtl();
    const supabase = getSupabaseAdmin();

    const {
      data,
      error,
    } = await supabase.storage
      .from(getVideoBucket())
      .createSignedUrl(
        lesson.videoPath,
        expiresIn,
      );

    if (error) {
      throw error;
    }

    return res.status(200).json({
      url: data.signedUrl,
      expiresIn,
      lessonId: lesson.id,
      title: lesson.title,
      playbackType: "file",
      provider: "SUPABASE",
      watermark: user ? { userId: user.id, email: user.email } : { userId: "preview", email: "Synex Academy" },
    });
  } catch (error) {
    logger.error(
      "Video izləmə keçidi yaradılarkən xəta:",
      error,
    );

    return res.status(500).json({
      error:
        "Video izləmə keçidini yaratmaq mümkün olmadı.",
    });
  }
}

async function deleteLessonVideo(req, res) {
  const lessonId = parsePositiveInteger(
    req.params.lessonId,
  );

  if (!lessonId) {
    return res.status(400).json({
      error: "Dərs identifikatoru yanlışdır.",
    });
  }

  try {
    const lesson = await prisma.lesson.findUnique({
      where: {
        id: lessonId,
      },
    });

    if (!lesson) {
      return res.status(404).json({
        error: "Dərs tapılmadı.",
      });
    }

    if (!lesson.videoPath && !lesson.videoProviderId) {
      return res.status(404).json({
        error: "Bu dərs üçün video tapılmadı.",
      });
    }

    if (lesson.videoProvider === "BUNNY" && lesson.videoProviderId) {
      await bunny.deleteVideo(lesson.videoProviderId);
    } else {
      const supabase = getSupabaseAdmin();

    const {
      error: storageError,
    } = await supabase.storage
      .from(getVideoBucket())
      .remove([lesson.videoPath]);

    if (storageError) {
      throw storageError;
    }
    }

    await prisma.lesson.update({
      where: {
        id: lessonId,
      },
      data: {
        videoPath: null,
        videoProvider: null,
        videoProviderId: null,
        videoMimeType: null,
        videoSizeBytes: null,
        durationSeconds: null,
      },
    });

    return res.status(204).send();
  } catch (error) {
    logger.error(
      "Video silinərkən xəta:",
      error,
    );

    return res.status(500).json({
      error: "Videonu silmək mümkün olmadı.",
    });
  }
}

module.exports = {
  createLessonUploadUrl,
  completeLessonVideoUpload,
  getLessonVideoUrl,
  deleteLessonVideo,
  validateBunnyUploadBinding,
};
