import React, { Component } from 'react';
import {
    isLegalGroup, moveMarbles, getMoveDirection, isLegalMove, generateHistoryText,
    getNextStateByAIAction, getNextState, generateSupportlineTexts,
} from '../utils/UtilFunctions';
import AbaloneClient from '../utils/AbaloneClient';
import { Button, Col, Progress, Row, Modal, message } from 'antd';
import GameInfoBoard from './GameInfoBoard';
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
            serverConfirmVisible: false
        }

    }

    componentWillMount() {
        this.setState({
            ...this.props.gameSettings,
            curState: this.props.gameSettings.boardInitState,
            turn: 1
        })
    }

    componentDidMount = () => {
        if (this.props.gameSettings.gameType === "pve") {
            AbaloneClient.connect();
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
        if (!this.state.start) {
            return;
        }

        //black move in odd turn, white move in even turn
        if (!this.state.changeInfoArray && this.state.turn % 2 === (2 - parseInt(e.target.getAttribute('color')))) {
            return;
        }        

        //AI turn
        if (!this.state.changeInfoArray && this.props.gameSettings.gameType === "pve" 
            && this.props.gameSettings.playerColor !== parseInt(e.target.getAttribute('color'))) {
            return;
        }

        //location already selected, deselect
        const selected = this.locationSelected(e.target.getAttribute('location'));
        if (selected) {
            this.setState({ selectedHex: [] });
        } else {
            if (this.state.supportLine.length) {
                //push marble
                this.setState({ selectedHex: [], supportLine: [] });
                this.makeMove(this.state.changeInfoArray);

            } else {
                if (this.state.selectedHex.length >= 3) {
                    this.setState({ selectedHex: [e.target.getAttribute('location')] });
                } else {
                    const newSelected = isLegalGroup(this.state.selectedHex, e.target.getAttribute('location'));
                    this.setState({ selectedHex: newSelected });
                }
            }
        }
    }

    clickHex = (e) => {
        if (this.state.supportLine.length) {
            //move marble
            this.setState({ selectedHex: [], supportLine: [] });
            this.makeMove(this.state.changeInfoArray);
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

        //If pve and AI turn, start AI move
        if (this.props.gameSettings.gameType === "pve" && (this.state.turn % 2 === (2 - this.state.playerColor))) {
            this.makeAIMove();
        }
    }

    updateMoveHistoryBoard = (changeInfoArray) => {

        //update move history
        let marbles = []

        changeInfoArray.forEach(element => {
            marbles.push([element.originLocation]);
        })

        const {whiteTimeLimit, blackTimeLimit} = this.props.gameSettings;

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

    makeAIMove = () => {
        const { whiteMoveLimit, blackMoveLimit, whiteTimeLimit, blackTimeLimit } = this.props.gameSettings;

        const timeLimit = this.state.turn % 2 === 0 ? whiteTimeLimit : blackTimeLimit;
        const moveLimit = this.state.playerColor === 2? whiteMoveLimit : blackMoveLimit;

        const packet = {
            turnLimit: moveLimit, 
            timeLimit,
            state: this.state.curState,
            turn: this.state.turn
        };

        let that = this;

        AbaloneClient.nextMove(packet).then(({ action }) => {
            const nextState = getNextStateByAIAction(this.state.curState, action);
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

    stopGame = () => {
        this.props.stopGame();
    }

    resetGame = () => {
        if (this.state.clock) {
            clearInterval(this.state.clock);
        }

        this.setState({
            curState: this.props.boardInitState,
            turn: 1,
            progress: 100,
            pause: false,
            start: false,
            timeLeft: 0,
            selectedHex: [],
            moveHistory: []
        })
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

        if(!whiteTimeLimit && !blackTimeLimit) {
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
                                <Col span={5} offset={1}>
                                    <Button type="primary" size="large" icon={startIcon} onClick={startClickFunction} block>
                                        {this.state.start ? (this.state.pause ? "Resume" : "Pause") : "Start"}
                                    </Button>
                                </Col>
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

                        {whiteTimeLimit && blackTimeLimit? 
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
            </div>
        )
    }
}

