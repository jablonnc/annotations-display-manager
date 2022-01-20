import { DisplayManager } from './display-manager.js';
import { staticTracks } from '../data/tracks.js';

/*
    A simple Player intended to stub out the functionality of a video player,
    where upon calling play it begins to trigger a call to the timeUpdate
    method.  As the approach should be scalable, I am using a simple observer
    pattern here so the Player and DisplayManager are loosely coupled.
*/
class Player {
    constructor () {
        this.observers = [];
        this.event = { data: { currentTime: 0 } };
    }

    subscribe (observer) {
        this.observers.push(observer);
    }

    unsubscribe (observer) {
        this.observers = this.observers.filter(item => item !== observer);
    }

    play () {
        const PLAYER_RATE = 250;

        // Simulate a video player executing every 250 milliseconds
        setInterval(() => {
            // The goal here is simulate an event being fired where event is equal to event.data.currentTime
            this.event.data.currentTime += 0.250000;

            this.timeUpdate(this.event);
        }, PLAYER_RATE);
    }

    timeUpdate (event) {
        /*
            Per the instructions, currentTime (seconds, float) is exposed as event.data.currentTime,
            our algorithm will be called here with the currentTime as the argument.
        */
        this.observers.forEach(observer => observer.timeUpdate(event.data.currentTime.toFixed(6)));
    }
}

const player = new Player();
const displayManager = new DisplayManager(staticTracks);
const currentTime = process.argv.filter(arg => arg.includes('currentTime'));

if (currentTime && currentTime.length) {
    const timeStamp = currentTime[0].split('=')[1];

    displayManager.timeUpdate(timeStamp);
} else {
    player.subscribe(displayManager);
    player.play();
}
