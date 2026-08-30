import { useEffect, useState } from "react";
import {
  AlertCircle,
  CheckCircle2,
  FileUp,
  GraduationCap,
  LoaderCircle,
  Mail,
  MapPin,
  Save,
  Sparkles,
  Trash2,
  UserRound,
} from "lucide-react";
import {
  completeCvUpload,
  deleteMyCv,
  getMyCv,
  requestCvUploadUrl,
} from "../api/cvApi.js";
import { useAuth } from "../context/AuthContext.jsx";

function ProfilePage() {
  const { user, updateProfile } = useAuth();

  const [formData, setFormData] = useState({
    name: user?.name || "",
    education: user?.education || "",
    location: user?.location || "",
    interests: user?.interests?.join(", ") || "",
    skills: user?.skills?.join(", ") || "",
    bio: user?.bio || "",
  });

  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [cv, setCv] = useState(null);
  const [isCvLoading, setIsCvLoading] = useState(false);
  const [isCvUploading, setIsCvUploading] = useState(false);

  useEffect(() => {
    async function loadCv() {
      if (!user?.id) {
        return;
      }

      try {
        setIsCvLoading(true);
        const fetchedCv = await getMyCv();
        setCv(fetchedCv);
      } catch {
        setCv(null);
      } finally {
        setIsCvLoading(false);
      }
    }

    loadCv();
  }, [user?.id]);

  function handleChange(event) {
    const { name, value } = event.target;

    setFormData((current) => ({
      ...current,
      [name]: value,
    }));

    setSuccessMessage("");
    setErrorMessage("");
  }

  function convertToList(value) {
    return value
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean);
  }

  async function handleSubmit(event) {
    event.preventDefault();

    setSuccessMessage("");
    setErrorMessage("");

    if (formData.name.trim().length < 2) {
      setErrorMessage("Ad və soyad ən azı 2 simvoldan ibarət olmalıdır.");
      return;
    }

    const profileData = {
      name: formData.name.trim(),
      education: formData.education.trim(),
      location: formData.location.trim(),
      interests: convertToList(formData.interests),
      skills: convertToList(formData.skills),
      bio: formData.bio.trim(),
    };

    try {
      setIsSaving(true);

      const result = await updateProfile(profileData);

      if (!result.success) {
        setErrorMessage(
          result.message || "Profil məlumatlarını yeniləmək mümkün olmadı.",
        );
        return;
      }

      setSuccessMessage("Profil məlumatları uğurla yeniləndi.");
    } catch {
      setErrorMessage(
        "Serverlə əlaqə yaratmaq mümkün olmadı. Yenidən cəhd edin.",
      );
    } finally {
      setIsSaving(false);
    }
  }

  async function handleCvUpload(event) {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    const validTypes = [
      "application/pdf",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    ];
    const validExtension = /\.(pdf|doc|docx)$/i.test(file.name);

    if (!validExtension && !validTypes.includes(file.type)) {
      setErrorMessage("CV yalnız PDF, DOC və DOCX formatında yüklənə bilər.");
      event.target.value = "";
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setErrorMessage("CV faylı 5 MB-dan böyük ola bilməz.");
      event.target.value = "";
      return;
    }

    try {
      setIsCvUploading(true);
      setSuccessMessage("");
      setErrorMessage("");

      const uploadInfo = await requestCvUploadUrl(
        file.name,
        file.type || "application/octet-stream",
        file.size,
      );

      await fetch(uploadInfo.uploadUrl, {
        method: "PUT",
        headers: {
          "Content-Type": file.type || "application/octet-stream",
        },
        body: file,
      });

      const updatedCv = await completeCvUpload(
        uploadInfo.path,
        file.name,
        file.type || "application/octet-stream",
      );

      setCv(updatedCv);
      setSuccessMessage("CV uğurla yükləndi.");
    } catch (uploadError) {
      setErrorMessage(
        uploadError?.message || "CV yüklənərkən xəta baş verdi.",
      );
    } finally {
      setIsCvUploading(false);
      event.target.value = "";
    }
  }

  async function handleDeleteCv() {
    try {
      setIsCvLoading(true);
      const result = await deleteMyCv();

      if (result.deleted) {
        setCv(null);
        setSuccessMessage("CV uğurla silindi.");
      }
    } catch (deleteError) {
      setErrorMessage(
        deleteError?.message || "CV silmək mümkün olmadı.",
      );
    } finally {
      setIsCvLoading(false);
    }
  }

  return (
    <>
      <section className="page-hero profile-hero">
        <div className="container profile-hero-content">
          <div className="profile-avatar-large" aria-hidden="true">
            {user?.name?.charAt(0).toUpperCase() || (
              <UserRound size={34} />
            )}
          </div>

          <div>
            <span className="eyebrow">Şəxsi kabinet</span>
            <h1>{user?.name}</h1>
            <p>
              Profilini yenilə və karyera məqsədlərini daha yaxşı
              müəyyənləşdir.
            </p>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container profile-layout">
          <aside className="profile-sidebar">
            <div className="sidebar-card">
              <h2>Hesab məlumatları</h2>

              <div className="profile-info-row">
                <Mail size={19} aria-hidden="true" />

                <div>
                  <span>E-poçt</span>
                  <strong>{user?.email}</strong>
                </div>
              </div>

              <div className="profile-info-row">
                <MapPin size={19} aria-hidden="true" />

                <div>
                  <span>Məkan</span>
                  <strong>
                    {user?.location || "Hələ əlavə edilməyib"}
                  </strong>
                </div>
              </div>

              <div className="profile-info-row">
                <GraduationCap size={19} aria-hidden="true" />

                <div>
                  <span>Təhsil</span>
                  <strong>
                    {user?.education || "Hələ əlavə edilməyib"}
                  </strong>
                </div>
              </div>
            </div>

            <div className="sidebar-card profile-tip">
              <Sparkles size={25} aria-hidden="true" />

              <h2>Profilini tamamla</h2>

              <p>
                Bacarıq və maraqlarını əlavə etmək gələcəkdə daha uyğun
                karyera tövsiyələri almağa kömək edəcək.
              </p>
            </div>

            <div className="sidebar-card cv-card">
              <div className="content-card-heading compact-heading">
                <FileUp size={22} aria-hidden="true" />

                <div>
                  <h2>CV</h2>
                </div>
              </div>

              {isCvLoading ? (
                <p className="muted-text">CV yüklənir...</p>
              ) : cv ? (
                <>
                  <p className="cv-file-name">{cv.originalName}</p>

                  <div className="cv-actions">
                    <a
                      className="button button-secondary"
                      href={cv.publicUrl || "#"}
                      target={cv.publicUrl ? "_blank" : undefined}
                      rel={cv.publicUrl ? "noreferrer" : undefined}
                    >
                      CV-ni aç
                    </a>

                    <button
                      type="button"
                      className="button button-danger-ghost"
                      onClick={handleDeleteCv}
                      disabled={isCvLoading}
                    >
                      <Trash2 size={16} aria-hidden="true" />
                      Sil
                    </button>
                  </div>
                </>
              ) : (
                <label className="upload-box">
                  <input
                    type="file"
                    accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                    onChange={handleCvUpload}
                    disabled={isCvUploading}
                  />

                  <span>
                    {isCvUploading
                      ? "Yüklənir..."
                      : "CV yüklə"}
                  </span>
                </label>
              )}
            </div>
          </aside>

          <div className="profile-form-card">
            <div className="content-card-heading">
              <UserRound size={25} aria-hidden="true" />

              <div>
                <h2>Profil məlumatları</h2>

                <p>
                  Şəxsi və peşəkar məlumatlarını burada idarə et.
                </p>
              </div>
            </div>

            {successMessage && (
              <div className="alert alert-success" role="status">
                <CheckCircle2 size={19} aria-hidden="true" />
                <span>{successMessage}</span>
              </div>
            )}

            {errorMessage && (
              <div className="alert alert-error" role="alert">
                <AlertCircle size={19} aria-hidden="true" />
                <span>{errorMessage}</span>
              </div>
            )}

            <form className="profile-form" onSubmit={handleSubmit}>
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="profile-name">Ad və soyad</label>

                  <input
                    id="profile-name"
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    minLength="2"
                    disabled={isSaving}
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="profile-email">
                    E-poçt ünvanı
                  </label>

                  <input
                    id="profile-email"
                    type="email"
                    value={user?.email || ""}
                    disabled
                  />

                  <small className="form-help">
                    E-poçt ünvanı dəyişdirilə bilməz.
                  </small>
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="profile-education">Təhsil</label>

                  <input
                    id="profile-education"
                    type="text"
                    name="education"
                    value={formData.education}
                    onChange={handleChange}
                    placeholder="Məsələn: Holberton School"
                    disabled={isSaving}
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="profile-location">
                    Yaşadığın şəhər
                  </label>

                  <input
                    id="profile-location"
                    type="text"
                    name="location"
                    value={formData.location}
                    onChange={handleChange}
                    placeholder="Məsələn: Bakı"
                    disabled={isSaving}
                  />
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="profile-interests">
                  Maraq sahələri
                </label>

                <input
                  id="profile-interests"
                  type="text"
                  name="interests"
                  value={formData.interests}
                  onChange={handleChange}
                  placeholder="Texnologiya, dizayn, marketinq"
                  disabled={isSaving}
                />

                <small className="form-help">
                  Maraq sahələrini vergüllə ayırın.
                </small>
              </div>

              <div className="form-group">
                <label htmlFor="profile-skills">
                  Mövcud bacarıqlar
                </label>

                <input
                  id="profile-skills"
                  type="text"
                  name="skills"
                  value={formData.skills}
                  onChange={handleChange}
                  placeholder="HTML, CSS, JavaScript"
                  disabled={isSaving}
                />

                <small className="form-help">
                  Bacarıqları vergüllə ayırın.
                </small>
              </div>

              <div className="form-group">
                <label htmlFor="profile-bio">Haqqında</label>

                <textarea
                  id="profile-bio"
                  name="bio"
                  value={formData.bio}
                  onChange={handleChange}
                  rows="5"
                  maxLength="500"
                  placeholder="Karyera məqsədlərin haqqında qısa məlumat yaz..."
                  disabled={isSaving}
                />

                <small className="form-help">
                  {formData.bio.length}/500 simvol
                </small>
              </div>

              <button
                type="submit"
                className="button button-primary button-large"
                disabled={isSaving}
              >
                {isSaving ? (
                  <>
                    <LoaderCircle
                      className="loading-spinner"
                      size={19}
                      aria-hidden="true"
                    />
                    Yadda saxlanılır...
                  </>
                ) : (
                  <>
                    <Save size={19} aria-hidden="true" />
                    Dəyişiklikləri yadda saxla
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      </section>
    </>
  );
}

export default ProfilePage;