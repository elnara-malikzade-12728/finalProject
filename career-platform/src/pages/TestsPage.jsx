import { useEffect, useState } from "react";
import { ArrowRight, Clock3, ListChecks, ShieldCheck } from "lucide-react";
import { Link } from "react-router-dom";
import { getApiErrorMessage } from "../api/client.js";
import { getPublishedTests } from "../api/testsApi.js";
import ErrorState from "../components/common/ErrorState.jsx";
import PageLoader from "../components/common/PageLoader.jsx";

function TestsPage() {
  const [tests, setTests] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const controller = new AbortController();
    getPublishedTests({ signal: controller.signal })
      .then((data) => setTests(Array.isArray(data) ? data : []))
      .catch((requestError) => { if (requestError.name !== "AbortError") setError(getApiErrorMessage(requestError)); })
      .finally(() => { if (!controller.signal.aborted) setIsLoading(false); });
    return () => controller.abort();
  }, []);

  if (isLoading) return <PageLoader message="Testlər yüklənir..." fullPage />;
  return <section className="section tests-catalog-page"><div className="container">
    <header className="tests-catalog-header"><span className="eyebrow">Biliklərini yoxla</span><h1>Testlər</h1><p>Dərs testlərini tamamla, nəticəni dərhal gör və yekun imtahana hazırlaş.</p></header>
    {error ? <ErrorState title="Testlər yüklənmədi" message={error} /> : tests.length === 0 ? <div className="content-card tests-empty"><ListChecks size={38} /><h2>Hələ yayımlanmış test yoxdur</h2><p>Yeni test yayımlandıqda burada görünəcək.</p></div> :
      <div className="tests-catalog-grid">{tests.map((test) => <article className="test-catalog-card" key={test.id}>
        <div className="test-catalog-card-top"><span className="tag">{test.type === "FINAL" ? test.course?.title || "Yekun imtahan" : test.lesson?.title || "Dərs testi"}</span><span className="test-catalog-id">#{test.id}</span></div>
        <h2>{test.title}</h2><p>{test.course?.title || test.lesson?.title || "Synex Academy testi"}</p>
        <div className="test-catalog-meta"><span><ListChecks size={17} />{test._count?.questions || 0} sual</span><span><Clock3 size={17} />{test.timeLimitMinutes ? `${test.timeLimitMinutes} dəq.` : "Limitsiz"}</span><span><ShieldCheck size={17} />{test.passScorePercent}% keçid</span></div>
        <Link className="button button-primary" to={`/tests/${test.id}`}>Testə bax <ArrowRight size={18} /></Link>
      </article>)}</div>}
  </div></section>;
}
export default TestsPage;
