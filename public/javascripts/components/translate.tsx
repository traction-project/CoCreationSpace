import * as React from "react";
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import LanguageSelector from "./language_selector";

interface Cue {
  cueStart: number;
  cueEnd: number;
  cue: string;
}

function convertTimestamp(timestamp: number): string {
  const minutes = Math.floor(timestamp / 60);
  const seconds = Math.floor(timestamp) - minutes * 60;
  const milliseconds = Math.floor((timestamp - Math.floor(timestamp)) * 100);

  return `${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}.${milliseconds.toString().padEnd(3, "0")}`;
}

interface TranslateProps {
}

const Translate: React.FC<TranslateProps> = () => {
  const { id } = useParams();

  const [ transcript, setTranscript ] = useState<Array<Cue>>([]);
  const [ translatedTranscript, setTranslatedTranscript ] = useState<Array<Cue>>([]);
  const [ targetLanguage, setTargetLanguage ] = useState("en");
  const [ displayNotification, setDisplayNotification] = useState<"success" | "error">();

  useEffect(() => {
    fetch(`/translate/${id}/transcript`).then((res) => {
      if (res.ok) {
        return res.json();
      }
    }).then((data) => {
      setTranslatedTranscript(data.map((c: Cue) => {
        return { ...c, cue: "" };
      }));
      setTranscript(data);
    });
  }, []);

  const updateTranslatedTranscript = (i: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const transcript = translatedTranscript.slice();
    transcript[i].cue = e.target.value;

    setTranslatedTranscript(transcript);
  };

  const translateTranscript = async () => {
    try {
      await fetch(`/translate/${id}/${targetLanguage}`, { method: "POST" });
      setDisplayNotification("success");
    } catch {
      setDisplayNotification("error");
    } finally {
      setTimeout(() => setDisplayNotification(undefined), 3000);
    }
  };

  const closeNotification = () => {
    setDisplayNotification(undefined);
  };

  return (
    <div className="columns" style={{ marginTop: 15 }}>
      <div className="column is-8 is-offset-2">
        <h1 className="title">Translate {id}</h1>
        <LanguageSelector
          value={targetLanguage}
          onChange={(e) => setTargetLanguage(e.target.value)}
        />
        <br/>
        <br/>
        <button className="button is-info" onClick={translateTranscript}>
          Translate
        </button>

        <br/>
        <br/>

        <h4 className="title is-4">Transcript</h4>

        {transcript.map(({ cueStart, cueEnd, cue }, i) => {
          return (
            <div key={i}>
              <strong>{convertTimestamp(cueStart)} -&gt; {convertTimestamp(cueEnd)}</strong>
              <br/>
              <p>{cue}</p>
              <input
                type="text"
                className="input"
                value={translatedTranscript[i].cue}
                onChange={updateTranslatedTranscript.bind(null, i)}
              />
              <br/>
              <br/>
            </div>
          );
        })}

        {(displayNotification == "success") ? (
          <div className="notification is-success fixed-notification">
            <button className="delete" onClick={closeNotification}></button>
            Text successfully translated
          </div>
        ) : (displayNotification == "error") ? (
          <div className="notification is-error fixed-notification">
            <button className="delete" onClick={closeNotification}></button>
            Could not translate text
          </div>
        ) : null}
      </div>
    </div>
  );
};

export default Translate;
