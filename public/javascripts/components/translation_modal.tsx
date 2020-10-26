import * as React from "react";
import { useState } from "react";

import LanguageSelector from "./language_selector";

interface TranslationModalProps {
  id: number;
  onClose: () => {};
}

const TranslationModal: React.FC<TranslationModalProps> = (props) => {
  const { id, onClose } = props;
  const [ targetLanguage, setTargetLanguage ] = useState<string>("");

  const onDone = async () => {
    if (targetLanguage == "") {
      return;
    }

    try {
      await fetch(`/translate/${id}/${targetLanguage}`, { method: "POST" });
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
