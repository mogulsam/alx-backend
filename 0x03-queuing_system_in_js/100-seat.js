import express from 'express';
import { createClient } from 'redis';
import { createQueue } from 'kue';
import { json } from 'body-parser';
import { promisify } from 'util';

// Create a Redis client
const redisClient = createClient();
const getAsync = promisify(redisClient.get).bind(redisClient);
const setAsync = promisify(redisClient.set).bind(redisClient);

const queue = createQueue();

// Initialize Express
const app = express();
const PORT = 1245;

// Middleware
app.use(json());

// Initial seats and reservation status
const INITIAL_SEATS = 50;
let reservationEnabled = true;

const reserveSeat = async (number) => {
    await setAsync('available_seats', number);
};

const getCurrentAvailableSeats = async () => {
    const availableSeats = await getAsync('available_seats');
    return parseInt(availableSeats, 10);
};

// Set initial available seats
(async () => {
    await reserveSeat(INITIAL_SEATS);
})();

// Routes
app.get('/available_seats', async (req, res) => {
    const availableSeats = await getCurrentAvailableSeats();
    res.json({ numberOfAvailableSeats: availableSeats.toString() });
});

app.get('/reserve_seat', async (req, res) => {
    if (!reservationEnabled) {
        return res.json({ status: "Reservations are blocked" });
    }

    const job = queue.create('reserve_seat', {}).save((err) => {
        if (err) {
            return res.json({ status: "Reservation failed" });
        }
        res.json({ status: "Reservation in process" });
    });

    job.on('complete', () => {
        console.log(`Seat reservation job ${job.id} completed`);
    }).on('failed', (errorMessage) => {
        console.log(`Seat reservation job ${job.id} failed: ${errorMessage}`);
    });
});

app.get('/process', async (req, res) => {
    res.json({ status: "Queue processing" });

    queue.process('reserve_seat', async (job, done) => {
        try {
            const availableSeats = await getCurrentAvailableSeats();
            if (availableSeats > 0) {
                await reserveSeat(availableSeats - 1);
                if (availableSeats - 1 === 0) {
                    reservationEnabled = false;
                }
                done(); // Job successful
            } else {
                done(new Error('Not enough seats available')); // Job failed
            }
        } catch (error) {
            done(error); // Job failed
        }
    });
});

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
