import { destTable } from './DestTable';

class AbaloneAI {

    validInlineMoveSequence = new Set([
        'O+',
        'OO+',
        'OO@+',
        'OO@!',
        'OOO+',
        'OOO@+',
        'OOO@!',
        'OOO@@+',
        'OOO@@!',
    ]);

    //Black is MAX, white is MIN
    MinMaxDecision = (curState, curTurn, turnLimit) => {

        let game = { curState, curTurn, turnLimit, level: 0 };
        let action;

        if (this.getPlayer(curTurn) === 2) {
            action = this.maxAction(game, Number.NEGATIVE_INFINITY, Number.POSITIVE_INFINITY);
        } else {
            action = this.minAction(game, Number.NEGATIVE_INFINITY, Number.POSITIVE_INFINITY);
        }
        return action;    
    }

    maxAction = (game, alpha, beta) => {
        if (this.TerminalTest(game)) {
            return null;
        }

        let action = null;
        let value = Number.NEGATIVE_INFINITY;
        this.generatePlayerActions(game.curState, 2).forEach(a => {
            let result = this.minValue(this.gameNextState(game, a), alpha, beta);
            if (result > value) {
                value = result;
                action = a;
            }
            alpha = Math.max(alpha, value);
        })

        return action;
    }

    minAction = (game, alpha, beta) => {
        if (this.TerminalTest(game)) {
            return null;
        }

        let action = null;
        let value = Number.POSITIVE_INFINITY;

        this.generatePlayerActions(game.curState, 1).forEach(a => {
            let result = this.maxValue(this.gameNextState(game, a), alpha, beta);
            if (result < value) {
                value = result;
                action = a;
            }
            beta = Math.min(beta, value);
        })

        return action;
    }

    maxValue = (game, alpha, beta) => {
        if (this.TerminalTest(game)) {
            return this.getUtility(game.curState, 2);
        }

        let value = Number.NEGATIVE_INFINITY;

        this.generatePlayerActions(game.curState, 2).forEach(a => {
            let result = this.minValue(this.gameNextState(game, a), alpha, beta);
            if (result > value) {
                value = result;
            }

            if (value >= beta) {
                return value;
            }
            alpha = Math.max(alpha, value);
        })

        return value;
    }

    minValue = (game, alpha, beta) => {
        if (this.TerminalTest(game)) {
            return this.getUtility(game.curState, 1);
        }

        let value = Number.POSITIVE_INFINITY;

        this.generatePlayerActions(game.curState, 1).forEach(a => {
            let result = this.maxValue(this.gameNextState(game, a), alpha, beta);
            if (result < value) {
                value = result;
            }

            if (value <= alpha) {
                return value;
            }
            beta = Math.min(beta, value);
        })

        return value;
    }


    gameNextState = (game, action) => {
        const nextState = {
            curState: this.transitionTable(game.curState, action),
            curTurn: game.curTurn + 1,
            turnLimit: game.turnLimit,
            level: game.level + 1
        }

        return nextState;
    }

    //1 is white, 2 is black
    getPlayer = (turn) => {
        return turn % 2 === 0 ? 1 : 2;
    }

