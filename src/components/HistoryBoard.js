import React, { Component } from 'react';
import { Row, Col, List, Button } from 'antd';
import DrawGameBoard, { boardArray } from './DrawGameBoard';
import { generateSupportlineTexts } from '../utils/UtilFunctions';

export default class HistoryBoard extends Component {

    state = {
        selectedHistory: null
    }

    loadHistoryBoard = (e) => {

        const { moveHistory } = this.props;
        const history = moveHistory.find(history => history.turn === parseInt(e.target.getAttribute("turn")));

        this.setState({
            selectedHistory: history
        })
    }

    generateSupportLine = () => this.state.selectedHistory ?
        generateSupportlineTexts(this.state.selectedHistory.marbles, boardArray, this.state.selectedHistory.direction) : null;

    render() {
        const { selectedHistory } = this.state;

        return (
            <div>
                <Row gutter={16}>
                    <Col span={8}>
                        <List
                            size="small"
                            header={<div>Move History</div>}
                            pagination={{
                                pageSize: 12,
                            }}
                            bordered
                            dataSource={this.props.moveHistory}
                            renderItem={item => (
                                <List.Item>
                                    <Button turn={item.turn} onClick={this.loadHistoryBoard} block>{item.text}</Button>
                                </List.Item>
                            )}
                        />
                    </Col>
                    <Col span={16}>
                        {selectedHistory ?
                            <DrawGameBoard
                                selectedHex={selectedHistory.marbles}
                                boardState={selectedHistory.boardState}
                                supportLine={this.generateSupportLine()}
                            /> : null}
                    </Col>
                </Row>
            </div>
        )
    }
}
