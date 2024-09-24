import kue from 'kue';

const queue = kue.createQueue();

function createPushNotificationsJobs(jobs, queue) {
    if (!Array.isArray(jobs)) {
        throw new Error("Jobs is not an array");
    }

    jobs.forEach(job => {
        const jobId = queue.create('push_notification_code_3', job);

        jobId.on('complete', () => {
            console.log(`Notification job ${jobId.id} completed`);
        });

        jobId.on('failed', (error) => {
            console.log(`Notification job ${jobId.id} failed: ${error}`);
        });

        jobId.on('progress', (progress) => {
            console.log(`Notification job ${jobId.id} ${progress}% complete`);
        });

        console.log(`Notification job created: ${jobId.id}`);
    });
}
