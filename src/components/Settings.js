import React, { Component } from 'react';
import { Button, InputNumber, Radio } from 'antd';

export default class Settings extends Component {

    state = {
        gameType: "pvp",
        boardInitState: "1",
        playerColor: "black",
        moveLimit: "40",
        timeLimit: "10",
    }

    handleGameType = (e) => {
        this.setState({ gameType: e.target.value });
    }

    handleInitState = (e) => {
        this.setState({ boardInitState: e.target.value });
    }

    handleColorSelection = (e) => {
        this.setState({ playerColor: e.target.value });
    }

    handleMoveLimit = (e) => {
        this.setState({ moveLimit: e });
    }

    handleTimeLimit = (e) => {
        this.setState({ timeLimit: e });
    }

    startGame = () => {
        this.props.startGame(this.state);
    }

    render() {
        return (
            <div style={{ margin: 20 }}>

                <div style={{ margin: 20 }}>
                    <h3>Board Layout</h3>
                    <Radio.Group value={this.state.initState} onChange={this.handleInitState}>
                        <Radio.Button style={{ width: 130 }} value="1">Standard</Radio.Button>
                        <Radio.Button style={{ width: 130 }} value="2">German Daisy</Radio.Button>
                        <Radio.Button style={{ width: 130 }} value="3">Belgian Daisy</Radio.Button>
                    </Radio.Group>
                </div>

                <div style={{ margin: 20 }}>
                    <h3>Game Type</h3>
                    <Radio.Group value={this.state.gameType} onChange={this.handleGameType}>
                        <Radio.Button style={{ width: 130 }} value="pvp">PVP</Radio.Button>
                        <Radio.Button style={{ width: 130 }} value="pve">PVE</Radio.Button>
                        <Radio.Button style={{ width: 130 }} value="eve" disabled>EVE</Radio.Button>
                    </Radio.Group>
                </div>

                {this.state.gameType === "pve" ?
                    <div style={{ margin: 20 }}>
                        <h3>Player Color Selection</h3>
                        <Radio.Group value={this.state.playerColor} onChange={this.handleColorSelection}>
                            <Radio.Button style={{ width: 130 }} value="white">White</Radio.Button>
                            <Radio.Button style={{ width: 130 }} value="black">Black</Radio.Button>
                        </Radio.Group>
                    </div> : null}


                <div style={{ margin: 20 }}>
                    <h3>Move limit per player per game</h3>

                    <InputNumber min={1} max={100} defaultValue={40} onChange={this.handleMoveLimit} />
                </div>

                <div style={{ margin: 20 }}>
                    <h3>Time limit per move</h3>

                    <InputNumber min={1} max={1000} defaultValue={10} onChange={this.handleTimeLimit} />
                </div>

                <div style={{ margin: 20 }}>
                    <Button type="primary" block onClick={this.startGame}>Good Luck, have fun! </Button>
                </div>

            </div>
        )
    }
}
