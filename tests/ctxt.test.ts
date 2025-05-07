import  ctxt from "../src/index"

ctxt.log({ send : "new transaction" })

ctxt.info({ send : "A User user sign in" })

ctxt.success({ send : "A user loggued in" })

ctxt.warn({ send : "Something is fishy" })

ctxt.error({ send : "Ok we have an error out here" })

ctxt.fatal({ send : "The app might be down" })

for(let i = 0; i < 60; i++){
    ctxt.fatal({ send: `Houston we have a really big problem, i = ${i}`, threshold: 20 })
}

let x;

ctxt.assert(x == undefined, { "level": "warn", send: "why is x undefiened ?" })

try {
    throw new Error("something went wrong")
} catch (e) {
    const { stack, message } = (e as Error)
    ctxt.error({ send: message, trace: stack })
}
