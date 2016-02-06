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

### How to run test
```
mocha
```

###Authorization
Once a token has been received, pass the token along in the header using 'Authorization' key with value 'JWT x-access-token' where x-access-token is the actual token.

###TODO
NGINX Load Balancer - In charge of scaling up API Servers
API Socket server will be part of the API app, and send events to connected clients. Can scale.
    This is what clients will connect to for up to date information and events.
    Will subscribe to economy and game servers, and route events back to clients.
    Will issue commands on economy and game servers.
    MongoDB
    Settle buy/sell orders.
    Manage banking (interest rates, promisary notes, etc)
    Secure transactions?

Game server. C# / Unity.
    Spatial awareness
    Agent States
    AI Pathfinding
    1 server per economy.

####More Information
https://github.com/c9/architect