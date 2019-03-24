import { destTable } from './DestTable';


export const boardNameArray = [
    'I5', 'I6', 'I7', 'I8', 'I9',
    'H4', 'H5', 'H6', 'H7', 'H8', 'H9',
    'G3', 'G4', 'G5', 'G6', 'G7', 'G8', 'G9',
    'F2', 'F3', 'F4', 'F5', 'F6', 'F7', 'F8', 'F9',
    'E1', 'E2', 'E3', 'E4', 'E5', 'E6', 'E7', 'E8', 'E9',
    'D1', 'D2', 'D3', 'D4', 'D5', 'D6', 'D7', 'D8',
    'C1', 'C2', 'C3', 'C4', 'C5', 'C6', 'C7',
    'B1', 'B2', 'B3', 'B4', 'B5', 'B6',
    'A1', 'A2', 'A3', 'A4', 'A5'
]

export const getArrowSymbol = (direction) => {
    let symbol;
    switch (direction) {
        case 0:
            symbol = "←";
            break;
        case 1:
            symbol = "↖";
            break;
        case 2:
            symbol = "↗";
            break;
        case 3:
            symbol = "↙";
            break;
        case 4:
            symbol = "↘";
            break;
        case 5:
            symbol = "→";
            break;
        default:
            break;
    }
    return symbol;
}

export const generateBoardCoordArray = (start_point, size) => {
    let centerArray = [];
    let startPoint = start_point;
    const minRowLength = 5;
    const maxRowLength = 9;

    for (let i = minRowLength; i <= maxRowLength; i++) {

        for (let j = 0; j < i; j++) {
            const x = startPoint.x + j * Math.sqrt(3) * size;
            const y = startPoint.y;
            centerArray.push(Point(x, y));
        }
        startPoint = {
            x: startPoint.x - Math.sqrt(3) * size * 0.5,
            y: startPoint.y + 1.5 * size
        }
    }

    startPoint = {
        x: startPoint.x + Math.sqrt(3) * size,
        y: startPoint.y
    }

    for (let i = maxRowLength - 1; i >= minRowLength; i--) {

        for (let j = 0; j < i; j++) {
            const x = startPoint.x + j * Math.sqrt(3) * size;
            const y = startPoint.y;
            centerArray.push(Point(x, y));
        }

        startPoint = {
            x: startPoint.x + Math.sqrt(3) * size * 0.5,
            y: startPoint.y + 1.5 * size
        }
    }

    return centerArray;
}

export const getHexCornerCoordinate = (center, size) => {
    let point_str = "";

    for (let i = 0; i < 6; i++) {
        const angle_deg = 60 * i + 30;
        const angle_rad = Math.PI / 180 * angle_deg;
        const x = center.x + size * Math.cos(angle_rad);
        const y = center.y + size * Math.sin(angle_rad);
        point_str += `${x},${y} `;
    }

    return point_str;
}

export const getBaseBoardCornerCoordinate = (center, size) => {
    let point_str = "";

    for (let i = 0; i < 6; i++) {
        const angle_deg = 60 * i;
        const angle_rad = Math.PI / 180 * angle_deg;
        const x = center.x + 8.5 * size * Math.cos(angle_rad);
        const y = center.y + 8.5 * size * Math.sin(angle_rad);
        point_str += `${x},${y} `;
    }

    return point_str;
}

export const Point = (x, y) => {
    return { x: x, y: y }
}

export const getMoveDirection = (selectedHex, targetLocation) => {

    let moveDirection = -1;

    for (let i = 0; i < selectedHex.length; i++) {
        let tempDirection = -1;

        for (let j = 0; j < 6; j++) {
            if (parseInt(destTable[selectedHex[i]][j]) === parseInt(targetLocation)) {
                tempDirection = j
            }
        }

        if (tempDirection !== -1) {
            moveDirection = tempDirection;
            break;
        }
    }

    return moveDirection;
}

