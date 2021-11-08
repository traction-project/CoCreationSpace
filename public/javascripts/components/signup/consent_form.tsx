import * as React from "react";
import { useTranslation } from "react-i18next";
import { useForm } from "react-hook-form";

interface ConsentFormProps {
  onComplete?: () => void;
}

const ConsentForm: React.FC<ConsentFormProps> = (props) => {
  const { onComplete } = props;
  const { t } = useTranslation();
  const { handleSubmit, register } = useForm({});

  const onSubmitConsent = handleSubmit(async ({ group, role, consent, imageConsent, gender, age, disability, profession, postcode }) => {
    await fetch("/users/consent", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        group, role, consent, imageConsent, gender, age, disability, profession, postcode
      })
    });

    onComplete?.();
  });

  return (
    <form onSubmit={onSubmitConsent}>
      <div className="field">
        <label htmlFor="" className="label">{t("What group are you participanting with?")}</label>
        <div className="select">
          <select {...register("group")}>
            <option>Cor Drassanes</option>
            <option>Cor Les Flors de Maig</option>
            <option>Grup Mon Raval</option>
            <option>TrencaCors</option>
            <option>Cor Turull</option>
            <option>Grup coral de Universitat de Barcelona</option>
            <option>Cor de Dones de Xamfrà</option>
            <option>Kudyapi Choir</option>
            <option>Musicals&apos; Choir</option>
            <option>Dona Gospel</option>
            <option>Korraval Evolution</option>
            <option>{t("Costume Designers (led by Montse Amenós)")}</option>
            <option>IMMANUEL Choir</option>
            <option>{t("Music Director")}</option>
          </select>
        </div>
      </div>

      <div className="field">
        <label htmlFor="" className="label">{t("Are you a")}</label>
        <div className="select">
          <select {...register("role")}>
            <option value="participant">{t("Participant")}</option>
            <option value="director">{t("Director")}</option>
          </select>
        </div>
      </div>

      <hr/>

      <img src={"/images/" + t("consent_form")} />

      <div className="field">
        <label htmlFor="" className="label">{t("I have read and understood the information given for this research, or have had the information read to me. I have had the opportunity to ask questions about the research. I consent to participate in the research sessions")}</label>
        <div className="select">
          <select {...register("consent")}>
            <option value="yes">{t("Yes")}</option>
            <option value="no">{t("No")}</option>
          </select>
        </div>
      </div>

      <hr/>

      <img src={"/images/" + t("image_consent_form")} />

      <div className="field">
        <label htmlFor="" className="label">{t("I consent to photo, video, and sound recording")}</label>
        <div className="select">
          <select {...register("imageConsent")}>
            <option value="yes">{t("Yes")}</option>
            <option value="no">{t("No")}</option>
          </select>
        </div>
      </div>

      <hr/>

      <div className="field">
        <label htmlFor="" className="label">{t("Gender")}</label>
        <div className="select">
          <select {...register("gender")}>
            <option value="female">{t("Female")}</option>
            <option value="male">{t("Male")}</option>
            <option value="other">{t("Other")}</option>
            <option value="prefer not to say">{t("Prefer not to say")}</option>
          </select>
        </div>
      </div>

      <div className="field">
        <label htmlFor="" className="label">{t("Postcode")}</label>
        <div className="control">
          <input
            type="text"
            placeholder={t("Postcode")}
            className="input"
            {...register("postcode")}
          />
        </div>
      </div>

      <div className="field">
        <label htmlFor="" className="label">{t("Age")}</label>
        <div className="control">
          <input
            type="text"
            placeholder={t("Age")}
            className="input"
            {...register("age")}
          />
        </div>
      </div>

      <div className="field">
        <label htmlFor="" className="label">{t("Are you a person with a disability?")}</label>
        <div className="select">
          <select {...register("disability")}>
            <option value="yes">{t("Yes")}</option>
            <option value="no">{t("No")}</option>
            <option value="prefer not to say">{t("Prefer not to say")}</option>
          </select>
        </div>
      </div>

      <div className="field">
        <label htmlFor="" className="label">{t("What is your profession?")}</label>
        <div className="control">
          <input
            type="text"
            placeholder={t("Profession")}
            className="input"
            {...register("profession")}
          />
        </div>
      </div>

      <div className="field pt-4">
        <button type="submit" className="button is-info">
          {t("Submit")}
        </button>
      </div>
    </form>
  );
};

export default ConsentForm;
