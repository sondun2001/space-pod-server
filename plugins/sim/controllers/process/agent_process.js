// Child process used to process agents and return back to the API server
// http://stackoverflow.com/questions/20004935/best-way-to-execute-parallel-processing-in-node-js
var agentProcessor = require('agent_processor');
process.on('message', function(message, delta) {
    //console.log('[child] received message from server:', message.length);
    
    var result = message;
    
    // Process the agents
    agentProcessor.process(result, delta);
    
    // Send back to parent process
    process.send({
        child   : process.pid,
        result  : result
    });
    
    // Do not disconnect
    //process.disconnect();
});