export const isLegalGroup = (selectedArray, newElement, curState) => {
    let valid = false;
    let validArray = [];
    if (!selectedArray.length) {
        valid = true;
        validArray = [newElement];
    } else if (selectedArray.length === 1) {
        for (let i = 0; i < 6; i++) {
            if (destTable[selectedArray[0]][i] === parseInt(newElement)) {
                valid = true;
                validArray = parseInt(selectedArray[0]) > parseInt(newElement) ? 
                            [newElement, selectedArray[0]] : 
                            [selectedArray[0], newElement];
            } else if (destTable[selectedArray[0]][i] !== -1 && 
                       curState[destTable[selectedArray[0]][i]] === curState[newElement] && 
                       destTable[destTable[selectedArray[0]][i]][i] === parseInt(newElement)) {
                valid = true;
                validArray = parseInt(selectedArray[0]) > parseInt(newElement) ? 
                            [newElement, destTable[selectedArray[0]][i].toString(), selectedArray[0]] : 
                            [selectedArray[0], destTable[selectedArray[0]][i].toString(), newElement];
            }
        }
    } else if (selectedArray.length === 2) {
        if (parseInt(selectedArray[0]) > parseInt(newElement)) {
            destTable[selectedArray[1]].forEach((location, index) => {
                if (parseInt(location) === parseInt(selectedArray[0]) && 
                    destTable[selectedArray[0]][index] === parseInt(newElement)) {
                    valid = true;
                    validArray = [newElement, ...selectedArray]
                }
            })
        } else {
            destTable[selectedArray[0]].forEach((location, index) => {
                if (parseInt(location) === parseInt(selectedArray[1]) && 
                    destTable[selectedArray[1]][index] === parseInt(newElement)) {
                    valid = true;
                    validArray = [...selectedArray, newElement]
                }
            })
        }
    }

    return valid ? validArray : [];
}


export const moveMarble = (e, start, end) => {
    return new Promise((resolve) => {
        const moves = 20;
        const distanceX = (start.x - end.x) / moves;
        const distanceY = (start.y - end.y) / moves;
        let counter = 1;

        let clock = setInterval(() => {
            e.setAttribute('cx', start.x - counter * distanceX);
            e.setAttribute('cy', start.y - counter * distanceY);
            if (counter >= moves) {
                clearInterval(clock);
                resolve("Complete");
            } else {
                counter++;
            }
        }, 200 / moves);
    })

}

export const moveMarbles = (changeInfoArray) => {
    return new Promise((resolve) => {
        if (!changeInfoArray.length) {
            return;
        }
        const moves = 10;
        const distanceX = (changeInfoArray[0].start.x - changeInfoArray[0].end.x) / moves;
        const distanceY = (changeInfoArray[0].start.y - changeInfoArray[0].end.y) / moves;

        let counter = 1;

        let clock = setInterval(() => {
            changeInfoArray.forEach(({ element, start }) => {
                element.setAttribute('cx', start.x - counter * distanceX);
                element.setAttribute('cy', start.y - counter * distanceY);
            })

            if (counter >= moves) {
                clearInterval(clock);
                //reset marble coordinates for animation purpose
                changeInfoArray.forEach(({ element, start }) => {
                    element.setAttribute('cx', start.x);
                    element.setAttribute('cy', start.y);
                })
                resolve("completed");
            } else {
                counter++;
            }
        }, 200 / moves);


    })
}

export const convertAIResponse = (action) => {
    if(!action.length){
        console.error("empty action");
    } 

    let changeInfoArray = [];
    let num0 = 0, num1 = 0, num2 = 0;

    action.foreach( e => {
        if(e[1] === 0){
            num0++;
        } else if (e[1] === 1) {
            num1++;
        } else if (e[1] === 2) {
            num2++;
        }
    })

    if(num1 > num2) {

    } else if (num1 < num2) {
        
    }
}


