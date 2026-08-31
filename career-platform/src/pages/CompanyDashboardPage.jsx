import { useCallback, useEffect, useRef, useState } from "react";
import { Building2, Plus, Trash2 } from "lucide-react";
import { addCompanyEmployee, createCompanyJob, getCompanyDashboard, removeCompanyEmployee, saveCompany } from "../api/companyApi.js";
import { getApiErrorMessage } from "../api/client.js";
import PageLoader from "../components/common/PageLoader.jsx";
import Notification from "../components/common/Notification.jsx";

function CompanyDashboardPage() {
  const [data, setData] = useState(undefined);
  const [company, setCompany] = useState({ name: "", logoUrl: "" });
  const [email, setEmail] = useState("");
  const [job, setJob] = useState({ title: "", description: "", location: "", employmentType: "FULL_TIME", experienceLevel: "JUNIOR" });
  const [notice, setNotice] = useState(null);
  const noticeRef = useRef(null);
  const load = useCallback(async () => { try { const result = await getCompanyDashboard(); setData(result); if (result?.company) setCompany({ name: result.company.name, logoUrl: result.company.logoUrl || "" }); } catch (error) { setNotice({ type: "error", message: getApiErrorMessage(error) }); setData(null); } }, []);
  useEffect(() => { load(); }, [load]);
  useEffect(() => { if (notice) noticeRef.current?.scrollIntoView({ behavior: "smooth", block: "center" }); }, [notice]);
  async function run(action, message) { try { await action(); await load(); setNotice({ type: "success", message }); return true; } catch (error) { setNotice({ type: "error", message: getApiErrorMessage(error) }); return false; } }
  if (data === undefined) return <PageLoader message="Şirkət paneli yüklənir..." />;

  return <section className="section"><div className="container admin-page company-dashboard">
    <div className="admin-page-header"><div><span className="admin-page-eyebrow"><Building2 size={18} /> Korporativ B2B</span><h1>Şirkət paneli</h1><p>Əməkdaşların təlim nəticələrini izləyin və prioritet vakansiyalar yaradın.</p></div></div>
    {notice && <div ref={noticeRef}><Notification {...notice} onClose={() => setNotice(null)} /></div>}
    <form className="simple-card company-profile-card" onSubmit={async (event) => { event.preventDefault(); await run(() => saveCompany(company), "Şirkət profili saxlanıldı."); }}>
      <h2>Şirkət profili</h2><input value={company.name} onChange={(e) => setCompany({ ...company, name: e.target.value })} placeholder="Şirkət adı" required /><input value={company.logoUrl} onChange={(e) => setCompany({ ...company, logoUrl: e.target.value })} placeholder="Loqo URL (istəyə bağlı)" /><button className="button button-primary">Yadda saxla</button>
    </form>
    {data && <>
      <div className="company-stats">{Object.entries({ Əməkdaşlar: data.stats.employees, "Aktiv abunəlik": data.stats.activeSubscriptions, Qeydiyyatlar: data.stats.enrollments, Sertifikatlar: data.stats.certificates, "Prioritet vakansiyalar": data.stats.priorityJobs }).map(([label, value]) => <article className="simple-card company-stat-card" key={label}><h3>{value}</h3><p>{label}</p></article>)}</div>
      <div className="company-workspace">
        <section className="simple-card company-panel-card"><h2>Əməkdaşlar</h2><form className="company-employee-form" onSubmit={async (e) => { e.preventDefault(); if (await run(() => addCompanyEmployee(email), "Əməkdaş əlavə edildi.")) setEmail(""); }}><input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Synex hesabının e-poçtu" required /><button className="button button-primary"><Plus size={16} /> Əlavə et</button></form><div className="company-member-list">{data.members.map((member) => <p key={member.id}><span>{member.name}<small>{member.email} · {member.certificates} sertifikat</small></span>{member.userId !== data.company.ownerId && <button type="button" aria-label="Əməkdaşı sil" onClick={() => run(() => removeCompanyEmployee(member.id), "Əməkdaş silindi.")}><Trash2 size={16} /></button>}</p>)}</div></section>
        <form className="simple-card company-panel-card company-job-form" onSubmit={async (e) => { e.preventDefault(); if (await run(() => createCompanyJob(job), "Prioritet vakansiya yaradıldı.")) setJob({ title: "", description: "", location: "", employmentType: "FULL_TIME", experienceLevel: "JUNIOR" }); }}><h2>Prioritet vakansiya</h2><label>Vakansiya adı<input value={job.title} onChange={(e) => setJob({ ...job, title: e.target.value })} placeholder="Məsələn: Junior Frontend Developer" required /></label><label>Təsvir və tələblər<textarea value={job.description} onChange={(e) => setJob({ ...job, description: e.target.value })} rows={6} required /></label><div className="company-job-row"><label>Məkan<input value={job.location} onChange={(e) => setJob({ ...job, location: e.target.value })} placeholder="Bakı / Uzaqdan" /></label><label>İş növü<select value={job.employmentType} onChange={(e) => setJob({ ...job, employmentType: e.target.value })}><option value="FULL_TIME">Tam iş günü</option><option value="PART_TIME">Yarım iş günü</option><option value="REMOTE">Uzaqdan</option><option value="INTERNSHIP">Təcrübə</option><option value="FREELANCE">Frilans</option></select></label></div><button className="button button-primary">Vakansiyanı yerləşdir</button></form>
      </div>
    </>}
  </div></section>;
}

export default CompanyDashboardPage;
