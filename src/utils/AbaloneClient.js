const electron = window.require('electron');
const net = electron.remote.require('net');

const { Socket } = net;


class AbaloneClient {

    nextMove = async ({ state, timeLimit, turnLimit, turn }) => {
        state = state.join(',');
        let response = await this.callServer('next-move', { state, timeLimit, turnLimit, turn });
        response.action = JSON.parse(response.action);
        return response;
    }

    // nextPlayerMove = async (moves) => {
    //     moves = moves.join(',');
    //     let response = await this.callServer('next-move', {moves});
    //     response.succeed = JSON.parse(response.succeed);
    //     return response;
    // }

    // requestCurrentState = async () => {
    //     let response = await this.callServer('game-state');
    //     response.state = JSON.parse(response.state);
    //     response.turn = parseInt(response.turn);
    //     return response;
    // }

    // newGame = async ({ boardLayout, gameMode, playerColor, turnLimit, timeLimit }) => {
    //     return await this.callServer('new-game', { boardLayout, gameMode, playerColor, turnLimit, timeLimit });
    // }

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
            if (response.error) {
                throw new Error(endpoint + ": " + response.error);
            }
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

    callServer = async (endpoint, data) => {
        return new Promise((resolve, reject) => {
            // add handler that resolve the returned data
            const handlerId = this.addHandler(endpoint, (res) => {
                // must use == here!!!
                if (res.request_id == handlerId) {
                    delete res['request_id'];
                    resolve(res);
                    this.removeHandler(endpoint, handlerId);
                }
            });
            // init data object
            data = data || {};
            // append the request_id
            data['request_id'] = handlerId;
            // convert data to query string
            let queryString = endpoint + '?';
            for (const [key, value] of Object.entries(data)) {
                queryString += key + '=' + value + '&';
            }
            // call server with data
            this.client.write(queryString + '\n');
        });
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

    close = () => {
        this.client.destroy();
    }

}

export default new AbaloneClient();