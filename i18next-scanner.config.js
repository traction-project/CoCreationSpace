const fs = require("fs");
const path = require("path");
const typescript = require("typescript");

module.exports = {
    input: [
        "public/**/*.{ts,tsx}",
    ],
    output: "./",
    options: {
        debug: true,
        func: {
            list: ["i18next.t", "i18n.t", "this.i18n.tr", "t"],
            extensions: [".ts"],
        },
        lngs: ["en", "de", "es"],
        ns: [
            "translation",
        ],
        defaultLng: "en",
        defaultNs: "translation",
        defaultValue: "__STRING_NOT_TRANSLATED__",
        resource: {
            loadPath: "public/locales/{{lng}}/{{ns}}.json",
            savePath: "public/locales/{{lng}}/{{ns}}.json",
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

    transform: function customTransform(file, enc, done) {
        const {ext} = path.parse(file.path);
        const content = fs.readFileSync(file.path, enc);

        if (ext === ".ts" || ext == ".tsx") {
            const {outputText} = typescript.transpileModule(content.toString(), {
                compilerOptions: {
                    target: "es2018",
                },
                fileName: path.basename(file.path),
            });

            this.parser.parseFuncFromString(outputText, {list: ["i18next.t", "i18next.tr", "this.i18n.tr", "t"]});
        } else if (ext === ".html") {
            this.parser
                .parseAttrFromString(content, {list: ["data-i18n", "data-t", "t", "i18n"] });

            // We extra behaviours `${ 'myKey' | t }` and `${ 'myKey' & t }` from the file.
            const extractBehaviours = /\${ *'([a-zA-Z0-9]+)' *[&|] *t *}/g;
            const strContent = content.toString();
            let group;
            while (true) {
                group = extractBehaviours.exec(strContent);
                if (group === null) {
                    break;
                }
                this.parser.set(group[1]);
            }
        }

        done();
    },
};
