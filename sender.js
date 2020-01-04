const amqp = require('amqp-connection-manager');
const wait = require('./helpers').wait;

const LOCAL_URL = 'amqp://localhost';
const QUEUE_NAME = 'task_queue';
var msg = process.argv.slice(2).join(' ') || "Hello World!";

// Create a new connection manager
var connection = amqp.connect([LOCAL_URL]);

connection.on('connect', function (conn) {
	console.log('Sender Connected!');
});

connection.on('disconnect', function (err) {
	console.log('Disconnected.', err.stack);
});


// Ask the connection manager for a ChannelWrapper.  Specify a setup function to
// run every time we reconnect to the broker.
var channelWrapper = connection.createChannel({
	json: true,
	setup: function (channel) {
		// `channel` here is a regular amqplib `ConfirmChannel`.
		return channel.assertQueue(QUEUE_NAME, {durable: true});
	}
});

// Send messages until someone hits CTRL-C or something goes wrong...
// If we're not currently connected, these will be queued up in memory
var sendMessage = function () {
	channelWrapper.sendToQueue(QUEUE_NAME, msg, {persistent: true})
		.then(function () {
			channelWrapper.close();
			connection.close();
			process.exit(0);
		}).catch(function (err) {
			console.log("Message was rejected:", err.stack);
			channelWrapper.close();
			connection.close();
			process.exit(0);
		});
};

console.log("Sending message", msg);
sendMessage();