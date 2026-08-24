import {
  useState,
} from "react";
import {
  GraduationCap,
  Video,
} from "lucide-react";

import VideoUploader from "../components/admin/VideoUploader.jsx";

function AdminVideoPage() {
  const [lessonIdInput, setLessonIdInput] =
    useState("1");

  const [activeLessonId, setActiveLessonId] =
    useState(1);

  const [lessonReloadKey, setLessonReloadKey] =
    useState(0);

  function handleLessonSelect(event) {
    event.preventDefault();

    const lessonId = Number(lessonIdInput);

    if (
      Number.isInteger(lessonId) &&
      lessonId > 0
    ) {
      setActiveLessonId(lessonId);
      setLessonReloadKey(
        (currentKey) => currentKey + 1,
      );
    }
  }

  return (
    <section className="admin-page">
      <div className="admin-page-header">
        <div>
          <span className="admin-page-eyebrow">
            Təlim idarəetməsi
          </span>

          <h1>Video dərslər</h1>

          <p>
            Dərs üçün təhlükəsiz video
            yükləyin və mövcud videonu idarə
            edin.
          </p>
        </div>
      </div>

      <div className="admin-video-lesson-selector">
        <div className="admin-video-selector-heading">
          <span className="admin-form-icon">
            <GraduationCap
              size={22}
              aria-hidden="true"
            />
          </span>

          <div>
            <h2>Dərsi seçin</h2>

            <p>
              Test üçün yaradılmış demo dərsin
              identifikatoru 1-dir.
            </p>
          </div>
        </div>

        <form onSubmit={handleLessonSelect}>
          <label htmlFor="video-lesson-id">
            Dərs ID
          </label>

          <div>
            <input
              id="video-lesson-id"
              type="number"
              min="1"
              step="1"
              value={lessonIdInput}
              onChange={(event) =>
                setLessonIdInput(
                  event.target.value,
                )
              }
              required
            />

            <button
              className="button button-secondary"
              type="submit"
            >
              <Video
                size={18}
                aria-hidden="true"
              />
              Dərsi aç
            </button>
          </div>
        </form>
      </div>

      <VideoUploader
        key={`${activeLessonId}-${lessonReloadKey}`}
        lessonId={activeLessonId}
      />
    </section>
  );
}

export default AdminVideoPage;