export const getChangeInfoArray = (selectedHex, moveDirection, boardArray, marbleToPush) => {
    let changeInfoArray = [];

    //search and save svg elements for animation purpose
    document.querySelectorAll('circle').forEach((e) => {
        if (selectedHex.length >= 1 && e.getAttribute('location') === selectedHex[0]) {
            changeInfoArray.push({ index: 0, element: e, originLocation: parseInt(selectedHex[0]) })
        } else if (selectedHex.length >= 2 && e.getAttribute('location') === selectedHex[1]) {
            changeInfoArray.push({ index: 1, element: e, originLocation: parseInt(selectedHex[1]) })
        } else if (selectedHex.length >= 3 && e.getAttribute('location') === selectedHex[2]) {
            changeInfoArray.push({ index: 2, element: e, originLocation: parseInt(selectedHex[2]) })
        }

        if (marbleToPush.length >= 1 && parseInt(e.getAttribute('location')) === marbleToPush[0]) {
            changeInfoArray.push({ index: -1, element: e, originLocation: marbleToPush[0] })
        } else if (marbleToPush.length >= 2 && parseInt(e.getAttribute('location')) === marbleToPush[1]) {
            changeInfoArray.push({ index: -2, element: e, originLocation: marbleToPush[1] })
        }
    })

    changeInfoArray.forEach((marble, index) => {
        const destLocation = destTable[marble.originLocation][moveDirection];
        if (destLocation === -1) {
            changeInfoArray[index].end = calculateOutBoundEndpoint(boardArray[marble.originLocation], moveDirection, boardArray);
        } else {
            changeInfoArray[index].end = boardArray[destLocation];
        }
        changeInfoArray[index].destLocation = destLocation;
        changeInfoArray[index].start = boardArray[marble.originLocation];
        changeInfoArray[index].direction = moveDirection;
    })

    return changeInfoArray;
}

const calculateOutBoundEndpoint = (start, moveDirection, boardArray) => {
    let diffX = 0;
    let diffY = 0;
    let point;

    switch (moveDirection) {
        case 0:
            diffX = boardArray[6].x - boardArray[5].x;
            diffY = boardArray[6].y - boardArray[5].y;
            point = Point(start.x - diffX, start.y - diffY);
            break;
        case 1:
            diffX = boardArray[6].x - boardArray[0].x;
            diffY = boardArray[6].y - boardArray[0].y;
            point = Point(start.x - diffX, start.y - diffY);
            break;
        case 2:
            diffX = boardArray[6].x - boardArray[1].x;
            diffY = boardArray[6].y - boardArray[1].y;
            point = Point(start.x - diffX, start.y - diffY);
            break;
        case 3:
            diffX = boardArray[6].x - boardArray[12].x;
            diffY = boardArray[6].y - boardArray[12].y;
            point = Point(start.x - diffX, start.y - diffY);
            break;
        case 4:
            diffX = boardArray[6].x - boardArray[13].x;
            diffY = boardArray[6].y - boardArray[13].y;
            point = Point(start.x - diffX, start.y - diffY);
            break;
        case 5:
            diffX = boardArray[6].x - boardArray[7].x;
            diffY = boardArray[6].y - boardArray[7].y;
            point = Point(start.x - diffX, start.y - diffY);
            break;
        default:
            point = Point(0, 0);
            break;
    }

    return point;
}

