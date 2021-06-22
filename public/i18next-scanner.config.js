const fs = require("fs");
const path = require("path");
const typescriptTransform = require("i18next-scanner-typescript");

module.exports = {
  input: [
    "./javascripts/**/*.{ts,tsx}",
  ],
  output: "./",
  options: {
    debug: true,
    func: {
      list: ["i18next.t", "i18n.t", "this.i18n.tr", "t"],
      extensions: [".ts"],
    },
    lngs: ["en", "de", "es", "pt", "ga", "ca"],
    ns: [
      "translation",
    ],
    defaultLng: "en",
    defaultNs: "translation",
    defaultValue: "__STRING_NOT_TRANSLATED__",
    resource: {
      loadPath: "locales/{{lng}}/{{ns}}.json",
      savePath: "locales/{{lng}}/{{ns}}.json",
      jsonIndent: 4,
      lineEnding: "\n"
    },
    nsSeparator: false, // namespace separator
    keySeparator: false, // key separator
    interpolation: {
      prefix: "{{",
      suffix: "}}"
    },
    removeUnusedKeys: true,
  },
  transform: typescriptTransform({
    extensions: [".ts", ".tsx"],
    tsOptions: {
      target: "es2017",
    },
  }),
};
