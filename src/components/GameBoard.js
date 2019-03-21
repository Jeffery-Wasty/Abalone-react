import React, { Component } from 'react';
import {
    isLegalGroup, generateBoardCoordArray, getHexCornerCoordinate,
    moveMarbles, getSelectedElements, getMoveDirection
} from './Util';
import { destTable } from './DestTable';
// import AbaloneClient from '../utils/AbaloneClient';
import { Button, Col, Progress, Row } from 'antd';
import GameInfoBoard from './GameInfoBoard';

const start_point = { x: 80, y: 45 };
const hexSize = 10

export default class GameBoard extends Component {

    constructor(props) {
        super(props);
        this.state = {
            selectedHex: [],
            supportLine: "",
            supportLineVisible: false,
            curState: [],
            lastState:[],
            stateOption: 1,
            progress: 100,
            timeLeft: 0,
            pause: false,
            start: false,
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
    }

    clickMarble = (e) => {
        //black move in odd turn, white move in even turn
        if ((this.state.turn % 2 === 0 && e.target.getAttribute('color') === '2') ||
            (this.state.turn % 2 === 1 && e.target.getAttribute('color') === '1')) {
            return;
        }

        if (this.props.gameSettings.gameType === "pve" && this.props.gameSettings.playerColor !== parseInt(e.target.getAttribute('color'))) {
            return;
        }

        //location already selected, deselect
        const selected = this.locationSelected(e.target.getAttribute('location'));
        if (selected) {
            this.setState({ selectedHex: [] });
        } else {

            if (this.state.supportLineVisible) {
                //TODO: only move when there is supportline
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

    clickHex = async (e) => {
        if (this.state.supportLineVisible) {
            //calculate direction
            const oldLocation = this.state.selectedHex[0];
            const newLocation = e.target.getAttribute('location');
            const moveDirection = getMoveDirection(oldLocation, newLocation);

            if (moveDirection === -1) {
                return;
            }

            //save all moving info of selected marbles to an array
            const changeInfoArray = getSelectedElements(this.state.selectedHex);

            changeInfoArray.forEach((marble, index) => {
                const destLocation = destTable[marble.location][moveDirection];
                changeInfoArray[index].originLocation = marble.location;
                changeInfoArray[index].destLocation = destLocation;
                changeInfoArray[index].start = this.state.boardArray[marble.location];
                changeInfoArray[index].end = this.state.boardArray[destLocation];
            })

            this.setState({ selectedHex: [] });

            //move all selected marbles
            await moveMarbles(changeInfoArray);

            this.updateBoardState(changeInfoArray);

        }
    }

    updateBoardState = (changeInfoArray) => {
        let boardState = [...this.state.curState];
        let oldState = [...this.state.curState];
        
        console.log("top", this.state.curState, oldState);
        changeInfoArray.forEach(c => {
            const oldLocation = c.originLocation;
            const newLocation = c.destLocation;
            boardState[newLocation] = oldState[oldLocation];

            let override = changeInfoArray.find(c => {
                return c.destLocation === parseInt(oldLocation)
            })

            if (!override) {
                boardState[oldLocation] = 0;
            }
        })

        changeInfoArray.forEach(({ element, start }) => {
            element.setAttribute('cx', start.x);
            element.setAttribute('cy', start.y);
        })

        if (this.state.clock) {
            clearInterval(this.state.clock);
        }

        this.setState(prevState => ({
            lastState: oldState,
            curState: boardState,
            timeLeft: this.props.gameSettings.timeLimit,
            progress: 100,
            pause: false,
            turn: prevState.turn + 1
        }));

        this.startTimer();

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

    mouseOverHex = (e) => {
        if (!this.state.selectedHex.length) {
            return;
        }

        const start = this.state.boardArray[this.state.selectedHex[0]];
        const end = this.state.boardArray[e.target.getAttribute('location')];

        this.showSupportLine(start, end, true);

    }

    mouseOutHex = (e) => {
        this.hideSupportLine();
    }

    showSupportLine = (start, end, visible) => {
        const points = `${start.x},${start.y} ${end.x},${end.y}`;

        this.setState({
            supportLine: points,
            supportLineVisible: visible
        })
    }

    hideSupportLine = () => {
        this.setState({
            supportLine: "",
            supportLineVisible: false
        })
    }

    startGame = () => {        
        this.setState({
            start: true,
            timeLeft: this.props.gameSettings.timeLimit
        })

        this.startTimer();
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
            start: false
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

    render() {

        return (
            <div>                
                <Row>
                    <Col span={11} offset={1}>   
                        <div style={{ margin: 30 }}>
                            <Row gutter={4}>                            
                                <Col span={4}>
                                    {this.state.start? <Button type="primary" size="large" icon="start" onClick={this.startGame} block disabled> Start </Button> :
                                    <Button type="primary" size="large" icon="start" onClick={this.startGame} block> Start </Button>}
                                </Col>
                                <Col span={4}>
                                    <Button type="primary" size="large" icon={this.state.pause? "caret-right" : "pause-circle"} onClick={this.pauseGame} block>
                                        {this.state.pause? "Resume" : "Pause"}
                                    </Button>
                                </Col>
                                <Col span={4}>
                                    <Button type="danger" size="large" icon="stop" onClick={this.stopGame} block> Stop </Button>
                                </Col>
                                <Col span={4}>
                                    <Button size="large" icon="rollback" onClick={this.resetGame} block> Reset </Button>
                                </Col>
                                <Col span={4}>
                                    <Button type="dashed" icon="backward" size="large" onClick={this.undoLastMove} block> Undo </Button>
                                </Col>
                            </Row>
                        </div>       
                        <div>
                            <svg id="test-polygon" viewBox="0 0 240 200">
                                <defs>
                                    <marker id="arrow" viewBox="0 0 10 10" refX="5" refY="5"
                                        markerWidth="3" markerHeight="3"
                                        orient="auto-start-reverse">
                                        <path d="M 0 0 L 10 5 L 0 10 z" fill="#fff176" />
                                    </marker>
                                </defs>

                                <defs>
                                    <pattern id="img1" patternUnits="userSpaceOnUse" width="100%" height="650">
                                        <image xlinkHref="https://www.primary-school-resources.com/wp-content/uploads/2014/11/Wooden-Background-vertical.jpg" x="-30" y="-30"
                                            width="400" height="280" />
                                    </pattern>

                                </defs>

                                <defs>
                                    <radialGradient id="rgradwhite" cx="50%" cy="50%" r="75%" >
                                        <stop offset="0%" style={{ stopColor: "rgb(255,255,255)", stopOpacity: "1" }} />
                                        <stop offset="50%" style={{ stopColor: "rgb(255,255,255)", stopOpacity: "1" }} />
                                        <stop offset="100%" style={{ stopColor: "rgb(0,0,0)", stopOpacity: "1" }} />
                                    </radialGradient>

                                    <radialGradient id="rgradblack" cx="50%" cy="50%" r="75%" >
                                        <stop offset="0%" style={{ stopColor: "rgb(0,0,0)", stopOpacity: "1" }} />
                                        <stop offset="50%" style={{ stopColor: "rgb(0,0,0)", stopOpacity: "1" }} />
                                        <stop offset="100%" style={{ stopColor: "rgb(255,255,255)", stopOpacity: "1" }} />
                                    </radialGradient>
                                </defs>

                                <rect x="0" y="0" width="350" height="320" stroke="#c2c2c2" fill="url(#img1)" />

                                {this.state.boardArray.map((center, key) =>
                                    <polygon
                                        key={key}
                                        location={key}
                                        cx={center.x}
                                        cy={center.y}
                                        points={getHexCornerCoordinate(center, hexSize)}
                                        fill={this.locationSelected(key) ? '#d50000' : '#fa5'}
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
                                            location={key}
                                            color={this.state.curState[key]}
                                            cx={center.x}
                                            cy={center.y}
                                            r="7"
                                            fill={(this.state.curState[key] === 1) ? "url(#rgradwhite)" : "url(#rgradblack)"}
                                        />
                                        : null
                                )}

                                <polyline
                                    style={{ visibility: this.state.supportLineVisible }}
                                    points={this.state.supportLine}
                                    stroke="#fff176"
                                    strokeWidth="2"
                                    strokeDasharray="3,3"
                                    markerEnd="url(#arrow)"
                                />
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
            </div>
        )
    }
}

