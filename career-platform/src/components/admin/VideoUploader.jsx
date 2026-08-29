import {
  CheckCircle2,
  LoaderCircle,
  Trash2,
  UploadCloud,
  Video,
} from "lucide-react";
import {
  useEffect,
  useRef,
  useState,
} from "react";

import {
  deleteLessonVideo,
  getLessonVideoUrl,
  uploadLessonVideo,
} from "../../api/videoApi.js";
import {
  getApiErrorMessage,
} from "../../api/client.js";
import Notification from "../common/Notification.jsx";

const maximumFileSize = 500 * 1024 * 1024;

const allowedVideoTypes = [
  "video/mp4",
  "video/webm",
  "video/quicktime",
];

function formatFileSize(size) {
  const numericSize = Number(size);

  if (!Number.isFinite(numericSize)) {
    return "";
  }

  return `${(numericSize / 1024 / 1024).toFixed(
    1,
  )} MB`;
}

function getVideoDuration(file) {
  return new Promise((resolve) => {
    const videoElement =
      document.createElement("video");

    const objectUrl =
      URL.createObjectURL(file);

    videoElement.preload = "metadata";

    function cleanup() {
      URL.revokeObjectURL(objectUrl);
      videoElement.remove();
    }

    videoElement.onloadedmetadata = () => {
      const duration = Number.isFinite(
        videoElement.duration,
      )
        ? Math.round(videoElement.duration)
        : null;

      cleanup();
      resolve(duration);
    };

    videoElement.onerror = () => {
      cleanup();
      resolve(null);
    };

    videoElement.src = objectUrl;
  });
}

