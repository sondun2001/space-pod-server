var should = require('should'); 
var assert = require('assert');
var request = require('supertest');  
var mongoose = require('mongoose');
var path = require('path');
var config = require('nconf');
var async = require('async');
var _ = require('underscore');

// Load configs
var configPath = path.join(__dirname, 'config.json');
config.file(configPath);
console.log("Mongo URI: " + config.get('mongo_uri'));
    
// Test should provide for most of economic activiy situations, and return all money back to original wallet at the end.

// TODO: Create Test Agent Eve (create BTC wallet address && private key)
// TODO: Create Test Agent Adam (create BTC wallet address && private key)
// TODO: Add coins to agent Eve's wallet (Emulate 1 BTC Deposit)
// TODO: Add coins to agent Adam's wallet (Emulate 10 BTC Deposit)
// TODO: Have agent Adam Establish a bank thats part of the reserve system (Insurance)
// TODO: Have bank issue all (100) shares to Adam @ .8 a share. // Non market (private) sale.
// TODO: Deposit coins to bank's vault/wallet (Emulate BTC Deposit)
// TODO: Have agent Eve attempt to open a bank account with created bank (should fail, no employees)
// TODO: Have agent Adam become an employee of bank (owner's can be employees)
// TODO: Have agent Adam report to work
// TODO: Have Agent Eve open a bank account with created bank
// TODO: Have Agent Eve deposit some coins (from inventory) into account
// TODO: Create Test Agent Snake
// TODO: Have agent Snake open up a bank account
// TODO: Have agent Snake take out a loan from bank (must not exceed reserve requirement)
// TODO: Have agent Snake start an apple business (Prime Apples)
// TODO: Verify business creation (properties, etc)
// TODO: Issue all shares (100) to agent Snake
// TODO: Create stock market
// TODO: Register Prime Apples with stock market
// TODO: Have agent Snake sell (50) shares on market at .1 coins a share.
// TODO: Have agent Adam place a buy order for 50 shares at .08 coins a share.
// TODO: This should fail if he doesn't have enough coins (specified account on order)
// TODO: Have Prime Apples cancel sell order, and put new sell order at .08 coins a share.
// TODO: Wait for order to be settled.
// TODO: Transfer coins to specified account on sell order.
// TODO: Have agent Snake collect apples (Private - Unity Server)
// TODO: Have agent Snake offer an apple to agent Eve for .001 coins (direct)
// TODO: Have agent Eve buy for set price (immediate settle)
// TODO: Have agent Snake deliver apple to agent Eve (buy order location)
// TODO: Wait for delivery completion
// TODO: Report delivery complete (Private - Unity Server)
// TODO: Verify Eve's account balance
// TODO: Verify Prime Apple's account balance
// TODO: Get agent Eve's inventory (should be an apple and some coins)
// TODO: Have agent Eve eat the apple
// TODO: Create Test Agent Cain
// TODO: Create Test Agent Abel
// TODO: Agent Cain and Agent Abel apply for employment at Prime Apple
// TODO: Cain gathers, abel delivers, snake stays at firm
// TODO: Employees paid per job
// TODO: Have agent Snake make loan payment
// TODO: Have all agents deposit coins at central bank
// TODO: Remove agents (should cancel all market orders, bank accounts, etc)
// TODO: Have bank transfer all coins to central bank
// TODO: Dissolve bank (should return all deposits to any active accounts)

