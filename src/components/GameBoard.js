import React, { Component } from 'react';
import {
    isLegalGroup, moveMarbles, getMoveDirection, isLegalMove, generateHistoryText,
    getNextStateByAIAction, getNextState, generateSupportlineTexts,
} from '../utils/UtilFunctions';
import AbaloneClient from '../utils/AbaloneClient';
import { Button, Col, Progress, Row, Modal, message } from 'antd';
import GameInfoBoard from './GameInfoBoard';
import GameResult from './GameResult';
import DrawGameBoard, { boardArray } from './DrawGameBoard';

export default class GameBoard extends Component {

    constructor(props) {
        super(props);
        this.state = {
            selectedHex: [],
            supportLine: [],
            curState: [],
            lastState: [],
            stateOption: 1,
            progress: 100,
            timeLeft: 0,
            pause: false,
            start: false,
            moveHistory: [],
            serverConfirmVisible: false,
            gameResultVisible: false
        }

    }

    componentWillMount() {
        this.setState({
            ...this.props.gameSettings,
            curState: this.props.gameSettings.boardInitState,
            turn: 1
        });
    }

    componentDidMount = () => {
        const { whiteTimeLimit, blackTimeLimit } = this.props.gameSettings;

        if (this.props.gameSettings.gameType === "pve") {
            AbaloneClient.connect();
        }

        if (!whiteTimeLimit && !blackTimeLimit) {
            this.setState(
                { start: true },
                () => this.makeAIMove()
            );
        }
    }

    componentWillUnmount = () => {
        if (this.state.clock) {
            clearInterval(this.state.clock);
        }

        if (this.props.gameSettings.gameType === "pve") {
            AbaloneClient.close();
        }
    }

    clickMarble = (e) => {
        const { start, changeInfoArray, turn, supportLine, selectedHex, curState } = this.state;
        const { gameType, playerColor } = this.props.gameSettings;
        const color = parseInt(e.target.getAttribute('color'));
        const position = e.target.getAttribute('location');

        if (!start) {
            return;
        }

        //black move in odd turn, white move in even turn
        if (!changeInfoArray && turn % 2 === (2 - color)) {
            return;
        }

        //AI turn
        if (!changeInfoArray && gameType === "pve" && playerColor !== color) {
            return;
        }

        //check if clicked marble is selected
        if (this.locationSelected(position)) {
            //deselect
            this.setState({ selectedHex: [] });
        } else {
            if (supportLine.length) {
                //push marble
                this.setState({ selectedHex: [], supportLine: [] });
                this.makeMove(changeInfoArray);
            } else {
                //select marbles
                const newSelected = (selectedHex.length >= 3) ? [position] :
                    isLegalGroup(selectedHex, position, curState);
                this.setState({ selectedHex: newSelected });
            }
        }
    }

    clickHex = () => {
        const { supportLine, changeInfoArray } = this.state;
        if (supportLine.length) {
            //move marble
            this.setState({
                selectedHex: [],
                supportLine: []
            });
            this.makeMove(changeInfoArray);
        }
    }

    mouseOverHex = (e) => {
        if (!this.state.selectedHex.length) {
            return;
        }

        const moveDirection = getMoveDirection(this.state.selectedHex, e.target.getAttribute('location'));

        if (moveDirection !== -1) {
            const changeInfoArray = isLegalMove(this.state.selectedHex, moveDirection, boardArray, this.state.curState);

            if (changeInfoArray) {
                const points = generateSupportlineTexts(this.state.selectedHex, boardArray, moveDirection);
                this.showSupportLine(points, changeInfoArray);
            }

        }
    }

    mouseOutHex = (e) => {
        this.hideSupportLine();
    }

    showSupportLine = (points, changeInfoArray) => {

        if (!points.length) {
            return;
        }

        this.setState({
            supportLine: points,
            changeInfoArray
        })
    }

    hideSupportLine = () => {
        this.setState({
            supportLine: [],
            changeInfoArray: null
        })
    }

    makeMove = async (changeInfoArray) => {
        if (!changeInfoArray || !changeInfoArray.length) {
            return;
        }

        //move all selected marbles
        await moveMarbles(changeInfoArray);

        //update move history board
        this.updateMoveHistoryBoard(changeInfoArray);

        //update board state
        const nextState = getNextState(changeInfoArray, this.state.curState);
        this.updateBoardState(nextState);

        //end game if exceeds turn limit
        if (!this.isGameEnd()) {
            this.makeAIMove();
        }
    }

