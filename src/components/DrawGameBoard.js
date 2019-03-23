import React, { Component } from 'react';
import { getHexCornerCoordinate, getBaseBoardCornerCoordinate, generateBoardCoordArray } from '../utils/UtilFunctions';

export const start_point = { x: 75, y: 25 };
export const circleRadius = 9;
export const hexSize = 12;
export const boardArray = generateBoardCoordArray(start_point, hexSize);

export default class DrawGameBoard extends Component {
    render() {
        return (
            <div>
                <svg id="test-polygon" viewBox="0 0 240 200" style={{ transform: 'perspective(1000px) rotateX(5deg)' }}>
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
                    />

                    {boardArray.map((center, key) =>
                        <polygon
                            key={key}
                            location={key}
                            cx={center.x}
                            cy={center.y}
                            points={getHexCornerCoordinate(center, hexSize)}
                            fill={this.props.locationSelected(key) ? '#d50000' : '#f57c00'}
                            stroke="#000"
                            onMouseOver={this.props.mouseOverHex}
                            onMouseOut={this.props.mouseOutHex}
                            onClick={this.props.clickHex}
                        />
                    )}

                    {boardArray.map((center, key) =>
                        this.props.curState[key] !== 0 ?
                            <circle
                                key={key}
                                onClick={this.props.clickMarble}
                                onMouseOver={this.props.mouseOverHex}
                                onMouseOut={this.props.mouseOutHex}
                                location={key}
                                color={this.props.curState[key]}
                                cx={center.x}
                                cy={center.y}
                                r={circleRadius}
                                fill={(this.props.curState[key] === 1) ? "url(#rgradwhite)" : "url(#rgradblack)"}
                            />
                            : null
                    )}

                    {this.props.supportLine.map((supportLine, key) => 
                        <polyline
                            key={key}
                            points={supportLine}
                            stroke="#fff176"
                            strokeWidth="2"
                            strokeDasharray="3,3"
                            markerEnd="url(#arrow)"
                        />
                    )}

                </svg>
            </div>
        )
    }
}
