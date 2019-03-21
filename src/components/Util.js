import { destTable } from './DestTable';


export const boardNameArray = [
    'I5','I6','I7','I8','I9',
    'H4','H5','H6','H7','H8','H9',
    'G3','G4','G5','G6','G7','G8','G9',
    'F2','F3','F4','F5','F6','F7','F8','F9',
    'E1','E2','E3','E4','E5','E6','E7','E8','E9',
    'D1','D2','D3','D4','D5','D6','D7','D8',
    'C1','C2','C3','C4','C5','C6','C7',
    'B1','B2','B3','B4','B5','B6',
    'A1','A2','A3','A4','A5'
]

export const getArrowSymbol = (direction) => {
    let symbol;
    switch(direction){
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

export const Point = (x, y) => {
    return { x: x, y: y }
}

export const getSelectedElements = (selectedArray) => {
    let selectedMarbleArray = [];

    document.querySelectorAll('circle').forEach((e)=> {  
        if(selectedArray.length >=1 && e.getAttribute('location') === selectedArray[0]){
            selectedMarbleArray.push({index: 0, element: e, location: selectedArray[0]})
        } else if (selectedArray.length >=2 && e.getAttribute('location') === selectedArray[1]) {
            selectedMarbleArray.push({index: 1, element: e, location: selectedArray[1]})
        } else if (selectedArray.length >=3 && e.getAttribute('location') === selectedArray[2]) {
            selectedMarbleArray.push({index: 2, element: e, location: selectedArray[2]})
        }
    })

    return selectedMarbleArray;
}

export const getMoveDirection = (oldLocation, newLocation) => {
    for(let i=0; i< 6; i++){
        if(parseInt(destTable[oldLocation][i]) === parseInt(newLocation)){
            return i
        }
    }
    return -1;
}

export const isLegalGroup = (selectedArray, newElement) => {
    let valid = false;
    let validArray = [];
    if (!selectedArray.length) {
        valid = true;
        validArray = [newElement];
    } else if (selectedArray.length === 1) {
        for (let i = 0; i < 6; i++) {
            if(parseInt(destTable[selectedArray[0]][i]) === parseInt(newElement)) {
                valid = true;
                validArray = selectedArray[0] > newElement ? [newElement, selectedArray[0]] : [selectedArray[0], newElement];
            } else if(parseInt(destTable[selectedArray[0]][i]) !== -1 && parseInt(destTable[destTable[selectedArray[0]][i]][i]) === parseInt(newElement)){
                valid = true;
                validArray = selectedArray[0] > newElement? [newElement, destTable[selectedArray[0]][i].toString(),selectedArray[0]] 
                                                        : [selectedArray[0], destTable[selectedArray[0]][i].toString(),newElement];
            }
        }
        


    } else if (selectedArray.length === 2) {
        if (selectedArray[0] > newElement) {
            destTable[selectedArray[1]].forEach((location, index) => {
                if (parseInt(location) === parseInt(selectedArray[0]) && parseInt(destTable[selectedArray[0]][index]) === parseInt(newElement)) {
                    valid = true;
                    validArray = [newElement, ...selectedArray]
                }
            })
        } else {
            destTable[selectedArray[0]].forEach((location, index) => {
                if (parseInt(location) === parseInt(selectedArray[1]) && parseInt(destTable[selectedArray[1]][index]) === parseInt(newElement)) {
                    valid = true;
                    validArray = [...selectedArray, newElement]
                }
            })
        }
    }

    return valid ? validArray : [];
}



export const isLegalMove = (selectedArray) => {    

}

export const moveMarble = (e, start, end) => {
    return new Promise((resolve) => {
        const moves = 20;
        const distanceX = (start.x - end.x)/moves;    
        const distanceY = (start.y - end.y)/moves;
        let counter = 1;

        let clock = setInterval(() => {
            e.setAttribute('cx', start.x - counter * distanceX);
            e.setAttribute('cy', start.y - counter * distanceY);
            if(counter >= moves){
                clearInterval(clock);
                resolve("Complete");
            } else {
                counter++;
            }
        }, 200/moves);
    })
    
}

export const moveMarbles = (changeInfoArray) => {
    return new Promise((resolve) => {
        if(!changeInfoArray.length){
            return;
        }
        const moves = 10;
        const distanceX = (changeInfoArray[0].start.x - changeInfoArray[0].end.x)/moves;    
        const distanceY = (changeInfoArray[0].start.y - changeInfoArray[0].end.y)/moves;

        let counter = 1;

        let clock = setInterval(() => {
            changeInfoArray.forEach(({element, start})=> {
                element.setAttribute('cx', start.x - counter * distanceX);
                element.setAttribute('cy', start.y - counter * distanceY);
            })
            
            if(counter >= moves){
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
        }, 200/moves);
        

    })
}

export const getChangeInfoArray = (selectedHex, moveDirection, boardArray) => {
    let changeInfoArray = getSelectedElements(selectedHex);

    changeInfoArray.forEach((marble, index) => {
        const destLocation = destTable[marble.location][moveDirection];
        changeInfoArray[index].originLocation = marble.location;
        changeInfoArray[index].destLocation = destLocation;
        changeInfoArray[index].start = boardArray[marble.location];
        changeInfoArray[index].end = boardArray[destLocation];
        changeInfoArray[index].direction = moveDirection;
    })

    return changeInfoArray;
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
    if(!action.length){
        return;
    }

    let nextState = [...curState];
    action.forEach(move => {
        nextState[move[0]] = move[1];
    })

    return nextState;
}