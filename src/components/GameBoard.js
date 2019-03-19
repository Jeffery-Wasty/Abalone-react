import React, { Component } from 'react';
import { getInitialState } from './InitState';
import { isLegalGroup, generateBoardCoordArray, getHexCornerCoordinate, moveMarbles, getSelectedElements, getMoveDirection } from './Util';

export default class GameBoard extends Component {

    constructor(props) {
        super(props);
        this.state = {
            hexSize: 15,
            start_point: { x: 90, y: 50 },
            selectedHex: [],
            supportLine: "",
            supportLineVisible: false,
            curState: [],
            stateOption: 1,
        }

    }

    componentWillMount() {             
        this.setState({
            boardArray: generateBoardCoordArray(this.state.start_point, this.state.hexSize)
        })
    }

    clickMarble = (e) => {
        //location already selected, deselect
        const selected = this.locationSelected(e.target.getAttribute('location'));
        if (selected) {
            this.setState({ selectedHex: [] });
        } else {
            if(this.state.supportLineVisible) {
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
        if(this.state.supportLineVisible) {
            
            const oldLocation = this.state.selectedHex[0];
            const newLocation = e.target.getAttribute('location');            
            const moveDirection = getMoveDirection(oldLocation, newLocation);
            const selectedMarbles = getSelectedElements(this.state.selectedHex);

            this.setState({ selectedHex: [] });
            await moveMarbles(selectedMarbles, moveDirection, this.state.boardArray);
            //this.updateBoardState(oldLocation, newLocation);

        }
    }

    updateBoardState = (oldLocation, newLocation) => {
        let boardState = this.state.curState.length ? this.state.curState : getInitialState(this.state.stateOption);
        boardState[newLocation] = boardState[oldLocation];
        boardState[oldLocation] = 0;
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
            <div style={{ marginTop: 100, marginLeft: 300 }}>
                <svg id="test-polygon" viewBox="0 0 800 600">
                    <defs>
                        <marker id="arrow" viewBox="0 0 10 10" refX="5" refY="5"
                            markerWidth="3" markerHeight="3"
                            orient="auto-start-reverse">
                            <path d="M 0 0 L 10 5 L 0 10 z" fill="#fff176" />
                        </marker>
                    </defs>

                    <rect x="0" y="0" width="280" height="280" stroke="#c2c2c2" fill="#f5f5f5"/>
                    
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
                            onClick = {this.clickHex}
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
                                r="11"
                                fill={(boardState[key] === 1) ? '#eeeeee' : '#263238'}
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

