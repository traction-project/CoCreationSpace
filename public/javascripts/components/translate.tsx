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
            <option value="af">Afrikaans</option>
            <option value="sq">Albanian</option>
            <option value="am">Amharic</option>
            <option value="ar">Arabic</option>
            <option value="az">Azerbaijani</option>
            <option value="bn">Bengali</option>
            <option value="bs">Bosnian</option>
            <option value="bg">Bulgarian</option>
            <option value="zh">Chinese (Simplified)</option>
            <option value="zh-TW">Chinese (Traditional)</option>
            <option value="hr">Croatian</option>
            <option value="cs">Czech</option>
            <option value="da">Danish</option>
            <option value="fa-AF">Dari</option>
            <option value="nl">Dutch</option>
            <option value="en">English</option>
            <option value="et">Estonian</option>
            <option value="fi">Finnish</option>
            <option value="fr">French</option>
            <option value="fr-CA">French (Canada)</option>
            <option value="ka">Georgian</option>
            <option value="de">German</option>
            <option value="el">Greek</option>
            <option value="ha">Hausa</option>
            <option value="he">Hebrew</option>
            <option value="hi">Hindi</option>
            <option value="hu">Hungarian</option>
            <option value="id">Indonesian</option>
            <option value="it">Italian</option>
            <option value="ja">Japanese</option>
            <option value="ko">Korean</option>
            <option value="lv">Latvian</option>
            <option value="ms">Malay</option>
            <option value="no">Norwegian</option>
            <option value="fa">Persian</option>
            <option value="ps">Pashto</option>
            <option value="pl">Polish</option>
            <option value="pt">Portuguese</option>
            <option value="ro">Romanian</option>
            <option value="ru">Russian</option>
            <option value="sr">Serbian</option>
            <option value="sk">Slovak</option>
            <option value="sl">Slovenian</option>
            <option value="so">Somali</option>
            <option value="es">Spanish</option>
            <option value="es-MX">Spanish (Mexico)</option>
            <option value="sw">Swahili</option>
            <option value="sv">Swedish</option>
            <option value="tl">Tagalog</option>
            <option value="ta">Tamil</option>
            <option value="th">Thai</option>
            <option value="tr">Turkish</option>
            <option value="uk">Ukrainian</option>
            <option value="ur">Urdu</option>
            <option value="vi">Vietnamese</option>
          </select>
        </div>
        <br/>
        <br/>
        <button className="button is-info" onClick={translateTranscript}>
          Translate
        </button>

        <br/>
        <br/>

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
