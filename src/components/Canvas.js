import React, { Component } from 'react'

export default class Canvas extends Component {

    constructor(props) {
        super(props);
        this.state = {
            hexSize: 20
        }
    }

    componentWillMount() {
        this.setState({
            canvasSize: { canvasWidth: '800', canvasHeight: '600' }
        })
    }

    componentDidMount() {
        const { canvasWidth, canvasHeight } = this.state.canvasSize;
        this.canvasHex.width = canvasWidth;
        this.canvasHex.height = canvasHeight;
        this.drawHex({x: 50, y: 50}, this.canvasHex);
        this.drawHex({x: 85, y: 50}, this.canvasHex);
    }

    getHexCornerCoordinate = (center, index) => {
        const angle_deg = 60 * index + 30;
        const angle_rad = Math.PI / 180 * angle_deg;
        const x = center.x + this.state.hexSize * Math.cos(angle_rad);
        const y = center.y + this.state.hexSize * Math.sin(angle_rad);
        console.log("x", this.state.hexSize * Math.cos(angle_rad));
        console.log("y", this.state.hexSize * Math.sin(angle_rad));
        return this.Point(x, y);
    }

    Point = (x, y) => {
        return { x: x, y: y }
    }

    drawLine = (start, end, canvasID) => {
        const ctx = canvasID.getContext("2d");
        ctx.beginPath();
        ctx.moveTo(start.x, start.y);
        ctx.lineTo(end.x, end.y);
        ctx.stroke();
        ctx.closePath();
    }

    drawHex = (center, canvasID) => {
        for(let i = 0; i <= 5; ++i){
            const start = this.getHexCornerCoordinate(center, i);
            const end = this.getHexCornerCoordinate(center, i+ 1);
            this.drawLine(start, end, canvasID);
        }
    }

    render() {
        return (
            <div>
                <h1>Abalone Game</h1>
                <canvas ref={canvasHex => this.canvasHex = canvasHex}></canvas>
            </div>
        )
    }
}
