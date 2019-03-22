import React, { Component } from 'react';
import {
    isLegalGroup, generateBoardCoordArray, getHexCornerCoordinate,
    moveMarbles, getMoveDirection, boardNameArray, getArrowSymbol, isLegalMove,
    getNextStateByAIAction, getNextState, generateSupportlineTexts, 
} from './Util';
import AbaloneClient from '../utils/AbaloneClient';
import { Button, Col, Progress, Row, Modal } from 'antd';
import GameInfoBoard from './GameInfoBoard';

const start_point = { x: 75, y: 25 };
const hexSize = 12;
const circleRadius = 9;

export default class GameBoard extends Component {

    constructor(props) {
        super(props);
        this.state = {
            selectedHex: [],
            supportLine: [],
            curState: [],
            lastState:[],
            stateOption: 1,
            progress: 100,
            timeLeft: 0,
            pause: false,
            start: false,
            whiteMoveHistory:[],
            blackMoveHistory:[],
            serverConfirmVisible: false
        }

    }

    componentWillMount() {
        this.setState({
            boardArray: generateBoardCoordArray(start_point, hexSize),
            gameType: this.props.gameSettings.gameType,
            playerColor: this.props.gameSettings.playerColor,
            curState: this.props.boardInitState,
            timeLimit: this.props.gameSettings.timeLimit,
            moveLimit: this.props.gameSettings.moveLimit,
            turn: 1
        })
    }

    componentDidMount = () => {
        // this.listenerId = AbaloneClient.addHandler('game-state', (res) => {
        //     const state = JSON.parse(res.state);
        //     this.setState({ curState: state });
        // });
    }

    componentWillUnmount = () => {
        //AbaloneClient.removeHandler('game-state', this.listenerId);
        if (this.state.clock) {
            clearInterval(this.state.clock);
        }
    }

