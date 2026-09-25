import { useEffect, useState } from "react";
import { Headphones, LoaderCircle, LockKeyhole } from "lucide-react";
import { getApiErrorMessage } from "../../api/client.js";
import { getTestAudioExplanation } from "../../api/testsApi.js";

function TestAudioExplanation({ testId, hasAudioExplanation, unlocked = false }) {
  const [audio, setAudio] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    setAudio(null);
    setError("");
  }, [testId]);

  async function loadAudio() {
    setIsLoading(true);
    setError("");
    try {
      setAudio(await getTestAudioExplanation(testId));
    } catch (requestError) {
      setError(getApiErrorMessage(requestError));
    } finally {
      setIsLoading(false);
    }
  }

  if (!hasAudioExplanation) return null;

  return (
    <section className="test-audio-explanation" aria-label="Səsli izah">
      <div className="test-audio-heading">
        <Headphones size={21} />
        <div>
          <h3>Səsli izah</h3>
          <p>Test cavabları və mövzu üzrə təlimçi şərhi.</p>
        </div>
      </div>
      {audio ? (
        <div className="test-audio-player">
          <strong>{audio.title}</strong>
          <audio controls preload="metadata" src={audio.url}>Brauzeriniz audio elementini dəstəkləmir.</audio>
        </div>
      ) : unlocked ? (
        <button className="button button-secondary" type="button" onClick={loadAudio} disabled={isLoading}>
          {isLoading ? <LoaderCircle className="loading-spinner" size={17} /> : <Headphones size={17} />}
          Səsli izahı aç
        </button>
      ) : (
        <p className="test-audio-locked"><LockKeyhole size={16} /> Səsli izah testi göndərdikdən sonra açılacaq.</p>
      )}
      {error && <p className="form-error" role="alert">{error}</p>}
    </section>
  );
}

export default TestAudioExplanation;
