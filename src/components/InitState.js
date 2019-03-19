export const getInitialState = (option) => {
    let initialState;

    switch(option){
        case 1:
            initialState = [1, 1, 1, 1, 1,
                1, 1, 1, 1, 1, 1,
                0, 0, 1, 1, 1, 0, 0,
                0, 0, 0, 0, 0, 0, 0, 0,
                0, 0, 0, 0, 0, 0, 0, 0, 0,
                0, 0, 0, 0, 0, 0, 0, 0,
                0, 0, 2, 2, 2, 0, 0,
                2, 2, 2, 2, 2, 2,
                2, 2, 2, 2, 2]
            break;
        default:
            initialState = [1, 1, 1, 1, 1,
            1, 1, 1, 1, 1, 1,
            0, 0, 1, 1, 1, 0, 0,
            0, 0, 0, 0, 0, 0, 0, 0,
            0, 0, 0, 0, 0, 0, 0, 0, 0,
            0, 0, 0, 0, 0, 0, 0, 0,
            0, 0, 2, 2, 2, 0, 0,
            2, 2, 2, 2, 2, 2,
            2, 2, 2, 2, 2]
            break;
    }

    return initialState;
}