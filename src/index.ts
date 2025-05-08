        import config from "/home/cat/.linksox/Projects/Project-Console.txt/src/mtxtconfig"
        import consoleDotTXT from "./mtxt";
        const mtxt = new consoleDotTXT();
        consoleDotTXT.init(config);
        export default mtxt;
        export const log = mtxt.log;
        export const info = mtxt.info;
        export const success = mtxt.success;
        export const error = mtxt.error;
        export const fatal = mtxt.fatal;
        export const assert = mtxt.assert;