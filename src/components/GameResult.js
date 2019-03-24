import React, { Component } from 'react';
import { Card, Col, Row, Statistic } from 'antd';

const gridStyle = {
    width: '50%',
    textAlign: 'center',
};

export default class GameResult extends Component {

    getPlayerName = (player) => {
        const { gameType, playerColor } = this.props.gameInfo;
        let title;
        if (gameType === "pvp") {
            title = player === 1 ? "White" : "Black";
        } else if (gameType === "pve" && playerColor === 1) {
            title =  player === 1 ? "White (Player)" : "Black (AI)";
        } else if (gameType === "pve" && playerColor === 2) {
            title =  player === 1 ? "White (AI)" : "Black (Player)";
        } else {
            title =  player === 1 ? "White (AI)" : "Black (AI)";
        }

        if(player === this.getWinner()){
            title += " - WINNER!!!"
        }

        return title;
    }

    getWinner = () => {
        const { curState } = this.props.gameInfo;
        const whiteMarbleNum = curState.filter(color => color === 1).length;
        const blackMarbleNum = curState.filter(color => color === 2).length;
        if(whiteMarbleNum - blackMarbleNum === 0){
            const diff = this.prepareSummary(2).totalTimeTaken - this.prepareSummary(1).totalTimeTaken;
            if(diff === 0){
                return 0;
            } else {
                return diff > 0 ? 1 : 2;
            }
        } else {
            return whiteMarbleNum - blackMarbleNum > 0 ? 1 : 2;
        }
    }

    prepareSummary = (player) => {
        const { moveHistory, curState } = this.props.gameInfo;
        const playerHistory = moveHistory.filter(history => history.turn % 2 === (player - 1));

        const totalMoves = playerHistory.length? playerHistory.length : 0;        
        const totalTimeTaken = playerHistory.length && playerHistory[0].time? 
                Math.round(playerHistory.reduce((sum, action) => sum + action.time, 0) * 100) / 100 : 0;
        const avgTime = totalTimeTaken? Math.round(totalTimeTaken / totalMoves * 100) / 100 : 0;
        const score = 14 - curState.filter(color => color === (3 - player)).length;

        return { totalMoves, totalTimeTaken, score, avgTime };
    }

    render() {
        const resultWhite = this.prepareSummary(1);
        const resultBlack = this.prepareSummary(2);
        return (
            <div>
                <Row>
                    <Col span={9} offset={2}>
                        <Card title={this.getPlayerName(2)} headStyle={{ textAlign: 'center' }}>
                            <Card.Grid style={gridStyle}>
                                <Statistic title="Score" value={resultBlack.score} />
                            </Card.Grid>
                            <Card.Grid style={gridStyle}>
                                <Statistic title="Time Taken" value={resultBlack.totalTimeTaken} suffix="s" />
                            </Card.Grid>
                            <Card.Grid style={gridStyle}>
                                <Statistic title="Total Moves" value={resultBlack.totalMoves} />
                            </Card.Grid>
                            <Card.Grid style={gridStyle}>
                                <Statistic title="Average Time" value={resultBlack.avgTime} suffix="s"/>
                            </Card.Grid>
                        </Card>
                    </Col>

                    <Col span={9} offset={2}>
                        <Card title={this.getPlayerName(1)} headStyle={{ textAlign: 'center' }} >
                            <Card.Grid style={gridStyle}>
                                <Statistic title="Score" value={resultWhite.score} />
                            </Card.Grid>
                            <Card.Grid style={gridStyle}>
                                <Statistic title="Time Taken" value={resultWhite.totalTimeTaken} suffix="s" />
                            </Card.Grid>
                            <Card.Grid style={gridStyle}>
                                <Statistic title="Total Moves" value={resultWhite.totalMoves} />
                            </Card.Grid>
                            <Card.Grid style={gridStyle}>
                                <Statistic title="Average Time" value={resultWhite.avgTime} suffix="s"/>
                            </Card.Grid>
                        </Card>
                    </Col>
                </Row>
            </div>
        )
    }
}
