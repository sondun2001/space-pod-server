##Setup

###Install Global Node Modules
```
npm install pm2 -g
npm install grunt -g
npm install -g mocha
```

###First time setup.
```
npm install
```

###Switching platforms
If switching platforms, some modules will need to be rebuilt. You can do so by running the following:
```
npm rebuild
```

### How to run windows-debug
```
set NODE_ENV=windows-debug&&node app.js
```