/**
        * This file is meant for and only for developping mtxt
        * by it's nature, it require a config file to run properly.
        * 
        * when developing, by using `--use/dev` flag on can use this file instead of creating a new confid file at root 
        */
const config = {
  "project_name": "",
  "env": "node",
  "handleException": true,
  "handleRejection": true,
  "include": [
    "src/*"
  ],
  "devMode": true,
  "apiKey": "<YOUR_API_KEY>"
};

export default config;
