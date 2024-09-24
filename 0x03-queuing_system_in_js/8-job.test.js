import createPushNotificationsJobs from './8-job';
import kue from 'kue';
import { expect } from 'chai';

const queue = kue.createQueue();

describe('createPushNotificationsJobs', () => {
    before(() => {
        // Enter test mode
        queue.testMode = true;
    });

    afterEach(() => {
        // Clear the queue after each test
        queue.clear();
    });

    after(() => {
        // Exit test mode
        queue.testMode = false;
    });

    it('should throw an error if jobs is not an array', () => {
        expect(() => createPushNotificationsJobs({}, queue)).to.throw(Error, "Jobs is not an array");
    });

    it('should create jobs in the queue', () => {
        const jobs = [{ title: 'Job 1' }, { title: 'Job 2' }];
        createPushNotificationsJobs(jobs, queue);

        // Validate that the jobs are inside the queue
        const jobCount = queue.jobTypes['push_notification_code_3'].length;
        expect(jobCount).to.equal(2);
    });

    it('should log messages for job events', (done) => {
        const jobs = [{ title: 'Job 1' }];
        createPushNotificationsJobs(jobs, queue);

        const job = queue.testMode.jobs[0];

        job.on('complete', () => {
            expect(job._progress).to.equal(100);
            done();
        });

        job.emit('complete');
    });
});
