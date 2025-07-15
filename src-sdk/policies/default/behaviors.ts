import { MoniTextPolicy } from "../../core/policy";
import { Formatter } from "./printer";
import { themeManager } from "./theme";
import { createFormating } from "./format";

export const logHandling = new MoniTextPolicy({
    "name": "log-on-console-policy",
    "phase": "core",
    "handle": function (log, config, next) {
        Formatter.dev(
            log,
            themeManager,
            config.format as unknown as ReturnType<typeof createFormating>,
        );
        next();
    },
});

// export const logTransportation = new MoniTextPolicy({
//     "name": "log-transport-policy",
//     "phase": "post",
//     "handle": async function (log, config, next) {
//         // // const t = WebTransport
//         // let transport = true;
//         // const retry = 5;

//         // for (let i = 0; i < retry; i++) {
//         //     await const { ok } = new logTransportation({ file: "./test" });
//         // }

//         next()
//         // // Formatter.dev(log, themeManager, config.format as unknown as ReturnType<typeof createFormating>)
//     },
// });