// THESE SHOULD NEVER RUN ON A PRODUCTION SERVER!
describe('Routing', function() {
  var url = 'http://localhost:3000';
  var db = mongoose.connection;
  
  before(function(done) {
    db.once('open', function() {
        done();
    });
    
    mongoose.connect(config.get('mongo_uri'), { socketOptions: { keepAlive: 1 } });
  });
  
  ////////////////////////////////// USER /////////////////////////////////////////
  var User = require('../plugins/auth/models/user');
  var username = 'test';
  var password = 'password';
  var email = 'test@mail.com';
  var accessToken = 'notavalidtoken';
  
  describe('Users', function() {
    before(function(done) {
        User.find({ name:username }).remove( function(err,removed) {
            if (err) console.log('Error removing test user: ' + err);
            if (removed > 0) console.log('Test user removed.');
            done();
        });
    });
    
    // Create User
    it('should create test user successfully', function(done) {
        var req = {
            username: username,
            password: password,
            email: email
        };
        request(url)
        .post('/user')
        .send(req)
        .end(function(err, res) {
            if (err) throw err;
            res.body.should.have.property('success');
            res.body.should.have.property('message');
            res.body.success.should.equal(true);
            if (!err) done();
        });
    });
    
    // Login user
    it('should fail with the wrong password', function(done) {
    var req = {
        username: username,
        password: 'wrongpassword'
    };
    request(url)
	.post('/auth')
	.send(req)
    .expect('Content-Type', /json/)
	.expect(401) //Status code
	.end(function(err, res) {
          if (err) throw err;
          
          res.body.should.have.property('success');
          res.body.should.have.property('message');
          res.body.success.should.equal(false);
          if (!err) done();
        });
    });
    
    // Login user
    it('should login test user successfully', function(done) {
    var req = {
        username: username,
        password: password
    };
    request(url)
	.post('/auth')
	.send(req)
    .expect(200) //Status code
	.end(function(err, res) {
          if (err) throw err;
          res.body.should.have.property('success');
          res.body.should.have.property('token');
          res.body.success.should.equal(true);
          accessToken = 'JWT ' + res.body.token;
          if (!err) done();
        });
    });
  });
  
  ////////////////////////////////// AGENT ////////////////////////////////////////
  
  var Agent = require('../plugins/agents/models/agent');
  var Wallet = require('../plugins/bitcoin/models/wallet');
  
  // For testing, it should be ok to store private keys of agents
  var eve;
  var adam;
  function removeAgent(name, callback) {
    Agent.findOneAndRemove({name:name}, function (err,doc) {
        if(err) { throw err; }
        if (doc !== null) {
            Wallet.find({ _entityId:doc._id }).remove().exec();
        }
        callback(null);
    });
  }
  
  describe('Agents', function() {
    before(function(done) {
        async.parallel([
            _.partial(removeAgent, 'Adam'),
            _.partial(removeAgent, 'Eve')
        ], done);
    });
    
    it('should create agent successfully', function(done) {
        var req = {
            name: 'Eve'
        };
        request(url)
        .post('/agents')
        .set('Authorization', accessToken)
        .send(req)
        .expect('Content-Type', /json/)
		.expect(201) //Status code
        .end(function(err, res) {
            //if (err) throw err;
            if (err) console.error(err);
            
            res.body.should.have.property('agent');
            res.body.should.have.property('wallet');
            
            var agent = res.body.agent;
            agent.should.have.property('_id');
            agent.name.should.equal('Eve');
            eve = agent;
            done();
        });
    });
    
    // Go ahead and create other agents also
    after(function(done) {
        // Create some additional users
        var req = {
            name: 'Adam'
        };
        request(url)
        .post('/agents')
        .set('Authorization', accessToken)
        .send(req)
        .expect('Content-Type', /json/)
		.expect(201) //Status code
        .end(function(err, res) {
            if (err) throw err;
            adam = res.body.agent;
            done();
        });
    });
  });
  
  // Banking
  function removeBank(name, callback) {
    Bank.findOneAndRemove({name:name}, function (err,doc) {
        if(err) { throw err; }
        if (doc !== null) {
            Wallet.find({ _entityId:doc._id }).remove().exec();
        }
        callback(null);
    });
  }
  
  var Bank = require('../plugins/banking/models/bank');
  describe('Banking', function() {
    before(function(done) {
      async.parallel([
            _.partial(removeBank, 'Bank Of Adam')
        ], done);
    });
    
    it('should create bank successfully', function(done) {
        var req = {
            name: 'Bank Of Adam',
            founderId: adam._id,
            founderType: 'Agent'
        };
        request(url)
        .post('/banking')
        .set('Authorization', accessToken)
        .send(req)
        .expect('Content-Type', /json/)
		.expect(201) //Status code
        .end(function(err, res) {
            if (err) throw err;
            
            res.body.should.have.property('bank');
            res.body.should.have.property('wallet');
            
            var bank = res.body.bank;
            bank.should.have.property('_id');
            bank.name.should.equal('Bank Of Adam');
            done();
        });
    });
  });
});

/*
describe('Array', function() {
  describe('#indexOf()', function () {
    it('should return -1 when the value is not present', function () {
      assert.equal(-1, [1,2,3].indexOf(5));
      assert.equal(-1, [1,2,3].indexOf(0));
    });
  });
});
*/

/*
describe('Routing', function() {
  var url = 'http://someurl.com';
  // within before() you can run all the operations that are needed to setup your tests. In this case
  // I want to create a connection with the database, and when I'm done, I call done().
  before(function(done) {
    // In our tests we use the test db
    mongoose.connect(config.db.mongodb);							
    done();
  });
  // use describe to give a title to your test suite, in this case the tile is "Account"
  // and then specify a function in which we are going to declare all the tests
  // we want to run. Each test starts with the function it() and as a first argument 
  // we have to provide a meaningful title for it, whereas as the second argument we
  // specify a function that takes a single parameter, "done", that we will use 
  // to specify when our test is completed, and that's what makes easy
  // to perform async test!
  describe('Account', function() {
    it('should return error trying to save duplicate username', function(done) {
      var profile = {
        username: 'vgheri',
        password: 'test',
        firstName: 'Valerio',
        lastName: 'Gheri'
      };
    // once we have specified the info we want to send to the server via POST verb,
    // we need to actually perform the action on the resource, in this case we want to 
    // POST on /api/profiles and we want to send some info
    // We do this using the request object, requiring supertest!
    request(url)
	.post('/api/profiles')
	.send(profile)
    // end handles the response
	.end(function(err, res) {
          if (err) {
            throw err;
          }
          // this is should.js syntax, very clear
          res.should.have.status(400);
          done();
        });
    });
    it('should correctly update an existing account', function(done){
	var body = {
		firstName: 'JP',
		lastName: 'Berd'
	};
	request(url)
		.put('/api/profiles/vgheri')
		.send(body)
		.expect('Content-Type', /json/)
		.expect(200) //Status code
		.end(function(err,res) {
			if (err) {
				throw err;
			}
			// Should.js fluent syntax applied
			res.body.should.have.property('_id');
	                res.body.firstName.should.equal('JP');
	                res.body.lastName.should.equal('Berd');                    
	                res.body.creationDate.should.not.equal(null);
			done();
		});
	});
  });
});
*/