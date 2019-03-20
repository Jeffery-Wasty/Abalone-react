import React, { Component } from 'react';
import { Timeline } from 'antd';

export default class GameInfo extends Component {
  render() {
    return (
      <div>
         <div style={{ margin: '0 200px 0 0', minHeight: 620, border: "1px solid #eeeeee", backgroundColor: "#eeeeee" }}>
              <div style={{ margin: 20 }}>
                <h3> - White Player</h3>
                <h4>Game Score: 3</h4>
                <h4>Time taken: 40s</h4>
                <h4>Moves taken: 10</h4>
                <h4>Next move: Move G8 to top right</h4>
                <Timeline>
                  <Timeline.Item>Move A1 to right</Timeline.Item>
                  <Timeline.Item>Move B3 to top left</Timeline.Item>
                  <Timeline.Item>Move D4 C4 B4 and push E4 F4 to top left</Timeline.Item>
                </Timeline>

                <h3> - Black Player</h3>
                <h4>Game Score: 2</h4>
                <h4>Time taken: 20s</h4>

                <h4>Moves taken: 11</h4>
                <h4>Next move: Move G8 to top right</h4>
                <Timeline>
                  <Timeline.Item>Move A1 to right</Timeline.Item>
                  <Timeline.Item>Move B3 to top left</Timeline.Item>
                  <Timeline.Item>Move D4 C4 B4 and push E4 F4 to top left</Timeline.Item>
                  <Timeline.Item>Move D3 C3 to left</Timeline.Item>
                </Timeline>
              </div>
            </div>
      </div>
    )
  }
}