export const isLegalMove = (selectedHex, moveDirection, boardArray, curState) => {
    let legalMove = false;
    let marbleToPush = [];

    if (selectedHex.length === 1) {
        //if move dest location is clean, okay to move
        if (curState[destTable[selectedHex[0]][moveDirection]] === 0) {
            legalMove = true;
        }
    } else if (selectedHex.length === 2) {
        if (destTable[selectedHex[0]][5 - moveDirection] !== parseInt(selectedHex[1]) &&
            destTable[selectedHex[0]][moveDirection] !== parseInt(selectedHex[1])) {
            //side move
            if (curState[destTable[selectedHex[0]][moveDirection]] === 0 &&
                curState[destTable[selectedHex[1]][moveDirection]] === 0) {
                //both marble move direction is clean, okay to move
                legalMove = true;
            }
        } else {
            //inline move
            const directionIndex = moveDirection < 3 ? 0 : 1;
            const nextMarblePosition = destTable[selectedHex[directionIndex]][moveDirection];
            if (nextMarblePosition !== -1) {
                const nextTwoMarblePosition = destTable[nextMarblePosition][moveDirection];

                if (!curState[nextMarblePosition]) {
                    //clean path
                    legalMove = true;
                } else if (curState[nextMarblePosition] !== curState[selectedHex[0]] &&
                    (!curState[nextTwoMarblePosition] || nextTwoMarblePosition === -1)) {
                    //next one is opponent marble and next two is empty
                    legalMove = true;
                    marbleToPush = [nextMarblePosition];
                }
            }


        }
    } else if (selectedHex.length === 3) {
        if (destTable[selectedHex[0]][5 - moveDirection] !== parseInt(selectedHex[1])
            && destTable[selectedHex[0]][moveDirection] !== parseInt(selectedHex[1])) {
            //side move
            if (curState[destTable[selectedHex[0]][moveDirection]] === 0
                && curState[destTable[selectedHex[1]][moveDirection]] === 0
                && curState[destTable[selectedHex[2]][moveDirection]] === 0) {
                //both marble move direction is clean, okay to move
                legalMove = true;
            }
        } else {
            //inline move
            const directionIndex = moveDirection < 3 ? 0 : 2;
            const nextMarblePosition = destTable[selectedHex[directionIndex]][moveDirection];
            if (nextMarblePosition !== -1) {
                const nextTwoMarblePosition = destTable[nextMarblePosition][moveDirection];

                if (!curState[nextMarblePosition]) {
                    //clean path
                    legalMove = true;
                } else {
                    if (nextTwoMarblePosition === -1) {
                        if (curState[nextMarblePosition] !== curState[selectedHex[0]]) {
                            //push one out of bound
                            legalMove = true;
                            marbleToPush = [nextMarblePosition];
                        }
                    } else {
                        if (curState[nextMarblePosition] !== curState[selectedHex[0]]
                            && !curState[nextTwoMarblePosition]) {
                            //push one
                            legalMove = true;
                            marbleToPush = [nextMarblePosition];
                        }
                        const nextThreeMarblePosition = destTable[nextTwoMarblePosition][moveDirection];

                        if (curState[nextMarblePosition] !== curState[selectedHex[0]]
                            && curState[nextTwoMarblePosition] !== curState[selectedHex[0]]
                            && (!curState[nextThreeMarblePosition] || nextThreeMarblePosition === -1)) {
                            //push two
                            legalMove = true;
                            marbleToPush = [nextMarblePosition, nextTwoMarblePosition];
                        }
                    }
                }

            }

        }
    }

    return legalMove ? getChangeInfoArray(selectedHex, moveDirection, boardArray, marbleToPush) : null;
}

export const getNextState = (changeInfoArray, curState) => {
    let nextState = [...curState];

    changeInfoArray.forEach(c1 => {
        nextState[c1.destLocation] = curState[c1.originLocation];

        let override = changeInfoArray.find(c2 => {
            return c2.destLocation === parseInt(c1.originLocation)
        })

        if (!override) {
            nextState[c1.originLocation] = 0;
        }
    })

    return nextState;
}

export const getNextStateByAIAction = (curState, action) => {
    if (!action.length) {
        return;
    }

    let nextState = [...curState];
    action.forEach(move => {
        nextState[move[0]] = move[1];
    })

    return nextState;
}

export const generateSupportlineTexts = (selectedHex, boardArray, moveDirection) => {
    let points = [];

    selectedHex.forEach(hex => {
        const dest = destTable[hex][moveDirection];
        if (dest === -1) {
            return;
        }
        const start = boardArray[hex];
        const end = boardArray[dest];
        const point = `${start.x},${start.y} ${end.x},${end.y}`;
        points.push(point);
    })

    return points;
}

export const generateHistoryText = (history) => {
    let text = "";

    text += `Turn ${history.turn}: `;

    history.marbles.forEach(marble => {
        text += `${boardNameArray[marble]} `;
    })
    text += `${getArrowSymbol(history.direction)} - `;
    text += `(${Math.round(history.time)}s)`;

    return text;
}