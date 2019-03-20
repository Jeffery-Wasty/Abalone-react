const electron = window.require('electron');
const net = electron.remote.require('net');

const { Socket } = net;


class AbaloneClient {

    constructor() {
        this.client = new Socket();
        this.connected = false;
        this.handlerId = 0;
        this.responseHandlers = {};

        this.client.connect(1337, 'localhost', () => {
            this.connected = true;
        });

        this.client.on('close', () => {
            this.connected = false;
        });

        this.client.on('data', (data) => {
            const { endpoint, response } = this.preprocessResponse(data.toString());
            const handlers = this.responseHandlers[endpoint];
            if (handlers) {
                for (const handler of Object.values(handlers)) {
                    handler(response);
                }
            } else {
                console.warn('No handler attached for ' + endpoint);
                console.warn(response);
            }
        })

        window.onbeforeunload = () => {
            this.close();
        }
    }

    callServer = (endpoint, data) => {
        let queryString = endpoint;
        if (data) {
            queryString += '?'
            for (const [key, value] of Object.entries(data)) {
                queryString += key + '=' + value + '&';
            }
        }
        this.client.write(queryString + '\n');
    }

    requestCurrentState = () => {
        this.callServer('game-state');
    }

    addHandler = (endpoint, handler) => {
        const handlers = this.responseHandlers[endpoint];
        if (handlers) {
            handlers[++this.handlerId] = handler;
        } else {
            this.responseHandlers[endpoint] = {};
            this.responseHandlers[endpoint][++this.handlerId] = handler;
        }
        return this.handlerId;
    }

    removeHandler = (endpoint, id) => {
        delete this.responseHandlers[endpoint][id];
    }

    preprocessResponse = (data) => {
        const index = data.indexOf('?');
        const endpoint = data.substring(0, index);
        const params = new URLSearchParams(data.substring(index + 1));
        const response = {};
        for (const [key, value] of params.entries()) {
            response[key] = value;
        }
        return { endpoint, response };
    }

    close = () => {
        this.client.destroy();
    }

}

export default new AbaloneClient();