import  defineMonitextRuntime  from "../src";

const { mtxt, monitext } = defineMonitextRuntime();

(async function () {
    mtxt
        .info("Houston We have a problem", { service: "test" }, { silent: true })
        .send()

    monitext
        .info("new user detected")
        .withMeta({ service: await new Promise((r)=> setTimeout(()=> r("testing"), 4000)) })
        .config({ "class": "USER AUTH" })
        .send()
})()
