##Setup

```
git clone https://github.com/sondun2001/space-pod-server.git
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

### How to run pi
```
export NODE_ENV="pi"
```