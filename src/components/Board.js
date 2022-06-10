import React, { useEffect, useState } from 'react';

const BOARD_SIZE = 10;
const BOMB_COUNT = 10;
const INITIAL_CELL = {
    isClicked: false,
    isBomb: false,
    isFlagged: false,
    neighbourBombs: '',
};

const CreateInitialBoard = () => {
    let board = Array.from({ length: BOARD_SIZE }, () =>
        Array.from({ length: BOARD_SIZE }, () => {
            return { ...INITIAL_CELL };
        })
    );

    AddBombs(board);

    return board;
};

const AddBombs = (board) => {
    let randomX,
        randomY,
        bombsAdded = 0;

    while (bombsAdded <= BOMB_COUNT) {
        randomX = Math.floor(Math.random() * BOARD_SIZE);
        randomY = Math.floor(Math.random() * BOARD_SIZE);
        if (!board[randomX][randomY].isMine) {
            board[randomX][randomY].isBomb = true;
            bombsAdded++;
        }
    }
};

const INITIAL_BOARD = CreateInitialBoard();

const GetBombsArray = (board) => {
    let bombArray = [];

    board.map(row => {
        row.map((cell) => {
            if (cell.isBomb) {
                bombArray.push(cell);
            }
        });
    });

    return bombArray;
}

const GetFlagsArray = (board) => {
    let flagArray = [];

    board.map(row => {
        row.map((cell) => {
            if (cell.isFlagged) {
                flagArray.push(cell);
            }
        });
    });

    return flagArray;
}

export default function Board() {
    const [board, setBoard] = useState(INITIAL_BOARD);
    const [flag, setFlag] = useState(0);
    const [gameOver, setGameOver] = useState(false);

    const RevealArea = (rowIndex, cellIndex) => {
        const el = [];
        //up
        if (rowIndex > 0) {
            el.push(board[rowIndex - 1][cellIndex]);
        }
        //down
        if (rowIndex < BOARD_SIZE - 1) {
            el.push(board[rowIndex + 1][cellIndex]);
        }
        //left
        if (cellIndex > 0) {
            el.push(board[rowIndex][cellIndex - 1]);
        }
        //right
        if (cellIndex < BOARD_SIZE - 1) {
            el.push(board[rowIndex][cellIndex + 1]);
        }
        // top left
        if (rowIndex > 0 && cellIndex > 0) {
            el.push(board[rowIndex - 1][cellIndex - 1]);
        }
        // top right
        if (rowIndex > 0 && cellIndex < BOARD_SIZE - 1) {
            el.push(board[rowIndex - 1][cellIndex + 1]);
        }
        // bottom right
        if (rowIndex < BOARD_SIZE - 1 && cellIndex < BOARD_SIZE - 1) {
            el.push(board[rowIndex + 1][cellIndex + 1]);
        }
        // bottom left
        if (rowIndex < BOARD_SIZE - 1 && cellIndex > 0) {
            el.push(board[rowIndex + 1][cellIndex - 1]);
        }
        return el;
    };

    const GetNeighbours = (rowIndex, cellIndex) => {
        let _board = board;
        let neighbourBombs = 0;
        if (!board[rowIndex][cellIndex].isBomb) {
            const revealArea = RevealArea(rowIndex, cellIndex);
            revealArea.map((value) => {
                if (value.isBomb) {
                    neighbourBombs++;
                }
            });
            if (neighbourBombs === 0) {
                _board[rowIndex][cellIndex].isEmpty = true;
            }
        }
        return neighbourBombs > 0 ? neighbourBombs : '';
    };

    const CellClickHandler = (rowIndex, cellIndex, rightClick = false) => {
        let _board = board;
        if (gameOver) return;
        else if (!rightClick && _board[rowIndex][cellIndex].isBomb) {
            if (_board[rowIndex][cellIndex].isFlagged) {
                return;
            }
            _board[rowIndex][cellIndex].isClicked = true;
            alert('Game Over');
            setGameOver(true);
            setFlag(0);
            for (let i = 0; i < BOARD_SIZE; i++) {
                for (let j = 0; j < BOARD_SIZE; j++) {
                    if (_board[i][j].isBomb) {
                        _board[i][j].isClicked = true;
                    }
                }
            }
        } else if (rightClick && _board[rowIndex][cellIndex].isFlagged) {
            _board[rowIndex][cellIndex].isFlagged = false;
            _board[rowIndex][cellIndex].isClicked = false;
            setFlag(flag - 1);
        } else if (rightClick && flag < BOMB_COUNT) {
            _board[rowIndex][cellIndex].isClicked = true;
            _board[rowIndex][cellIndex].isFlagged = true;
            setFlag(flag + 1);
        } else {
            _board[rowIndex][cellIndex].isClicked = true;
            _board[rowIndex][cellIndex].neighbourBombs = GetNeighbours(
                rowIndex,
                cellIndex
            );
        }
        if (flag === BOMB_COUNT) {
            const bombsArray = GetBombsArray(_board);
            const flagsArray = GetBombsArray(_board);
            if (JSON.stringify(bombsArray) === JSON.stringify(flagsArray)) {
                setGameOver(true);
                setFlag(0);
                alert("Congrats! You won!");
            }
        }
        setBoard([..._board]);
    };

    return (
        <div className={gameOver ? 'game-over' : ''}>
            <button className='button'
                onClick={() => {
                    setBoard(CreateInitialBoard());
                    setGameOver(false);
                    setFlag(0)
                }}>New Game</button>
            <div className="board">
                {board.map((row, rowIndex) => {
                    return row.map((cell, cellIndex) => {
                        return (
                            <div
                                key={`${rowIndex}-${cellIndex}`}
                                className={`cell ${cell.isClicked ? 'revealed' : ''}`}
                                onContextMenu={(e) => {
                                    e.preventDefault();
                                    CellClickHandler(rowIndex, cellIndex, true);
                                }}
                                onClick={(e) => {
                                    e.preventDefault();
                                    CellClickHandler(rowIndex, cellIndex);
                                }}
                            >
                                {cell.isClicked && cell.isFlagged && `🚩`}
                                {cell.isClicked && cell.isBomb && !cell.isFlagged && `💣`}
                                {cell.isClicked &&
                                    !cell.isBomb &&
                                    !cell.isFlagged &&
                                    `${cell.neighbourBombs}`}
                            </div>
                        );
                    });
                })}
            </div>
        </div>
    );
}
