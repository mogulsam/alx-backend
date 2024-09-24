const kue = require('kue');
const queue = kue.createQueue();

// Function to send notification
function sendNotification(phoneNumber, message) {
    console.log(`Sending notification to ${phoneNumber}, with message: ${message}`);
}

// Process jobs in the queue
queue.process('push_notification_code', (job, done) => {
    const { phoneNumber, message } = job.data;
    sendNotification(phoneNumber, message);
    done(); // when the job is done
});

// Start the queue server
queue.on('error', (err) => {
    console.error('Queue Error:', err);
});

console.log('Job processor is running...');
