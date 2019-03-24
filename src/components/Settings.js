import React, { Component } from 'react';
import { Button, InputNumber, Radio, Col, Row, Switch } from 'antd';
import { getInitialState } from '../utils/InitState';

const defaultTimeLimit = 20;
const defaultMoveLimit = 40;
const radioBtnWidth = 140;

export default class Settings extends Component {

    state = {
        gameType: "pvp",
        boardInitState: 1,
        playerColor: 2,
        whiteMoveLimit: defaultMoveLimit,
        blackMoveLimit: defaultMoveLimit,
        whiteTimeLimit: defaultTimeLimit,
        blackTimeLimit: defaultTimeLimit,
        timeLimitChecked: true,
        moveLimitChecked: true
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

    handleMoveLimitWhite = (e) => {
        this.setState({ whiteMoveLimit: e });
    }

    handleMoveLimitBlack = (e) => {
        this.setState({ blackMoveLimit: e });
    }

    handleMoveLimitSwitch = (checked) => {
        if (!checked) {
            this.setState({
                whiteMoveLimit: null,
                blackMoveLimit: null,
                moveLimitChecked: false
            })
        } else {
            this.setState({
                whiteMoveLimit: defaultMoveLimit,
                blackMoveLimit: defaultMoveLimit,
                moveLimitChecked: true
            })
        }
    }

    handleTimeLimitWhite = (e) => {
        this.setState({ whiteTimeLimit: e });
    }

    handleTimeLimitBlack = (e) => {
        this.setState({ blackTimeLimit: e });
    }

    handleTimeLimitSwitch = (checked) => {
        if (!checked) {
            this.setState({
                whiteTimeLimit: null,
                blackTimeLimit: null,
                timeLimitChecked: false
            })
        } else {
            this.setState({
                whiteTimeLimit: defaultTimeLimit,
                blackTimeLimit: defaultTimeLimit,
                timeLimitChecked: true
            })
        }
    }

    startGame = () => {
        let gameSettings = { ...this.state };
        gameSettings.boardInitState = getInitialState(this.state.boardInitState);

        this.props.startGame(gameSettings);
    }

    render() {
        return (
            <div className="Custom-font Margin15">

                <div className="SettingDiv" >
                    <h3>Board Layout</h3>
                    <Radio.Group value={this.state.boardInitState} onChange={this.handleInitState}>
                        <Radio.Button style={{ width: radioBtnWidth }} value={1}>Standard</Radio.Button>
                        <Radio.Button style={{ width: radioBtnWidth }} value={2}>German Daisy</Radio.Button>
                        <Radio.Button style={{ width: radioBtnWidth }} value={3}>Belgian Daisy</Radio.Button>
                    </Radio.Group>
                </div>

                <div className="SettingDiv">
                    <h3>Game Type</h3>
                    <Radio.Group value={this.state.gameType} onChange={this.handleGameType}>
                        <Radio.Button style={{ width: radioBtnWidth }} value="pvp">Player vs Player</Radio.Button>
                        <Radio.Button style={{ width: radioBtnWidth }} value="pve">Player vs AI</Radio.Button>
                        <Radio.Button style={{ width: radioBtnWidth }} value="eve" disabled>AI vs AI</Radio.Button>
                    </Radio.Group>
                </div>

                {this.state.gameType === "pve" ?
                    <div className="SettingDiv">
                        <h3>Player Color Selection</h3>
                        <Radio.Group value={this.state.playerColor} onChange={this.handleColorSelection}>
                            <Radio.Button style={{ width: radioBtnWidth }} value={1}>White</Radio.Button>
                            <Radio.Button style={{ width: radioBtnWidth }} value={2}>Black</Radio.Button>
                        </Radio.Group>
                    </div> : null}

                <Row>
                    <Col span={8}>
                        <div className="SettingDiv">
                            <h3>Time limit </h3>
                            <Switch style={{marginLeft: '5%', width: 50}} defaultChecked onChange={this.handleTimeLimitSwitch} />
                        </div>
                    </Col>

                    {this.state.timeLimitChecked ?
                        <Col span={8} >
                            <div className="SettingDiv">
                                <h3>White</h3>
                                <InputNumber min={1} max={1000} size="small" defaultValue={defaultTimeLimit} onChange={this.handleTimeLimitWhite}
                                    formatter={value => `${value}s`} parser={value => value.replace('s', '')} />
                            </div>
                        </Col> : null}

                    {this.state.timeLimitChecked ?
                        <Col span={8} >
                            <div className="SettingDiv">
                                <h3>Black</h3>
                                <InputNumber min={1} max={1000} size="small" defaultValue={defaultTimeLimit} onChange={this.handleTimeLimitBlack}
                                    formatter={value => `${value}s`} parser={value => value.replace('s', '')} />
                            </div>
                        </Col> : null}
                </Row>

                <Row>
                    <Col span={8}>
                        <div className="SettingDiv">
                            <h3>Move limit</h3>
                            <Switch style={{marginLeft: '5%', width: 50}} defaultChecked onChange={this.handleMoveLimitSwitch} />
                        </div>
                    </Col>

                    {this.state.moveLimitChecked? 
                        <Col span={8} >
                            <div className="SettingDiv">
                                <h3>White</h3>
                                <InputNumber min={1} max={1000} size="small" defaultValue={defaultMoveLimit} onChange={this.handleMoveLimitWhite} />
                            </div>
                        </Col> : null}
                    
                    {this.state.moveLimitChecked?
                        <Col span={8} >
                            <div className="SettingDiv">
                                <h3>Black</h3>
                                <InputNumber min={1} max={1000} size="small" defaultValue={defaultMoveLimit} onChange={this.handleMoveLimitBlack} />
                            </div>
                        </Col> : null}
                </Row>



                <div className="SettingDiv">
                    <Button type="primary" block onClick={this.startGame}>Good Luck, have fun! </Button>
                </div>

            </div>
        )
    }
}
