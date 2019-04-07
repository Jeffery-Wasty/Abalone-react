import React, { Component } from 'react';
import {
    isLegalGroup, moveMarbles, getMoveDirection, isLegalMove, generateHistoryText, 
    locationSelected, getNextStateByAIAction, getNextState, generateSupportlineTexts, 
    getChangeInfoArrayFromAIMove, isPlayerMove
} from '../utils/UtilFunctions';
import AbaloneClient from '../utils/AbaloneClient';
import { Button, Col, Progress, Row, Modal, message, Spin } from 'antd';
import GameInfoBoard from './GameInfoBoard';
import GameResult from './GameResult';
import DrawGameBoard, { boardArray } from './DrawGameBoard';
import GodMode from './GodMode';
import AbaloneAI from '../utils/AbaloneAI';
import resultBk from '../image/result.jpg';
import historyBk from '../image/history.jpg';

export default class GameBoard extends Component {

    constructor(props) {
        super(props);
        this.state = {
            selectedHex: [],
            supportLine: [],
            curState: [],
            lastState: [],
            moveHistory: [],
            progress: 100,
            timeLeft: 0,
            pause: false,
            start: false,
            serverConfirmVisible: false,
            gameResultVisible: false,
            historyVisible: false,
            godModeVisible: false
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
        const { timeLimitChecked, gameType } = this.props.gameSettings;

        if (gameType === "pve" || gameType === "eve") {
            AbaloneClient.connect();
        }

        if (!timeLimitChecked) {
            this.setState({ start: true });
            this.shouldAIMove();
        }
    }

    componentWillUnmount = () => {
        const { clock } = this.state;
        const { gameType } = this.props.gameSettings;
        if (clock) {
            clearInterval(clock);
        }

        if (gameType === "pve" || gameType === "eve") {
            AbaloneClient.close();
        }
    }

    clickMarble = (e) => {
        const { start, changeInfoArray, turn, supportLine, selectedHex, curState } = this.state;
        const { gameType, playerColor } = this.props.gameSettings;
        const color = parseInt(e.target.getAttribute('color'));
        const position = e.target.getAttribute('location');

        if (!start || gameType === "eve") {
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
        if (locationSelected(selectedHex, position)) {
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
        const { selectedHex, curState } = this.state;
        const hoverLocation = e.target.getAttribute('location');

        if (!selectedHex.length) {
            return;
        }

        const moveDirection = getMoveDirection(selectedHex, hoverLocation);

        if (moveDirection !== -1) {
            const changeInfoArray = isLegalMove(selectedHex, moveDirection, boardArray, curState);

            if (changeInfoArray) {
                const points = generateSupportlineTexts(selectedHex, boardArray, moveDirection);
                this.showSupportLine(points, changeInfoArray);
            }
        }
    }

    mouseOutHex = () => {
        if (this.state.selectedHex.length) {
            this.hideSupportLine();
        }
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

        //end game if exceeds turn limit or score equals 6
        this.isGameEnd();
    }

    shouldAIMove = () => {
        const { gameType, whiteMoveLimit, blackMoveLimit, whiteTimeLimit, blackTimeLimit,
            autoSwitchTurn, moveLimitChecked, timeLimitChecked, boardInitStateNo } = this.props.gameSettings;
        const { start, pause, turn, playerColor, curState } = this.state;
        
        if (!start || pause || isPlayerMove(gameType, turn, playerColor)) {
            return;
        }

        const timeLimit = timeLimitChecked ? (turn % 2 === 0 ? whiteTimeLimit : blackTimeLimit) : 5;
        const turnLimit = moveLimitChecked ? (playerColor === 2 ? whiteMoveLimit : blackMoveLimit) : 0;
        const packet = {
            turnLimit,
            timeLimit,
            turn,
            state: curState,
            gameType,
            layout: boardInitStateNo
        };
        console.log(packet);
        const dialog = gameType !== "eve" ?
            (autoSwitchTurn ?
                Modal.info({
                    content: <div><Spin />  Waiting AI Move...</div>,
                    centered: true
                }) :
                Modal.confirm({
                    title: 'AI Next Move',
                    content: <div><Spin />  Waiting AI Move...</div>,
                    cancelType: "danger",
                    okText: "Move",
                    cancelText: "Undo",
                    okButtonProps: { disabled: true },
                    cancelButtonProps: { disabled: true },
                    centered: true
                }))
            : null;

        let that = this;

        AbaloneClient.nextMove(packet).then(({ action }) => {
            if (this.state.pause) {
                return;
            }

            const changeInfoArray = getChangeInfoArrayFromAIMove(action, curState, boardArray);

            if (!dialog) {
                that.doAIMove(action, changeInfoArray);
            } else {
                if (autoSwitchTurn) {
                    dialog.destroy();
                    that.doAIMove(action, changeInfoArray);
                } else {
                    that.pauseGame();
                    const history = this.generateMoveAction(changeInfoArray);
                    const { text, marbles, direction } = history;

                    dialog.update({
                        content: (
                            <div>
                                <div style={{ textAlign: "center" }}>{text}</div>
                                <DrawGameBoard
                                    selectedHex={history.marbles}
                                    boardState={history.boardState}
                                    supportLine={generateSupportlineTexts(marbles, boardArray, direction)}
                                />
                            </div>
                        ),
                        onOk() {
                            that.doAIMove(action, changeInfoArray);
                            that.pauseGame();
                            dialog.destroy();
                        },
                        onCancel() {
                            that.undoLastMove();
                            dialog.destroy();
                        },
                        okButtonProps: { disabled: false },
                        cancelButtonProps: { disabled: false }
                    });
                }
            }
        });

    }

    doAIMove = async (action, changeInfoArray) => {
        const { curState } = this.state;
        const nextState = getNextStateByAIAction(curState, action);

        await moveMarbles(changeInfoArray);
        this.updateMoveHistoryBoard(changeInfoArray);
        this.updateBoardState(nextState);
        this.isGameEnd();
    }

    generateMoveAction = (changeInfoArray) => {
        const { whiteTimeLimit, blackTimeLimit } = this.props.gameSettings;
        const { turn, timeLeft, curState } = this.state;

        //update move history
        let marbles = [];

        changeInfoArray.forEach(element => {
            marbles.push([element.originLocation]);
        })

        const timeLimit = turn % 2 === 0 ? whiteTimeLimit : blackTimeLimit

        let action = {
            turn,
            marbles,
            direction: changeInfoArray[0].direction,
            time: timeLimit - timeLeft,
            boardState: curState
        }

        action.text = generateHistoryText(action);
        return action;
    }

    updateMoveHistoryBoard = (changeInfoArray) => {
        this.setState(prevState => ({
            moveHistory: [...prevState.moveHistory, this.generateMoveAction(changeInfoArray)]
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
            turn: prevState.turn + 1,
            changeInfoArray: null
        }));

        this.startTimer();

    }

    isGameEnd = () => {
        const { moveLimitChecked, whiteMoveLimit, blackMoveLimit } = this.props.gameSettings;
        const { turn, curState } = this.state;
        if ((moveLimitChecked && turn > whiteMoveLimit + blackMoveLimit)
            || curState.filter(c => c === 1).length <= 8
            || curState.filter(c => c === 2).length <= 8) {
            this.stopGame();
        } else {
            this.shouldAIMove();
        }
    }

    startGame = () => {
        if (!AbaloneClient.connected && this.state.gameType === "pve") {
            this.setState({ serverConfirmVisible: true });
        } else {
            this.setState({
                start: true,
                timeLeft: this.props.gameSettings.blackTimeLimit
            },
                () => {
                    this.shouldAIMove();
                    this.startTimer();
                });
        }
    }

    pauseGame = () => {
        const { turn, pause, gameType } = this.state;
        const { whiteTimeLimit, blackTimeLimit } = this.props.gameSettings;

        if (pause) {
            this.setState({ pause: false });
            this.startTimer();

            if (gameType === "eve") {
                this.shouldAIMove();
            }
        } else {
            if (gameType === "eve") {
                this.setState({
                    pause: true,
                    timeLeft: turn % 2 === 1 ? whiteTimeLimit : blackTimeLimit
                });
            } else {
                this.setState({ pause: true });
            }
        }
    }

    leaveGame = () => {
        this.props.stopGame();
    }

    stopGame = () => {
        this.setState({
            pause: true,
            gameResultVisible: true
        });
    }

    resetGame = () => {
        if (this.state.clock) {
            clearInterval(this.state.clock);
        }

        const { timeLimitChecked, boardInitState } = this.props.gameSettings;

        this.setState({
            curState: boardInitState,
            gameResultVisible: false,
            turn: 1,
            progress: 100,
            pause: false,
            timeLeft: 0,
            selectedHex: [],
            moveHistory: []
        });

        if (!timeLimitChecked) {
            this.setState({ start: true });
        } else {
            this.setState({ start: false });
        }

    }

    undoLastMove = () => {
        if (!this.state.lastState.length) {
            return;
        }

        const { whiteTimeLimit, blackTimeLimit } = this.props.gameSettings;
        let copyMoveHistory = [...this.state.moveHistory];
        copyMoveHistory.pop();

        this.setState(prevState => ({
            lastState: [],
            curState: prevState.lastState,
            timeLeft: prevState.turn % 2 === 1 ? whiteTimeLimit : blackTimeLimit,
            progress: 100,
            pause: true,
            selectedHex: [],
            turn: prevState.turn - 1,
            moveHistory: copyMoveHistory
        }),
            () => this.shouldAIMove()
        );
    }

    startTimer = () => {
        const { timeLimitChecked, whiteTimeLimit, blackTimeLimit } = this.props.gameSettings;

        if (!timeLimitChecked) {
            return;
        }

        if (this.state.clock) {
            clearInterval(this.state.clock);
        }

        const period = 10;

        let clock = setInterval(() => {
            const { pause, timeLeft, turn } = this.state;

            if (pause) {
                clearInterval(clock);
            } else {
                if (timeLeft > 0) {
                    let tempTime = timeLeft - 1 / period;
                    let timeLimit = turn % 2 === 0 ? whiteTimeLimit : blackTimeLimit;

                    this.setState({
                        timeLeft: tempTime,
                        progress: (tempTime / timeLimit) * 100
                    })
                } else {
                    clearInterval(clock);
                }
            }
        }, 1000 / period);

        this.setState({ clock });
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
        this.setState({ serverConfirmVisible: false });
    }

    closeResultWindow = () => {
        this.setState({
            gameResultVisible: false
        });
    }

    viewHistory = (e) => {

        if (!this.state.moveHistory.length) {
            message.warning('No history!');
        } else {
            this.setState({
                historyVisible: true,
                pause: true
            });
        }
    }

    closeHistory = () => {
        this.setState({
            historyVisible: false,
        });
    };

    timeTravel = (moveHistory, selectedHistory) => {
        const { whiteTimeLimit, blackTimeLimit } = this.props.gameSettings;
        const { gameType, playerColor } = this.state;
        let pause = isPlayerMove(gameType, selectedHistory.turn, playerColor)? true: false;
        this.setState({
            moveHistory,
            curState: selectedHistory.boardState,
            turn: selectedHistory.turn, 
            progress: 100,
            timeLeft: selectedHistory.turn % 2 === 1 ? blackTimeLimit : whiteTimeLimit,
            historyVisible: false,
            selectedHex: [],
            start: true,
            pause
        },
        () =>  {
            if(!pause){
                this.startTimer();
                this.shouldAIMove();
            }
        })
    }

    testMove = async () => {
        const { curState, turn } = this.state;
        console.log(curState.toString());
        let action = await AbaloneAI.MinMaxDecision(curState, turn, 4);
        let selected = [];
        action.selectedMarbles.forEach(e=> {selected.push(e.toString())});
        let changeInfoArray = isLegalMove(selected, action.direction, boardArray, curState);
        this.makeMove(changeInfoArray);
        
    }

    GodMode = () => {
        this.setState({
            godModeVisible:true,
            pause: true
        })
    }

    closeGodMode = () => {
        this.setState({
            godModeVisible:false
        })
    }

    cheatGame = (gameInfo) => {
        const { whiteTimeLimit, blackTimeLimit } = this.props.gameSettings;
        const { gameType, playerColor } = this.state;

        let pause = isPlayerMove(gameType, gameInfo.turn, playerColor)? true: false;
        this.setState({
            curState: gameInfo.boardState,
            turn: gameInfo.turn,
            godModeVisible: false,
            progress: 100,
            timeLeft: gameInfo.turn % 2 === 1 ? blackTimeLimit : whiteTimeLimit,
            selectedHex: [],
            start: true,
            pause
        },
        () => {
            if(!pause){
                this.startTimer();
                this.shouldAIMove();
            }
        })

    }

    render() {
        const { turn, start, pause, curState, selectedHex, supportLine, progress, serverConfirmVisible, gameResultVisible, godModeVisible } = this.state;
        const { timeLimitChecked, moveLimitChecked, whiteMoveLimit, blackMoveLimit } = this.props.gameSettings;

        const startIcon = start ? (pause ? "step-forward" : "pause-circle") : "caret-right";
        const startText = start ? (pause ? "Resume" : "Pause") : "Start";
        const startClickFunction = start ? this.pauseGame : this.startGame;
        const resultTitleStyle = { fontSize: 20, color: "#f57c00", fontWeight: "bold", fontFamily: `"Comic Sans MS", cursive, sans-serif` };

        return (
            <div>        
                <Row>
                    <Col span={11} offset={1}>
                        <div style={{ margin: 30 }}>
                            <Row gutter={4}>
                                {timeLimitChecked ?
                                    <Col span={5} offset={1}>
                                        <Button type="primary" size="large" icon={startIcon} onClick={startClickFunction} block>
                                            {startText}
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
                                boardState={curState}
                                selectedHex={selectedHex}
                                supportLine={supportLine}
                                mouseOverHex={this.mouseOverHex}
                                mouseOutHex={this.mouseOutHex}
                                clickHex={this.clickHex}
                                clickMarble={this.clickMarble}
                            />
                        </div>

                        {timeLimitChecked ?
                            <div style={{ margin: 20 }}>
                                <Progress showInfo={false} strokeWidth={20} strokeColor="square" strokeLinecap="round" percent={progress} />
                            </div> : null}

                    </Col>
                    <Col span={10} offset={1}>
                        <GameInfoBoard gameInfo={this.state} closeHistory={this.closeHistory} timeTravel={this.timeTravel} />
                        <Button 
                            style={{ float: "right", marginTop: 50 }} 
                            type="dashed" 
                            onClick={this.viewHistory} 
                            onContextMenu={this.GodMode} 
                            ghost>
                            View Entire History
                        </Button>                        
                        {/* <Button style={{ float: "right", marginTop: 50 }} type="dashed" onClick={this.testMove}>
                            Test Move
                        </Button> */}                         
                    </Col>
                </Row>

                <Modal
                    title="Server Disconnected"
                    visible={serverConfirmVisible}
                    onOk={this.connectServer}
                    onCancel={this.closeServerConfirmBox}
                    okText="Reconnect"
                    cancelText="Cancel"
                >
                    Server disconnected. Do you want to re-connect?
                </Modal>

                <Modal
                    title={<div style={resultTitleStyle}>Game Result </div>}
                    visible={gameResultVisible}
                    maskClosable={false}
                    closable={false}
                    width={1200}
                    bodyStyle={{ backgroundImage: `url(${resultBk})` }}
                    centered
                    footer={[
                        <div key="buttons" >
                            <Row gutter={24} >                                
                                <Col span={6} offset={2}>
                                    <Button type="primary" onClick={this.closeResultWindow} block>Continue</Button>
                                </Col> 
                                <Col span={6} offset={1}>
                                    <Button onClick={this.resetGame} block>Play another game</Button>
                                </Col>
                                <Col span={6} offset={1}>
                                    <Button type="danger" onClick={this.leaveGame} block>Leave game</Button>
                                </Col>
                            </Row>
                        </div>
                    ]}
                >
                    <GameResult gameInfo={this.state} />
                </Modal>

                <Modal
                    title="God Mode"
                    visible={godModeVisible}
                    width={1200}
                    bodyStyle={{backgroundImage: `url(${historyBk})`, backgroundRepeat: 'no-repeat', backgroundSize: 'cover', minHeight: "90%"}}
                    onCancel={this.closeGodMode}
                    footer={null}
                    destroyOnClose={true}
                    centered                    
                >
                    <GodMode gameInfo={this.state} updateGame={this.cheatGame} />
                </Modal>

            </div>
        )
    }
}

