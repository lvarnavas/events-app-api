First step for a successfull installation after you download or fork the files of this specific repo:

Navigate to the root directory and run `npm install`. This will install the project's dependencies and node modules.  

`npm run dev` - Runs the app in the development mode.<br />

Before you run the app in development mode you should include a `nodemon.json` file in the root directory and specify the following:

{
    "env": {
        "DB_USER": "",
        "DB_PASSWORD": "",
        "DB_NAME": "",
        "DB_HOST": "",
        "GOOGLE_API_KEY": "",
        "JWT_KEY": "",
        "SENDGRID_KEY": "",
        "PORT": "5000"
    }
}

This will allow you to set the environmental variables for the app.
Notice: 
1. The Google Maps API key should be included in order to use the map inside the app.
2. The Sendgrid API key should be included in order to send emails via Nodejs.

Stop the server.

`npx sequelize db:seed:all` - Inserts the data in the database

### `npm run dev`
