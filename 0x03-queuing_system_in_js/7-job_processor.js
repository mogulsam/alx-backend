import { createQueue } from 'kue';
import { createClient } from 'redis';

const client = createClient();

// Blacklisted phone numbers
const blacklistedNumbers = ['4153518780', '4153518781'];

// Function to send notification
function sendNotification(phoneNumber, message, job, done) {
    
    job.progress(0, 100);

    // Check if the phone number is blacklisted
    if (blacklistedNumbers.includes(phoneNumber)) {
        const error = new Error(`Phone number ${phoneNumber} is blacklisted`);
        job.fail(error);
        return done(error);
    }

    // Simulate sending notification
    job.progress(50, 100);
    console.log(`Sending notification to ${phoneNumber}, with message: ${message}`);

    
    done();
}

// Create a queue for push_notification_code_2
queue.process('push_notification_code_2', 2, (job, done) => {
    const { phoneNumber, message } = job.data;
    sendNotification(phoneNumber, message, job, done);
});

// Example of adding jobs to the queue usage
const addJobToQueue = (phoneNumber, message) => {
    const job = queue.create('push_notification_code_2', {
        phoneNumber,
        message
    }).save((err) => {
        if (!err) console.log(`Job created: ${job.id}`);
    });
};

// Add jobs to the queue
addJobToQueue('4153518780', 'This is a test message.'); // Blacklisted
addJobToQueue('4153518782', 'This is another test message.'); // Not blacklisted

// Start the Kue server
app.listen(3000, () => {
    console.log('Kue server is running on port 3000');
});
