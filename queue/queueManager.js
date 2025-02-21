const queue = new Map();

function getQueue(guildId) {
    return queue.get(guildId);
}

function setQueue(guildId, queueData) {
    queue.set(guildId, queueData);
}

function addToQueue(guildId, song) {
    const currentQueue = queue.get(guildId) || [];
    currentQueue.push(song);
    queue.set(guildId, currentQueue);
}

module.exports = { getQueue, setQueue, addToQueue };
