import React, { Component } from 'react';
import { Row, Col, List, Button } from 'antd';


export default class HistoryBoard extends Component {

    loadHistoryBoard = (e) => {
        console.log(e.target.getAttribute("info"));
    }

    render() {
        return (
            <div>
                <Row gutter={16}>
                    <Col span={8}>
                        <List
                            size="small"
                            header={<div>Move History</div>}
                            pagination={{
                                onChange: (page) => {
                                    console.log(page);
                                },
                                pageSize: 15,
                            }}
                            bordered
                            dataSource={this.props.moveHistory}
                            renderItem={item => (
                                <List.Item>
                                    <Button info={item.turn} onClick={this.loadHistoryBoard}>{item.text}</Button>
                                </List.Item>
                            )}
                        />
                    </Col>
                    <Col span={16}>
                    </Col>
                </Row>
            </div>
        )
    }
}