    clickMarble = (e) => {
        if(!this.state.start){
            return;
        }

        //black move in odd turn, white move in even turn
        if (!this.state.changeInfoArray && this.state.turn % 2 === (2 - parseInt(e.target.getAttribute('color')))){
            return;
        }

        //AI turn
        if (!this.state.changeInfoArray && this.props.gameSettings.gameType === "pve" && this.props.gameSettings.playerColor !== parseInt(e.target.getAttribute('color'))) {
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

        if(moveDirection !== -1) {
            const changeInfoArray = isLegalMove(this.state.selectedHex, moveDirection, this.state.boardArray, this.state.curState);

            if(changeInfoArray) {
                const points = generateSupportlineTexts(this.state.selectedHex, this.state.boardArray, moveDirection);    
                this.showSupportLine(points, changeInfoArray);
            }           
            
        }
    }



    mouseOutHex = (e) => {
        this.hideSupportLine();
    }

    showSupportLine = (points, changeInfoArray) => {

        if(!points.length){
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
        if(!changeInfoArray || !changeInfoArray.length){
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
        if(this.props.gameSettings.gameType === "pve" && (this.state.turn % 2 === (2 - this.state.playerColor))){
            this.makeAIMove();
        }
    }

    updateMoveHistoryBoard = (changeInfoArray) => {
        //update move history
        let action = `Turn ${this.state.turn}: `;            

        changeInfoArray.forEach(element => {
            action += boardNameArray[element.originLocation] + " ";
        })

        action += getArrowSymbol(changeInfoArray[0].direction);
        action += ` - Time: ${Math.round(this.state.timeLimit - this.state.timeLeft)}s`;

        if(this.state.turn % 2 === 0){
            this.setState(prevState => ({
                whiteMoveHistory: [...prevState.whiteMoveHistory, action]          
            }));            
        } else {
            this.setState(prevState => ({
                blackMoveHistory: [...prevState.blackMoveHistory, action]          
            }));            
        }
    }

    updateBoardState = (boardState) => {
        if (this.state.clock) {
            clearInterval(this.state.clock);
        }

        this.setState(prevState => ({
            lastState: prevState.curState,
            curState: boardState,
            timeLeft: this.props.gameSettings.timeLimit,
            progress: 100,
            pause: false,
            turn: prevState.turn + 1            
        }));        

        this.startTimer();
    }

    makeAIMove = () => {
        const { moveLimit, timeLimit } = this.props.gameSettings;
        const packet = {
            turnLimit: moveLimit, // replace hardcoded value with moveLimit
            timeLimit,
            state: this.state.curState,
            turn: this.state.turn
        };
        
        let that = this;
        
        AbaloneClient.nextMove(packet).then(({action}) => {
            const nextState = getNextStateByAIAction(this.state.curState, action);
            that.updateBoardState(nextState);
            console.log(action);
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
        if(!AbaloneClient.connected && this.state.gameType === "pve"){
            this.setState({ serverConfirmVisible: true })
        } else {
            this.setState({
                start: true,
                timeLeft: this.props.gameSettings.timeLimit
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
            timeLeft:0,
            selectedHex:[],
            whiteMoveHistory: [],
            blackMoveHistory: []
        })
    }

    undoLastMove = () => {
        if(!this.state.lastState.length){
            return;
        }

        this.setState(prevState => ({
            lastState: [],
            curState: prevState.lastState,
            timeLeft: this.props.gameSettings.timeLimit,
            progress: 100,
            pause: false,
            turn: prevState.turn - 1
        }));
    }

    startTimer = () => {
        const period = 10;

        let clock = setInterval(() => {
            if (this.state.pause) {
                clearInterval(clock);
            } else {
                if (this.state.timeLeft > 0) {
                    let timeLeft = this.state.timeLeft - 1 / period;
                    let progress = (timeLeft/ this.props.gameSettings.timeLimit) * 100;

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
        await AbaloneClient.connect();
        this.startGame();
    }

    closeServerConfirmBox = () => {
        this.setState({ serverConfirmVisible: false })
    }

    render() {

        const startIcon = this.state.start? (this.state.pause? "step-forward" : "pause-circle") : "caret-right";
        const startClickFunction = this.state.start? this.pauseGame : this.startGame;

        return (
            <div>                
                <Row>
                    <Col span={11} offset={1}>   
                        <div style={{ margin: 30 }}>
                            <Row gutter={4}>       
                                <Col span={5} offset={1}>
                                    <Button type="primary" size="large" icon={startIcon} onClick={startClickFunction} block>
                                        {this.state.start? (this.state.pause? "Resume" : "Pause") : "Start"}
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
                            <svg id="test-polygon" viewBox="0 0 240 200" style={{transform:'perspective(1000px) rotateX(10deg)'}}>
                                <defs>
                                    <marker id="arrow" viewBox="0 0 10 10" refX="5" refY="5"
                                        markerWidth="3" markerHeight="3"
                                        orient="auto-start-reverse">
                                        <path d="M 0 0 L 10 5 L 0 10 z" fill="#ffee58" />
                                    </marker>
                                </defs>

                                {/* <defs>
                                    <pattern id="img1" patternUnits="userSpaceOnUse" width="100%" height="650" >
                                        <image xlinkHref="https://www.primary-school-resources.com/wp-content/uploads/2014/11/Wooden-Background-vertical.jpg" x="-30" y="-30"
                                            width="400" height="280" />
                                    </pattern>
                                </defs> */}

                                <defs>
                                    <radialGradient id="rgradwhite" gradientUnits="objectBoundingBox" fx="30%" fy="30%" >
                                        <stop offset="0%" style={{ stopColor: "rgb(255,255,255)"}} />
                                        <stop offset="85%" style={{ stopColor: "#fafafa"}} />
                                        <stop offset="100%" style={{ stopColor: "rgb(0,0,0)", }} />
                                    </radialGradient>

                                    <radialGradient id="rgradblack" gradientUnits="objectBoundingBox" fx="30%" fy="30%" >
                                        <stop offset="0%" style={{ stopColor: "#FFF", stopOpacity: "0.5" }} />
                                        <stop offset="40%" style={{ stopColor: "#000)"}} />
                                        <stop offset="80%" style={{ stopColor: "#000)"}} />
                                        <stop offset="100%" style={{ stopColor: "#212121"}} />
                                    </radialGradient>
                                </defs>

                                {this.state.boardArray.map((center, key) =>
                                    <polygon
                                        key={key}
                                        location={key}
                                        cx={center.x}
                                        cy={center.y}
                                        points={getHexCornerCoordinate(center, hexSize)}
                                        fill={this.locationSelected(key) ? '#a30000' : '#f57c00'}
                                        stroke="#000"
                                        onMouseOver={this.mouseOverHex}
                                        onMouseOut={this.mouseOutHex}
                                        onClick={this.clickHex}
                                    />
                                )}

                                {this.state.boardArray.map((center, key) =>
                                    this.state.curState[key] !== 0 ?
                                        <circle
                                            key={key}
                                            onClick={this.clickMarble}
                                            onMouseOver={this.mouseOverHex}
                                            onMouseOut={this.mouseOutHex}
                                            location={key}
                                            color={this.state.curState[key]}
                                            cx={center.x}
                                            cy={center.y}
                                            r={circleRadius}
                                            fill={(this.state.curState[key] === 1) ? "url(#rgradwhite)" : "url(#rgradblack)"}
                                        />
                                        : null
                                )}

                                {this.state.supportLine.length ? 
                                    <polyline
                                        points={this.state.supportLine[0]}
                                        stroke="#fff176"
                                        strokeWidth="2"
                                        strokeDasharray="3,3"
                                        markerEnd="url(#arrow)"
                                    /> : null 
                                }

                                {this.state.supportLine.length > 1 ? 
                                    <polyline
                                        points={this.state.supportLine[1]}
                                        stroke="#fff176"
                                        strokeWidth="2"
                                        strokeDasharray="3,3"
                                        markerEnd="url(#arrow)"
                                    /> : null 
                                }

                                {this.state.supportLine.length > 2 ? 
                                    <polyline
                                        points={this.state.supportLine[2]}
                                        stroke="#fff176"
                                        strokeWidth="2"
                                        strokeDasharray="3,3"
                                        markerEnd="url(#arrow)"
                                    /> : null 
                                }

                            </svg>
                        </div>

                        <div style={{ margin: 20 }}>
                            <Progress showInfo={false} strokeWidth={20} strokeColor="square" strokeLinecap="round" percent={this.state.progress} />
                        </div>
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

