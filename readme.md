# AKL 2020 Web Backend

Simple Node.js backend for Akateeminen Kynäriliiga. Created and currently maintained by Akseli Kolari, TG: akzu404.

## How to run in local env?
First, you must make sure that you are running MongoDB server. Then, create file a called **local.js** to *./config/* . Copy and paste config-example.js contents to local.js and fill in the necessary parts.

After that, open terminal (in the AKL-2020-Backend folder) and type in the following
```
npm i   // Install all the necessary components
npm run service   // Run the service
```

## Documentation
You can find swagger from the url */documentation/*. F.e if running in local env and port 3000, *localhost:3000/documentation*