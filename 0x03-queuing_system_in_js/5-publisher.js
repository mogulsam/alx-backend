import { createClient } from "redis";

const client = createClient();

client.on("connect", () => {
    console.log("Redis client connected to the server");
})

client.on(("error)", (error) => {
    console.log(`Redis client not connected to the server: ${error.message}`);
}))

function publishMessage(message, time) {
    setTimeout(() => {
        console.log(`About to send ${message}`);
        client.publish("holberton school channel", message);
    }, time);
}
