var mongoose = require('mongoose');
var ObjectId = mongoose.Types.ObjectId;
var _ = require('underscore');
var agentProcessor = require('./process/agent_processor');
var settings = require('nconf');
var async = require('async');
var useChildProcess = settings.get('useChildProcess');
// Only used when using child processes
var child_process = require('child_process');
var numchild  = 0; //require('os').cpus().length;
var done      = 0;

// Models
var Agent = require('../models/agent');

// Controllers
var walletController = require ('../../bitcoin/controllers/wallet');

exports.postAgent = function(req, res) {
    var agent = new Agent();
    agent._userId = new ObjectId(req.user._id);
    agent.name = req.body.name;
    agent.save(function(err) {
        //console.log("Agent created: " + agent._id);
        
        if (err) {
            console.error(err);
            res.status(500).json({ error: err });
            return;
        }
        
        async.parallel([
            function(callback){
                walletController.createWallet(agent, function(err, wallet) {
                    if (err) {
                        console.error(err);
                    } else {
                        //console.log("Wallet created: " + wallet._id);
                        callback(null, wallet);
                    }
                });
            } // Add other functions here, such as inventory
        ], // optional callback
        function(err, results){
             InitAgent(agent);
        
            // TODO: Create and save inventory for agent, then respond
            // TODO: Add any default items (should not be of value, since multiple agents may be created)
            
            var response = {};
            response.agent = agent;
            response.wallet = results[0];
            res.status(201).json(response);
        });
    });
}

exports.getAllAgents = function(req, res) {
    Agent.find({}, function(err, docs) {
        res.status(200).json(docs);
    });
}

exports.getAgent = function (req, res) {
    GetAgentById(req.params.agent_id, function(agent) {
        if(agent != null) {
            res.status(200).json(agent);
        } else {
            res.status(500).json({ error: 'Could not find agent.' });
        }
    });
}

exports.setAgentState = function (req, res) {
    GetAgentById(req.params.agent_id, function (agent) {
        if(agent != null) {
            // TODO: Use promises for cleaner code
            SetAgentState(agent, req.body.agent_state, function(err, succ) {
                if (err) {
                    res.status(500).json({ error: err });
                } else if(succ) {
                    res.status(204).json(succ);
                }
            });
        } else {
            res.status(500).json({ error: 'Could not find agent.' });
        }
    });
}

exports.init = function(callback) {
    // Get all existing agents, then start
    Agent.find({}, function(err, docs) {
        var resultLength = docs.length;
        for (var i = 0; i < resultLength; ++i) {
            var agent = docs[i];
            InitAgent(agent);
        }
        
        if (useChildProcess) {
            
            // TODO: Determine how many processes to create
            numchild = 1;
            
            // TODO: Do not use child process for debugging
            for (var i = 0; i < numchild; i++){
                var child = child_process.fork(__dirname + '/process/agent_process');
                childProcess[i] = child;
                child.on('message', function(message) {
                    //console.log('[parent] received message from child:', message);
                    done++;
                    if (done === numchild) {
                        console.log('[parent] received all results');
                        done = 0;
                    }
                });
            }
        }
            
        // Register the plugin
        console.log('Agents service ready.');
        
        if (callback)
            callback();
    });
}

exports.process = function (delta) {
    if (useChildProcess) {
        // Make sure we have received back all the data for agents before processing again
        if (done == 0)  {
            // TODO: Determine if we have the appropiate ammount of proccesses
            // TODO: Distribute agents for each processes
            // TODO: Don't use child process while debugging
            for (var i = 0; i < numchild; i++){
                childProcess[i].send(agents);
            }
        }
    } else {
        agentProcessor.process(agents, delta); // Should use same logic as child process would use
    }
}

// Initialize and register the service
var agents = [];
var agentsById = {};
var childProcess = [];

// Gets an agent by ID. Checking memory first, then DB
function GetAgentById(agentId, callback) {
    // TODO: Check local map, if not, grab from DB
    if (agentsById != null && agentsById[agentId] != null) {
        callback(agentsById[agentId]);
    } else {
        var o_id = new ObjectId(agentId);
        Agent.find({"_id": o_id}, function(err, docs) {
            var agent = docs[0];
            InitAgent(agent);
            callback(agent);
        });
    }
}


// Called once we have an agent model
function InitAgent(agent) {
    SetAgentState(agent, agent.state);
    
    // TODO: Check if agent already in array
    agents.push(agent);
    agentsById[agent._id] = agent;
}

// Sets the current agent state and the process function which will process the agent
// callback(error, success)
function SetAgentState(agent, state, callback) {
    agent.state = state;
    /*
    var stateFunction;
    try {
        stateFunction = eval(state);
    } catch (error) {
        console.log('SetAgentState::Could not find state function');
        if (callback)
           return callback('Could not find agent state ('+state+').', null);
    }
    
    agent.process = _.partial(stateFunction, agent);
    */
    if (callback)
        callback(null, {message:'New state has been set.', agent:agent});
}