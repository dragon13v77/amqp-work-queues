const amqp = require('amqp-connection-manager');

const LOCAL_URL = 'amqp://localhost';
const QUEUE_NAME = 'task_queue';

// Handle an incoming message.
const onMessage = function(data) {
	var secs = data.content.toString().split('.').length - 1;
	console.log(" [x] Received %s", data.content.toString());
	setTimeout(function() {
		console.log(" [x] Done after secs", secs);
	}, secs * 1000);
};

// Create a connection manager
var connection = amqp.connect([LOCAL_URL]);
connection.on('connect', function() {
	console.log('Receiver Connected!');
});
connection.on('disconnect', function(err) {
	console.log('Disconnected.', err.stack);
});

// Set up a channel listening for messages in the queue.
var channelWrapper = connection.createChannel({
	setup: function(channel) {
		// `channel` here is a regular amqplib `ConfirmChannel`.
		return Promise.all([
			channel.assertQueue(QUEUE_NAME, {durable: true}),
			channel.prefetch(1),
			channel.consume(
				QUEUE_NAME,
				onMessage,
				{
				// automatic acknowledgment mode,
				// see https://www.rabbitmq.com/confirms.html for details
				noAck: true
			})
		]);
	}
});

channelWrapper.waitForConnect()
	.then(function() {
		console.log("Listening for messages");
	});