import React, { Component } from 'react';
import { Button, InputNumber, Radio, Col, Row } from 'antd';
import { getInitialState } from '../utils/InitState';

export default class Settings extends Component {

    state = {
        gameType: "pvp",
        boardInitState: 1,
        playerColor: 2,
        moveLimit: 40,
        whiteTimeLimit: 20,
        blackTimeLimit: 20
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

    handleTimeLimitWhite = (e) => {
        this.setState({ whiteTimeLimit: e });
    }

    handleTimeLimitBlack = (e) => {
        this.setState({ blackTimeLimit: e });
    }

    startGame = () => {
        let gameSettings = {...this.state};
        gameSettings.boardInitState = getInitialState(this.state.boardInitState);

        this.props.startGame(gameSettings);
    }

    render() {
        return (
            <div style={{ margin: 20 }}>

                <div style={{ margin: 20 }}>
                    <h3>Board Layout</h3>
                    <Radio.Group value={this.state.boardInitState} onChange={this.handleInitState}>
                        <Radio.Button style={{ width: 130 }} value={1}>Standard</Radio.Button>
                        <Radio.Button style={{ width: 130 }} value={2}>German Daisy</Radio.Button>
                        <Radio.Button style={{ width: 130 }} value={3}>Belgian Daisy</Radio.Button>
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
                            <Radio.Button style={{ width: 130 }} value={1}>White</Radio.Button>
                            <Radio.Button style={{ width: 130 }} value={2}>Black</Radio.Button>
                        </Radio.Group>
                    </div> : null}

                <Row>
                    <Col span={12} >
                        <div style={{ margin: 20 }}>
                            <h3>Time limit (White)</h3>
                            <InputNumber min={1} max={1000} defaultValue={20} onChange={this.handleTimeLimitWhite} />
                        </div>
                    </Col>
                    <Col span={12} >
                        <div style={{ margin: 20 }}>
                            <h3>Time limit (Black)</h3>
                            <InputNumber min={1} max={1000} defaultValue={20} onChange={this.handleTimeLimitBlack} />
                        </div>
                    </Col>
                </Row>

                <div style={{ margin: 20 }}>
                    <h3>Move limit white</h3>

                    <InputNumber min={1} max={100} defaultValue={40} onChange={this.handleMoveLimit} />
                </div>



                <div style={{ margin: 20 }}>
                    <Button type="primary" block onClick={this.startGame}>Good Luck, have fun! </Button>
                </div>

            </div>
        )
    }
}