    updateMoveHistoryBoard = (changeInfoArray) => {

        //update move history
        let marbles = [];

        changeInfoArray.forEach(element => {
            marbles.push([element.originLocation]);
        })

        const { whiteTimeLimit, blackTimeLimit } = this.props.gameSettings;
        const timeLimit = this.state.turn % 2 === 0 ? whiteTimeLimit : blackTimeLimit

        let action = {
            turn: this.state.turn,
            marbles,
            direction: changeInfoArray[0].direction,
            time: timeLimit - this.state.timeLeft,
            state: this.state.curState
        }

        action.text = generateHistoryText(action);

        this.setState(prevState => ({
            moveHistory: [...prevState.moveHistory, action]
        }));
    }

    updateBoardState = (boardState) => {
        if (this.state.clock) {
            clearInterval(this.state.clock);
        }

        const { whiteTimeLimit, blackTimeLimit } = this.props.gameSettings;

        this.setState(prevState => ({
            lastState: prevState.curState,
            curState: boardState,
            timeLeft: prevState.turn % 2 === 1 ? whiteTimeLimit : blackTimeLimit,
            progress: 100,
            pause: false,
            turn: prevState.turn + 1
        }));

        this.startTimer();

    }

    isGameEnd = () => {
        const { whiteMoveLimit, blackMoveLimit } = this.props.gameSettings;
        const { turn } = this.state;
        if (turn > whiteMoveLimit + blackMoveLimit && whiteMoveLimit && whiteMoveLimit) {
            this.stopGame();
            return true;
        } else {
            return false;
        }
    }

    makeAIMove = () => {
        const { gameType, whiteMoveLimit, blackMoveLimit, whiteTimeLimit, blackTimeLimit } = this.props.gameSettings;
        const { turn, playerColor, curState, start } = this.state;

        if (!start || gameType === "pvp" || (turn % 2 !== (2 - playerColor))) {
            return;
        }

        const timeLimit = turn % 2 === 0 ? whiteTimeLimit : blackTimeLimit;
        const turnLimit = playerColor === 2 ? whiteMoveLimit : blackMoveLimit;
        const packet = {
            turnLimit,
            timeLimit,
            turn,
            state: curState,
        };

        let that = this;

        AbaloneClient.nextMove(packet).then(({ action }) => {
            const nextState = getNextStateByAIAction(curState, action);
            that.updateBoardState(nextState);
        });

    }

    locationSelected = (location) => {
        let found = false;
        if (this.state.selectedHex.length) {
            found = this.state.selectedHex.find(el => {
                return parseInt(el) === parseInt(location);
            })
        }
        return found;
    }

    startGame = () => {
        if (!AbaloneClient.connected && this.state.gameType === "pve") {
            this.setState({ serverConfirmVisible: true })
        } else {
            this.setState({
                start: true,
                timeLeft: this.props.gameSettings.blackTimeLimit
            })

            this.startTimer();
        }
    }

    pauseGame = () => {
        if (this.state.pause) {
            this.setState({ pause: false })
            this.startTimer()
        } else {
            this.setState({ pause: true })
        }
    }

    leaveGame = () => {
        this.props.stopGame();
    }

    stopGame = () => {
        if (this.state.clock) {
            clearInterval(this.state.clock);
        }

        this.setState({
            start: false,
            gameResultVisible: true
        })
    }

    resetGame = () => {
        if (this.state.clock) {
            clearInterval(this.state.clock);
        }

        this.setState({
            curState: this.props.gameSettings.boardInitState,
            gameResultVisible: false,
            turn: 1,
            progress: 100,
            pause: false,
            timeLeft: 0,
            selectedHex: [],
            moveHistory: []
        })

        const { whiteTimeLimit, blackTimeLimit } = this.props.gameSettings;

        if (!whiteTimeLimit && !blackTimeLimit) {
            this.setState({
                start: true
            })
        } else {
            this.setState({
                start: false
            })
        }

    }

    undoLastMove = () => {
        if (!this.state.lastState.length) {
            return;
        }

        const { whiteTimeLimit, blackTimeLimit } = this.props.gameSettings;

        this.setState(prevState => ({
            lastState: [],
            curState: prevState.lastState,
            timeLeft: prevState.turn % 2 === 0 ? whiteTimeLimit : blackTimeLimit,
            progress: 100,
            pause: false,
            turn: prevState.turn - 1
        }));
    }

