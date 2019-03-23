import React, { Component } from 'react';
import { Row, Col, List, Button } from 'antd';
import DrawGameBoard, { boardArray }  from './DrawGameBoard';
import { generateSupportlineTexts } from './Util';

export default class HistoryBoard extends Component {

    state = {
        selectedHistory: null
    }

    locationSelected = (location) => {
        let found = false;
        if (this.state.selectedHistory.marbles.length) {
            found = this.state.selectedHistory.marbles.find(el => {
                return parseInt(el) === parseInt(location);
            })
        }
        return found;
    }

    loadHistoryBoard = (e) => {

        const history = this.props.moveHistory.find(history => history.turn === parseInt(e.target.getAttribute("turn")));
        console.log(history);
        this.setState({
            selectedHistory: history
        })
    }

    generateSupportLine = () => this.state.selectedHistory? 
        generateSupportlineTexts(this.state.selectedHistory.marbles, boardArray, this.state.selectedHistory.direction) : null;

    render() {
        return (
            <div>
                <Row gutter={16}>
                    <Col span={8}>
                        <List
                            size="small"
                            header={<div>Move History</div>}
                            pagination={{
                                pageSize: 15,
                            }}
                            bordered
                            dataSource={this.props.moveHistory}
                            renderItem={item => (
                                <List.Item>
                                    <Button turn={item.turn} onClick={this.loadHistoryBoard}>{item.text}</Button>
                                </List.Item>
                            )}
                        />
                    </Col>
                    <Col span={16}>
                        {this.state.selectedHistory ? 
                            <DrawGameBoard
                                curState={this.state.selectedHistory.state}
                                locationSelected={this.locationSelected}
                                supportLine={this.generateSupportLine()}
                            /> : null}
                    </Col>
                </Row>
            </div>
        )
    }
}
