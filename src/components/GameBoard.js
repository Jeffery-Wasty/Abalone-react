import React, { Component } from 'react';
import { getInitialState } from './InitState';
import {
    isLegalGroup, generateBoardCoordArray, getHexCornerCoordinate,
    moveMarbles, getSelectedElements, getMoveDirection
} from './Util';
import { destTable } from './DestTable';
import AbaloneClient from '../utils/AbaloneClient';

export default class GameBoard extends Component {

    constructor(props) {
        super(props);
        this.state = {
            hexSize: 10,
            start_point: { x: 80, y: 45 },
            selectedHex: [],
            supportLine: "",
            supportLineVisible: false,
            curState: [],
            stateOption: 1
        }

    }

    componentWillMount() {
        this.setState({
            boardArray: generateBoardCoordArray(this.state.start_point, this.state.hexSize)
        })
    }

    componentDidMount = () => {
        this.listenerId = AbaloneClient.addHandler('game-state', (res) => {
            const state = JSON.parse(res.state);
            this.setState({ curState: state });
        });
    }

    componentWillUnmount = () => {
        AbaloneClient.removeHandler('game-state', this.listenerId);
    }

    clickMarble = (e) => {
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
        let boardState = this.state.curState.length ? this.state.curState : getInitialState(this.state.stateOption);
        let oldState = boardState;
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

        this.setState({
            curState: boardState
        })

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

    render() {
        const boardState = this.state.curState.length ? this.state.curState : getInitialState(this.state.stateOption);

        return (
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
                            points={getHexCornerCoordinate(center, this.state.hexSize)}
                            fill={this.locationSelected(key) ? '#d50000' : '#fa5'}
                            stroke="#000"
                            onMouseOver={this.mouseOverHex}
                            onMouseOut={this.mouseOutHex}
                            onClick={this.clickHex}
                        />
                    )}

                    {this.state.boardArray.map((center, key) =>
                        boardState[key] !== 0 ?
                            <circle
                                key={key}
                                onClick={this.clickMarble}
                                location={key}
                                cx={center.x}
                                cy={center.y}
                                r="7"
                                fill={(boardState[key] === 1) ? "url(#rgradwhite)" : "url(#rgradblack)"}
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
        )
    }
}

