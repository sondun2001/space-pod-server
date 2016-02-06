var BehaviorTree = require('btree');

// TODO: Also use a state machine to switch between various states while running

var mytask = new BehaviorTree.Task({
  // (optional) this function is called directly before the run method
  // is called. It allows you to setup things before starting to run
  // Beware: if task is resumed after calling this.running(), start is not called.
  start: function(obj) { obj.isStarted = true; },

  // (optional) this function is called directly after the run method
  // is completed with either this.success() or this.fail(). It allows you to clean up
  // things, after you run the task.
  end: function(obj) { obj.isStarted = false; },

  // This is the meat of your task. The run method does everything you want it to do.
  // Finish it with one of these method calls:
  // this.success() - The task did run successfully
  // this.fail()    - The task did fail
  // this.running() - The task is still running and will be called directly from parent node
  run: function(obj) {
    this.success();
  }
});

// TODO: Export this task to be used with other sequences, etc