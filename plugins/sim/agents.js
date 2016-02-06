// TODO: PUT and DEL
module.exports = function setup(options, imports, register) {
    var server = imports.server;
    var auth = imports.auth;
    
     // Controllers
    var agentController = require('./controllers/agent');
    
    // Agent router
    var router = server.Router();
    
    // Secure this router
    router.use(auth.isAuthenticated);
    
    router.route('/')
    // Post a new agent
    .post(agentController.postAgent)
    // Get all agents
    .get(agentController.getAllAgents);
    
    // Get agent by id
    router.route('/:agent_id')
    .get(agentController.getAgent);
    
    // Set agent state
    router.route('/state/:agent_id/')
    .post(agentController.setAgentState);
    
    // Register the router
    server.use('/agents', router);
    
    agentController.init(function(){
        register(null, {
        agents: {
            // TODO: We should create an async agent processor in C++
            // It wouldn't hold up node, and could perform more complex
            // calculations based off agent state, etc.
            update: function (delta) {
                agentController.process(delta);
            }
        }});
    });
} 