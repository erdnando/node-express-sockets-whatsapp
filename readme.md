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

-----------------------------------------------------------------
To merge the main branch with the qa branch in your project, follow these steps:

1.Open the terminal in Visual Studio Code.
2.Ensure you are on the qa branch:
    git checkout main
3.Pull the latest changes from the qa branch:
    git pull origin main
4.Merge the main branch into the qa branch:
    git merge qa
5.Resolve any merge conflicts if they arise.
6.Commit the merge if necessary:
    git commit -m "Merge qa into main"
7.Push the updated qa branch to the remote repository:
    git push origin main

This will merge the main branch into the qa branch.