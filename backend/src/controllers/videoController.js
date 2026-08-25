const crypto = require("crypto");
const prisma = require("../lib/prisma");
const logger = require("../utils/logger");
const {
  getSupabaseAdmin,
  getVideoBucket,
  getVideoSignedUrlTtl,
} = require("../lib/supabase");

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

    if (!lesson.videoPath) {
      return res.status(404).json({
        error: "Bu dərs üçün video yüklənməyib.",
      });
    }

    const user = await prisma.user.findUnique({
      where: {
        id: req.user.id,
      },
      select: {
        role: true,
      },
    });

    if (!user) {
      return res.status(401).json({
        error: "İstifadəçi tapılmadı.",
      });
    }

    const isAdmin = user.role === "ADMIN";

    if (!isAdmin) {
      const enrollment =
        await prisma.enrollment.findUnique({
          where: {
            userId_courseId: {
              userId: req.user.id,
              courseId: lesson.module.courseId,
            },
          },
          select: {
            id: true,
          },
        });

      if (!enrollment) {
        return res.status(403).json({
          error:
            "Bu videoya baxmaq üçün kursa qeydiyyatdan keçməlisiniz.",
        });
      }

      if (!lesson.published) {
        return res.status(403).json({
          error:
            "Bu dərs hələ yayımlanmayıb.",
        });
      }
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

    if (!lesson.videoPath) {
      return res.status(404).json({
        error: "Bu dərs üçün video tapılmadı.",
      });
    }

    const supabase = getSupabaseAdmin();

    const {
      error: storageError,
    } = await supabase.storage
      .from(getVideoBucket())
      .remove([lesson.videoPath]);

    if (storageError) {
      throw storageError;
    }

    await prisma.lesson.update({
      where: {
        id: lessonId,
      },
      data: {
        videoPath: null,
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
};
