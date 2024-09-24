import { createClient } from "redis";

const client = createClient();

client.on("connect", () => {
    console.log("Redis client connected to the server");
}).on("error", (error) => {
    console.log(`Redis client not connected to the server: ${error.message}`);
})

client.subscribe("holberton school channel");

client.on("message", (channel, message) => {
    console.log(message);
    if (message === "KILL_SERVER") {
        client.unsubcribe(channel);
        client.quit();
    }
});
