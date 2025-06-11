import defineMonitextRuntime from "../src/index";
const { mtxt, monitext } = defineMonitextRuntime({
    "env": "node",
    "apiKey": "<YOUR_API_KEY>",
    "project_name": "<YOUR_PROJECT_NAME>",
    "devMode": true,
    "format": "dev",
    "silent": []
});

mtxt.info("Monitext initialized in compact mode");
monitext.info("Monitext initialized in verbose mode");