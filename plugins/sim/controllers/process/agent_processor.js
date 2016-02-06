exports.process = function (agents, delta) {
    //console.log('process agents: ' + delta);
    
    /*
    var numAgents = agents.length;
    for (var i = 0; i < numAgents; ++i)
    {
        //  Process Agent
        var agent = agents[i];
        
        // TODO: Save after X time has lapsed'
        // if (lastAgentSave + saveInterval >= currentTime)
    }
    */
}

/*
// TODO: MOVE ALL STATES TO TASKS FOLDER
function State_Idle(agent, delta) {
    if (_.isNull(agent) || _.isUndefined(agent)) return;
    
    // Should take about 4 hours to get hungry
    agent.hunger += 0.0000926 * delta;
    //console.log('Agent ('+agent._id+') State_Idle');
}

// Should lower fatigue alot
function State_Sleeping(agent, delta) {
    if (_.isNull(agent) || _.isUndefined(agent)) return;
    // Should take about 8 hours to get hungry
    agent.hunger += 0.0000005 * delta;
    //console.log('Agent ('+agent._id+') State_Sleeping');
}

// Includes walking, any activity, etc
function State_Working(agent, delta) {
    if (_.isNull(agent) || _.isUndefined(agent)) return;
    // Should take about 3 hours to get hungry
    agent.hunger += 0.0000926 * delta;
    //console.log('Agent ('+agent._id+') State_Working');
}
*/
