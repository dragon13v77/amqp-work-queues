# AMQP Work Queues

The main idea behind Work Queues (aka: Task Queues) is to avoid doing a resource-intensive task immediately and having to wait for it to complete.
Instead we schedule the task to be done later. We encapsulate a task as a message and send it to a queue.

This concept is especially useful in web applications where it's impossible to handle a complex task during a short HTTP request window.


Detail tutorial can be found here https://www.rabbitmq.com/tutorials/tutorial-two-javascript.html