import * as React from "react";
import { useState } from "react";

import LanguageSelector from "./language_selector";

interface TranslationModalProps {
  id: number;
  onClose: () => void;
  onSuccess: (languageCode: string, subtitleId: string) => void;
}

const TranslationModal: React.FC<TranslationModalProps> = (props) => {
  const { id, onSuccess, onClose } = props;
  const [ targetLanguage, setTargetLanguage ] = useState<string>("en");

  const onDone = async () => {
    if (targetLanguage == "") {
      return;
    }

    try {
      const res = await fetch(`/translate/${id}/${targetLanguage}`, { method: "POST" });
      const data = await res.json();

      onSuccess(targetLanguage, data.subtitleId);
      onClose();
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="modal is-active">
      <div className="modal-background" onClick={onClose} />
      <div className="modal-content">
        <div className="box">
          <div className="field">
            <label className="label">Language</label>
            <div className="control">
              <LanguageSelector
                value={targetLanguage}
                onChange={(e) => setTargetLanguage(e.target.value)}
              />
            </div>
          </div>

          <div className="field is-grouped">
            <div className="control">
              <button className="button is-link" onClick={onDone}>Translate</button>
            </div>
            <div className="control">
              <button className="button is-link is-light" onClick={onClose}>Cancel</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TranslationModal;
