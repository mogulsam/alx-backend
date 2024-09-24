import kue from 'kue';

const queue = kue.createQueue();

const jobData = {
    phoneNumber: '1234567890',
    message: 'This is a test notification message',
};

// Create a job in the queue
const job = queue.create('push_notification_code', jobData).save((err) => {
    if (!err) {
        console.log(`Notification job created: ${job.id}`);
    }
});

// job completion
job.on('complete', () => {
    console.log('Notification job completed');
});

// job failure
job.on('failed', () => {
    console.log('Notification job failed');
});