function VideoUploader({
  lessonId,
  initialVideo = null,
  onUploaded,
  onDeleted,
}) {
  const inputRef = useRef(null);

  const [selectedFile, setSelectedFile] =
    useState(null);

  const [uploadedVideo, setUploadedVideo] =
    useState(initialVideo);

  const [isPreviewOpen, setIsPreviewOpen] =
    useState(false);

  const [isLoadingVideo, setIsLoadingVideo] =
    useState(true);

  const [isUploading, setIsUploading] =
    useState(false);

  const [isDeleting, setIsDeleting] =
    useState(false);

  const [notification, setNotification] =
    useState(null);

  useEffect(() => {
    const controller = new AbortController();

    setIsPreviewOpen(false);

    async function loadExistingVideo() {
      setIsLoadingVideo(true);
      setNotification(null);

      try {
        const video =
          await getLessonVideoUrl(lessonId, {
            signal: controller.signal,
          });

        setUploadedVideo(video);
      } catch (error) {
        if (
          error.name !== "AbortError" &&
          error.status !== 404
        ) {
          setNotification({
            type: "error",
            message: getApiErrorMessage(error),
          });
        }

        setUploadedVideo(null);
      } finally {
        if (!controller.signal.aborted) {
          setIsLoadingVideo(false);
        }
      }
    }

    if (lessonId) {
      loadExistingVideo();
    } else {
      setUploadedVideo(null);
      setIsLoadingVideo(false);
    }

    return () => {
      controller.abort();
    };
  }, [lessonId]);

  function handleFileChange(event) {
    const file = event.target.files?.[0];

    setNotification(null);

    if (!file) {
      setSelectedFile(null);
      return;
    }

    if (!allowedVideoTypes.includes(file.type)) {
      setSelectedFile(null);

      setNotification({
        type: "error",
        message:
          "Yalnız MP4, WebM və MOV videolarına icazə verilir.",
      });

      event.target.value = "";
      return;
    }

    if (file.size > maximumFileSize) {
      setSelectedFile(null);

      setNotification({
        type: "error",
        message:
          "Video faylı 500 MB-dan böyük ola bilməz.",
      });

      event.target.value = "";
      return;
    }

    setSelectedFile(file);
  }

  async function handleUpload() {
    if (!selectedFile || !lessonId) {
      setNotification({
        type: "error",
        message:
          "Yükləmək üçün video faylı seçin.",
      });

      return;
    }

    setIsUploading(true);
    setNotification(null);

    try {
      const durationSeconds =
        await getVideoDuration(selectedFile);

      const updatedLesson =
        await uploadLessonVideo(
          lessonId,
          selectedFile,
          {
            durationSeconds,
          },
        );

      const video =
        await getLessonVideoUrl(lessonId);

      setUploadedVideo({
        ...video,
        path: updatedLesson.videoPath,
        contentType:
          updatedLesson.videoMimeType,
        sizeBytes:
          updatedLesson.videoSizeBytes,
        durationSeconds:
          updatedLesson.durationSeconds,
      });

      setIsPreviewOpen(false);

      setSelectedFile(null);

      if (inputRef.current) {
        inputRef.current.value = "";
      }

      setNotification({
        type: "success",
        message: "Video uğurla yükləndi.",
      });

      onUploaded?.(updatedLesson);
    } catch (error) {
      setNotification({
        type: "error",
        message: getApiErrorMessage(error),
      });
    } finally {
      setIsUploading(false);
    }
  }

  async function handleDelete() {
    if (!lessonId) {
      return;
    }

    const shouldDelete = window.confirm(
      "Bu dərsin videosunu silmək istədiyinizə əminsiniz?",
    );

    if (!shouldDelete) {
      return;
    }

    setIsDeleting(true);
    setNotification(null);

    try {
      await deleteLessonVideo(lessonId);

      setUploadedVideo(null);
      setIsPreviewOpen(false);

      setNotification({
        type: "success",
        message: "Video uğurla silindi.",
      });

      onDeleted?.();
    } catch (error) {
      setNotification({
        type: "error",
        message: getApiErrorMessage(error),
      });
    } finally {
      setIsDeleting(false);
    }
  }

  return (
    <section className="video-uploader">
      <div className="video-uploader-heading">
        <span className="video-uploader-icon">
          <Video size={22} aria-hidden="true" />
        </span>

        <div>
          <h3>Video dərs</h3>

          <p>
            MP4, WebM və ya MOV formatında,
            maksimum 500 MB.
          </p>
        </div>
      </div>

      {notification && (
        <Notification
          type={notification.type}
          message={notification.message}
          onClose={() =>
            setNotification(null)
          }
        />
      )}

      {isLoadingVideo && (
        <div className="video-uploaded-file">
          <LoaderCircle
            className="loading-spinner"
            size={21}
            aria-hidden="true"
          />

          <div>
            <strong>Video yoxlanılır...</strong>
            <span>
              Mövcud video məlumatı yüklənir
            </span>
          </div>
        </div>
      )}

      {!isLoadingVideo && uploadedVideo && (
        <div className="video-uploaded-file">
          <CheckCircle2
            size={21}
            aria-hidden="true"
          />

          <div>
            <strong>
              {uploadedVideo.title ||
                "Video yüklənib"}
            </strong>

            <span>
              {formatFileSize(
                uploadedVideo.sizeBytes,
              ) || "Video izləməyə hazırdır"}
            </span>
          </div>

          {uploadedVideo.url && (
            <div className="admin-video-preview-wrapper">
              <button
                className="button button-secondary"
                type="button"
                onClick={() =>
                  setIsPreviewOpen(
                    (current) => !current,
                  )
                }
              >
                <Video
                  size={18}
                  aria-hidden="true"
                />

                {isPreviewOpen
                  ? "Videonu bağla"
                  : "Videoya bax"}
              </button>

              {isPreviewOpen && (
                <div className="secure-video-frame admin-secure-video-frame">
                  {uploadedVideo.playbackType === "embed" ? (
                    <iframe className="admin-video-preview" src={uploadedVideo.url} title={uploadedVideo.title || "Video dərs"} allow="accelerometer; gyroscope; autoplay; encrypted-media; picture-in-picture" allowFullScreen />
                  ) : (
                    <video
                      className="admin-video-preview"
                      controls
                      preload="metadata"
                      src={uploadedVideo.url}
                    >
                      Brauzeriniz video elementini
                      dəstəkləmir.
                    </video>
                  )}

                  {uploadedVideo.watermark && (
                    <span className="video-user-watermark">
                      {uploadedVideo.watermark.email} · ID {uploadedVideo.watermark.userId}
                    </span>
                  )}
                </div>
              )}
            </div>
          )}

          <button
            className="admin-icon-button admin-icon-button-danger"
            type="button"
            disabled={isDeleting}
            onClick={handleDelete}
            aria-label="Videonu sil"
          >
            {isDeleting ? (
              <LoaderCircle
                className="loading-spinner"
                size={17}
                aria-hidden="true"
              />
            ) : (
              <Trash2
                size={17}
                aria-hidden="true"
              />
            )}
          </button>
        </div>
      )}

      <label className="video-dropzone">
        <UploadCloud
          size={34}
          aria-hidden="true"
        />

        <strong>Video faylını seçin</strong>

        <span>
          Faylı seçmək üçün klikləyin
        </span>

        <input
          ref={inputRef}
          type="file"
          accept="video/mp4,video/webm,video/quicktime,.mp4,.webm,.mov"
          disabled={isUploading}
          onChange={handleFileChange}
        />
      </label>

      {selectedFile && (
        <div className="video-selected-file">
          <Video size={20} aria-hidden="true" />

          <div>
            <strong>{selectedFile.name}</strong>
            <span>
              {formatFileSize(selectedFile.size)}
            </span>
          </div>
        </div>
      )}

      <button
        className="button button-primary"
        type="button"
        disabled={
          !selectedFile || isUploading
        }
        onClick={handleUpload}
      >
        {isUploading ? (
          <>
            <LoaderCircle
              className="loading-spinner"
              size={18}
              aria-hidden="true"
            />
            Video yüklənir...
          </>
        ) : (
          <>
            <UploadCloud
              size={18}
              aria-hidden="true"
            />
            Videonu yüklə
          </>
        )}
      </button>
    </section>
  );
}

export default VideoUploader;
