import React, { Component } from 'react';
import { Row, Col, InputNumber, Input, Button } from 'antd';
import { getHexCornerCoordinate, getBaseBoardCornerCoordinate, generateBoardCoordArray } from '../utils/UtilFunctions';

const start_point = { x: 75, y: 25 };
const circleRadius = 9;
const hexSize = 12;
const boardArray = generateBoardCoordArray(start_point, hexSize);

export default class GodMode extends Component {


    componentWillMount = () => {
        this.setState({
            boardState: this.props.gameInfo.curState,
            turn: this.props.gameInfo.turn        
        })
    }

    handleClickHex = (e) => {
        const { boardState } = this.state;
        let tempState = [...boardState];
        const location = e.target.getAttribute("location");
        tempState[location] = 1;
        this.setState({
            boardState: tempState
        })
    }

    handleClickMarble = (e) => {
        const { boardState } = this.state;
        let tempState = [...boardState];
        const location = e.target.getAttribute("location");

        console.log(location, boardArray[location]);
        if (boardState[location] === 1) {
            tempState[location] = 2;
        } else if (boardState[location] === 2) {
            tempState[location] = 0;
        }
        this.setState({
            boardState: tempState
        })
    }

    changeTurn = (e) => {
        console.log(e)
        this.setState({
            turn: e
        })
    }

    updateGame = () => {
        this.props.updateGame(this.state);
    }

    render() {
        const { boardState } = this.state;

        return (
            <div>
                <Row>
                    <Col span={8}>
                        <div style={{margin:30}}>
                            <h3>Turn:</h3> 
                            <InputNumber min={1} value={this.state.turn}onChange={this.changeTurn}/>
                        </div>
                        <div style={{margin:30}}>
                            <h3>State Representation: </h3>
                            <Input.TextArea value={this.state.boardState} rows={3} />
                        </div>
                        <div style={{margin:30}}>
                            <Button type="primary" onClick={this.updateGame} >God Hand</Button>
                        </div>
                        
                    </Col>
                    <Col span={16}>

                        <svg id="test-polygon" viewBox="0 0 240 200" style={{ transform: 'perspective(1000px) rotateX(5deg)' }}>

                            <defs>
                                <radialGradient id="rgradwhite" gradientUnits="objectBoundingBox" fx="30%" fy="30%" >
                                    <stop offset="0%" style={{ stopColor: "rgb(255,255,255)" }} />
                                    <stop offset="85%" style={{ stopColor: "#fafafa" }} />
                                    <stop offset="100%" style={{ stopColor: "rgb(0,0,0)", }} />
                                </radialGradient>

                                <radialGradient id="rgradblack" gradientUnits="objectBoundingBox" fx="30%" fy="30%" >
                                    <stop offset="0%" style={{ stopColor: "#FFF", stopOpacity: "0.5" }} />
                                    <stop offset="40%" style={{ stopColor: "#000)" }} />
                                    <stop offset="80%" style={{ stopColor: "#000)" }} />
                                    <stop offset="100%" style={{ stopColor: "#212121" }} />
                                </radialGradient>
                            </defs>

                            <polygon
                                location={-1}
                                cx={boardArray[30].x}
                                cy={boardArray[30].y}
                                points={getBaseBoardCornerCoordinate(boardArray[30], hexSize)}
                                fill='#bb4d00'
                                stroke="#000"
                                strokeWidth="1%"
                            />

                            {boardArray.map((center, key) =>
                                <polygon
                                    key={key}
                                    location={key}
                                    cx={center.x}
                                    cy={center.y}
                                    fill='#f57c00'
                                    onClick={this.handleClickHex}
                                    points={getHexCornerCoordinate(center, hexSize)}
                                    stroke="#000"
                                />
                            )}

                            {boardArray.map((center, key) =>
                                boardState[key] !== 0 ?
                                    <circle
                                        key={key}
                                        location={key}
                                        color={boardState[key]}
                                        cx={center.x}
                                        cy={center.y}
                                        r={circleRadius}
                                        fill={(boardState[key] === 1) ? "url(#rgradwhite)" : "url(#rgradblack)"}
                                        onClick={this.handleClickMarble}
                                    />
                                    : null
                            )}

                        </svg>
                    </Col>
                </Row>

            </div>
        )
    }
}