    startTimer = () => {
        const { whiteTimeLimit, blackTimeLimit } = this.props.gameSettings;

        if (!whiteTimeLimit && !blackTimeLimit) {
            return;
        }

        const period = 10;

        let clock = setInterval(() => {
            if (this.state.pause) {
                clearInterval(clock);
            } else {
                const { whiteTimeLimit, blackTimeLimit } = this.props.gameSettings;
                if (this.state.timeLeft > 0) {
                    let timeLeft = this.state.timeLeft - 1 / period;
                    let timeLimit = this.state.turn % 2 === 0 ? whiteTimeLimit : blackTimeLimit;
                    let progress = (timeLeft / timeLimit) * 100;

                    this.setState({
                        timeLeft, progress
                    })
                } else {
                    clearInterval(clock);
                }
            }
        }, 1000 / period);

        this.setState({
            clock
        })
    }

    connectServer = async () => {
        this.closeServerConfirmBox();
        setTimeout(() => {
            if (!AbaloneClient.connected) {
                message.error('Unable to connect server!');
            }
        }, 2000);
        await AbaloneClient.connect();
        this.startGame();
    }

    closeServerConfirmBox = () => {
        this.setState({ serverConfirmVisible: false })
    }

    render() {

        const startIcon = this.state.start ? (this.state.pause ? "step-forward" : "pause-circle") : "caret-right";
        const startClickFunction = this.state.start ? this.pauseGame : this.startGame;
        const { whiteTimeLimit, blackTimeLimit } = this.props.gameSettings;

        return (
            <div>
                <Row>
                    <Col span={11} offset={1}>
                        <div style={{ margin: 30 }}>
                            <Row gutter={4}>
                                {whiteTimeLimit && blackTimeLimit ?
                                    <Col span={5} offset={1}>
                                        <Button type="primary" size="large" icon={startIcon} onClick={startClickFunction} block>
                                            {this.state.start ? (this.state.pause ? "Resume" : "Pause") : "Start"}
                                        </Button>
                                    </Col> : <Col span={5} offset={1}></Col>}

                                <Col span={5}>
                                    <Button type="danger" size="large" icon="stop" onClick={this.stopGame} block> Stop </Button>
                                </Col>
                                <Col span={5}>
                                    <Button size="large" icon="rollback" onClick={this.resetGame} block> Reset </Button>
                                </Col>
                                <Col span={5}>
                                    <Button type="dashed" icon="backward" size="large" onClick={this.undoLastMove} block> Undo </Button>
                                </Col>
                            </Row>
                        </div>
                        <div>
                            <DrawGameBoard
                                curState={this.state.curState}
                                locationSelected={this.locationSelected}
                                supportLine={this.state.supportLine}
                                mouseOverHex={this.mouseOverHex}
                                mouseOutHex={this.mouseOutHex}
                                clickHex={this.clickHex}
                                clickMarble={this.clickMarble}
                            />
                        </div>

                        {whiteTimeLimit && blackTimeLimit ?
                            <div style={{ margin: 20 }}>
                                <Progress showInfo={false} strokeWidth={20} strokeColor="square" strokeLinecap="round" percent={this.state.progress} />
                            </div> : null}

                    </Col>
                    <Col span={10} offset={1}>
                        <GameInfoBoard gameInfo={this.state} />
                    </Col>
                </Row>

                <Modal
                    title="Server Disconnected"
                    visible={this.state.serverConfirmVisible}
                    onOk={this.connectServer}
                    onCancel={this.closeServerConfirmBox}
                    okText="Reconnect"
                    cancelText="Cancel"
                >
                    Server disconnected. Do you want to re-connect?
                </Modal>

                <Modal
                    title="Game Result"
                    visible={this.state.gameResultVisible}
                    maskClosable={false}
                    closable={false}
                    width={1200}
                    centered
                    footer={[
                        <Row gutter={24} key="buttons">
                            <Col span={6} offset={4}>
                                <Button type="primary" onClick={this.resetGame} block>Play another game</Button>
                            </Col>
                            <Col span={6} offset={4}>
                                <Button type="danger" onClick={this.leaveGame} block>Leave game</Button>
                            </Col>
                        </Row>
                    ]}
                >
                    <GameResult gameInfo={this.state} />
                </Modal>
            </div>
        )
    }
}