    //actions with three parameter
    //selectedMarbles - array of selected location in order from smallest to largest
    //direction
    //moveType - 1 is inline move, 2 is opposite inline move, 3 is side move
    generatePlayerActions = (curState, player) => {
        let actions = [];

        curState.forEach((e, location) => {
            if (e === player) {
                for (let i = 0; i < 6; ++i) {
                    //inline move
                    let seq = this.moveSequence(location, curState, i);
                    let num = seq.replace(/[^O]/g, "").length;
                    let selectedMarbles = [];
                    if (num === 1) {
                        selectedMarbles = [location]
                    } else if (num === 2) {
                        selectedMarbles = [location, destTable[location][i]]
                    } else {
                        selectedMarbles = [location, destTable[location][i], destTable[destTable[location][i]][i]]
                    }

                    if (this.validInlineMoveSequence.has(seq)) {
                        actions.push({
                            selectedMarbles,
                            direction: i,
                            moveType: 1
                        })
                    }

                    if (seq.startsWith('OO')) {

                        let location1 = destTable[location][i];
                        let location2 = destTable[location1][i];

                        //opposite inline move with two
                        let seq2 = this.oppositeMoveSequence(location, curState, 5 - i, false);

                        if (this.validInlineMoveSequence.has(seq2)) {
                            actions.push({
                                selectedMarbles: [
                                    location,
                                    location1
                                ],
                                direction: 5 - i,
                                moveType: 2
                            })
                        }

                        //side move with two
                        for (let j = 0; j < 6; ++j) {
                            if (j !== i || j !== 5 - i) {
                                if (destTable[location][j] !== -1 && destTable[location1][j] !== -1 &&
                                    !curState[destTable[location][j]] && !curState[destTable[location1][j]]) {
                                    actions.push({
                                        selectedMarbles: [
                                            location,
                                            location1,
                                        ],
                                        direction: j,
                                        moveType: 3
                                    })
                                }
                            }
                        }

                        if (seq.startsWith('OOO')) {
                            //opposite inline move with three
                            let seq3 = this.oppositeMoveSequence(location, curState, 5 - i, true);

                            if (this.validInlineMoveSequence.has(seq3)) {
                                actions.push({
                                    selectedMarbles: [
                                        location,
                                        location1,
                                        location2
                                    ],
                                    direction: 5 - i,
                                    moveType: 2
                                })
                            }

                            //side move with three
                            for (let j = 0; j < 6; ++j) {
                                if (j !== i || j !== 5 - i) {
                                    if (destTable[location][j] !== -1 && destTable[location1][j] !== -1 && destTable[location2][j] !== -1 &&
                                        !curState[destTable[location][j]] && !curState[destTable[location1][j]] && !curState[destTable[location2][j]]) {
                                        actions.push({
                                            selectedMarbles: [
                                                location,
                                                location1,
                                                location2
                                            ],
                                            direction: j,
                                            moveType: 3
                                        })
                                    }
                                }
                            }

                        }

                    }

                }
            }
        });

        return actions;
    }

    transitionTable = (curState, action) => {
        if (action.selectedMarbles.length === 1) {
            return this.sideMoveTransition(action.selectedMarbles, curState, action.direction);
        } else {
            if (action.moveType === 1) {
                let startLocation = action.selectedMarbles[0];
                return this.inlineTransition(startLocation, curState, action.direction);
            } else if (action.moveType === 2) {
                let startLocation = action.selectedMarbles[action.selectedMarbles.length - 1];
                return this.inlineTransition(startLocation, curState, action.direction);
            } else {
                return this.sideMoveTransition(action.selectedMarbles, curState, action.direction);
            }
        }
    }

    inlineTransition = (startLocation, curState, direction) => {

        let color = curState[startLocation];
        let destLocation = startLocation;
        let tempState = [...curState];
        tempState[startLocation] = 0

        while (true) {
            destLocation = destTable[destLocation][direction];

            if (destLocation === -1) {
                return tempState;
            } else if (curState[destLocation] === 0) {
                tempState[destLocation] = color;
                return tempState;
            } else {
                if (curState[destLocation] !== color) {
                    tempState[destLocation] = color;
                    color = curState[destLocation];
                }
            }
        }

    }

    sideMoveTransition = (selectedMarbles, curState, direction) => {
        let tempState = [...curState];
        selectedMarbles.forEach(element => {
            tempState[element] = 0;
            tempState[destTable[element][direction]] = curState[element];
        })
        return tempState;
    }

    moveSequence = (location, curState, direction) => {
        const player = curState[location];
        let charSequence = "O";
        let destLocation = destTable[location][direction];

        if (direction < 3) {
            if (destLocation !== -1 && !curState[destLocation]) {
                charSequence += "+";
            }
        } else {
            while (charSequence.length <= 6) {
                if (destLocation === -1) {
                    charSequence += "!";
                    return charSequence;
                } else if (curState[destLocation] === 0) {
                    charSequence += "+";
                    return charSequence;
                } else {
                    charSequence += (curState[destLocation] === player) ? "O" : "@";
                }

                destLocation = destTable[destLocation][direction];
            }
        }

        return charSequence;
    }

    oppositeMoveSequence = (location, curState, direction, isThree) => {
        const player = curState[location];
        let charSequence = isThree ? "OOO" : "OO";
        let destLocation = destTable[location][direction];

        while (charSequence.length <= 6) {
            if (destLocation === -1) {
                charSequence += "!";
                return charSequence;
            } else if (curState[destLocation] === 0) {
                charSequence += "+";
                return charSequence;
            } else if (curState[destLocation] === player) {
                charSequence += "O";
                return charSequence;
            } else {
                charSequence += "@";
            }

            destLocation = destTable[destLocation][direction];
        }
    }

    TerminalTest = (game) => {
        if (game.level > 3) {
            return true;
        }

        return game.curState.filter(color => color === 1).length <= 8 || game.curState.filter(color => color === 2).length <= 8;
    }

    getUtility = (curState, player) => {
        return curState.filter(color => color === player).length - curState.filter(color => color === 3 - player).length;
    }
}

export default new AbaloneAI();