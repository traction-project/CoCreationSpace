import * as React from "react";
import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";

interface NoteCollection {
  id: string;
  name: string;
}

interface AddToCollectionModalProps {
  id: string;
  onClose: () => void;
  onItemAdded?: (collectionId: string, mediaItemId: string) => void;
}

const AddToCollectionModal: React.FC<AddToCollectionModalProps> = (props) => {
  const { id, onClose, onItemAdded } = props;
  const { handleSubmit, register, reset, watch } = useForm();
  const { t } = useTranslation();

  const [ collections, setCollections ] = useState<Array<NoteCollection>>([]);

  useEffect(() => {
    fetch("/notes/collections").then((res) => {
      return res.json();
    }).then((data) => {
      setCollections(data);
      reset({ "collection": "" });
    });
  }, []);

  const onConfirm = handleSubmit(async ({ collection, name }) => {
    console.log({ collection, name });

    // If value is empty string, we create a new collection
    if (collection == "") {
      const res = await fetch("/notes/collection", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name
        })
      });

      if (!res.ok) {
        console.error("Could not create collection");
        return;
      }

      const { id } = await res.json();
      console.log("Created new collection with id:", id);
      collection = id;
    }

    const res = await fetch(`/notes/add/${collection}/${id}`, {
      method: "POST"
    });

    if (!res.ok) {
      console.error("Could add item to collection");
      return;
    }

    onItemAdded?.(collection, id);
    onClose();
  });

  return (
    <div className="modal is-active">
      <div className="modal-background" onClick={onClose} />
      <div className="modal-content">
        <div className="box">
          <h4 className="title is-4">{t("Add to Note Collection")}</h4>
          <hr/>

          <div className="field">
            <div className="control">
              <div className="select">
                <select {...register("collection")} defaultValue="">
                  <optgroup label={t("New")}>
                    <option style={{ fontStyle: "italic" }} value="">
                      {t("Create new collection")}
                    </option>
                  </optgroup>
                  <optgroup label={t("Existing")}>
                    {collections.map((c) => {
                      return (
                        <option key={c.id} value={c.id}>{c.name}</option>
                      );
                    })}
                  </optgroup>
                </select>
              </div>
            </div>
          </div>

          {(watch("collection") == "") && (
            <div className="field">
              <label className="label">{t("Name")}</label>
              <div className="control">
                <input className="input" type="text" {...register("name", { required: true })} />
              </div>
            </div>
          )}

          <hr/>

          <div className="field is-grouped pt-4">
            <div className="control">
              <button className="button is-link" onClick={onConfirm}>{t("Add")}</button>
            </div>
            <div className="control">
              <button className="button is-link is-light" onClick={onClose}>{t("Cancel")}</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddToCollectionModal;
