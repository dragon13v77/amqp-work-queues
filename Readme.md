# AMQP Work Queues

In the [first tutorial](https://github.com/dragon13v77/amqp-tutorial) we wrote programs to send and receive messages from a named queue.
In this one we'll create a Work Queue that will be used to distribute time-consuming tasks among multiple workers.

The main idea behind Work Queues (aka: Task Queues) is to avoid doing a resource-intensive task immediately and having to wait for it to complete.
Instead we schedule the task to be done later. We encapsulate a task as a message and send it to a queue.

This concept is especially useful in web applications where it's impossible to handle a complex task during a short HTTP request window.

### Message acknowledgment

In order to make sure a message is never lost, RabbitMQ supports message acknowledgments.
An ack(nowledgement) is sent back by the consumer to tell RabbitMQ that a particular message has been received, processed and that RabbitMQ is free to delete it.

Manual consumer acknowledgments have been turned off in previous examples.
It's time to turn them on using the {noAck: false} option and send a proper acknowledgment from the worker, once we're done with a task.

`channel.consume(QUEUE_NAME, onMessage, {noAck: false})`

See https://www.rabbitmq.com/confirms.html for details.

### Message durability

When RabbitMQ quits or crashes it will forget the queues and messages unless you tell it not to.
Two things are required to make sure that messages aren't lost: we need to mark both the queue and messages as durable.
This durable option change needs to be applied to both the producer and consumer code.

`channel.assertQueue('queue_name', {durable: true});`

At this point we're sure that the task_queue queue won't be lost even if RabbitMQ restarts.
Now we need to mark our messages as persistent - by using the persistent option Channel.sendToQueue takes.

`channel.sendToQueue(queue_name, Buffer.from(msg), {persistent: true});`

### Fair dispatch

Dispatching still doesn't work exactly as we want.
RabbitMQ just dispatches a message when the message enters the queue.
It doesn't look at the number of unacknowledged messages for a consumer.
It just blindly dispatches every n-th message to the n-th consumer.

In order to defeat that we can use the prefetch method with the value of 1.
This tells RabbitMQ not to give more than one message to a worker at a time.
Or, in other words, don't dispatch a new message to a worker until it has processed and acknowledged the previous one.
Instead, it will dispatch it to the next worker that is not still busy.

`channel.prefetch(1);`

---

To test run two or more receiver (workers) scripts and watch what happens when message is sent from sender script.
To send a message: `node sender Test message .....` where dots represent time to wait till work is complete

Detail tutorial can be found here https://www.rabbitmq.com/tutorials/tutorial-two-javascript.html