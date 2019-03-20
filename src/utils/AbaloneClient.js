const electron = window.require('electron');
const net = electron.remote.require('net');

const { Socket } = net;


class AbaloneClient {

    constructor() {
        this.client = new Socket();
        this.connected = false;

        this.client.connect(1337, 'localhost', () => {
            this.connected = true;
        });

        this.client.on('close', () => {
            this.connected = false;
        });

        // TODO: need a way to hook-up response handler
        this.client.on('data', (data) => {
            console.log(data.toString());
        })
    }

    requestCurrentState = () => {
        this.client.write('game-state\n');
    }

    close = () => {
        this.client.destroy();
    }

}

export default new AbaloneClient();