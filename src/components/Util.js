import { destTable } from './DestTable';

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
        const moves = 100;
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

export const moveMarbles = (selectedMarbles, direction, boardArray) => {
    return new Promise((resolve) => {
        const moves = 10;
        const tempTable = destTable;        
        let counter = 1;
        let changeArray = [];

        let clock = setInterval(() => {
            selectedMarbles.forEach(({element, location})=> {
                const start = boardArray[location];
                const end = boardArray[tempTable[location][direction]];
                const distanceX = (start.x - end.x)/moves;    
                const distanceY = (start.y - end.y)/moves;
                element.setAttribute('cx', start.x - counter * distanceX);
                element.setAttribute('cy', start.y - counter * distanceY);
                changeArray.push({from: location, to: tempTable[location][direction]})
            })
            
            if(counter >= moves){
                clearInterval(clock);
                resolve(changeArray);
            } else {
                counter++;
            }
        }, 200/moves);
        

    })
}
