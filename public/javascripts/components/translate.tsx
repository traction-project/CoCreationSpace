import * as React from "react";
import { useState } from "react";
import { useParams } from "react-router-dom";

interface TranslateProps {
}

const Translate: React.FC<TranslateProps> = () => {
  const { id } = useParams();

  const [ targetLanguage, setTargetLanguage ] = useState("en");
  const [ displayNotification, setDisplayNotification] = useState<"success" | "error">();

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
        <div className="select">
          <select onChange={(e) => setTargetLanguage(e.target.value)}>
            <option value="en">English</option>
            <option value="ar">Arabic</option>
            <option value="cs">Czech</option>
            <option value="de">German</option>
            <option value="es">Spanish</option>
            <option value="fr">French</option>
            <option value="it">Italian</option>
            <option value="ja">Japanese</option>
            <option value="pt">Portuguese</option>
            <option value="ru">Russian</option>
            <option value="tr">Turkish</option>
            <option value="zh">Chinese</option>
          </select>
        </div>
        <br/>
        <br/>
        <button className="button is-info" onClick={translateTranscript}>
          Translate
        </button>

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
