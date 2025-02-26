pamac install nodejs 

sudo npm install --global yarn

curl -o - https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.7/install.sh | bash
#close terminal & reopen
------------------------------------------------
nvm install v20.11.1

nvm use v20.11.1

yarn install #first time

yarn start
or
yarn dev -->daemon


En index.js cambiar la URL de la DB
----------------------------------------------------------------------------
const mongoDbUrl = `mongodb+srv://${DB_USER}:${DB_PASSWORD}@${DB_HOST}/`;

const mongoDbLocal = "mongodb://192.168.0.34:27017/chatapp";

mongoose.connect(mongoDbUrl, (error) => {