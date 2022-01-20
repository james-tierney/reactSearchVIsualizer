
import React from "react";
import ReactDOM from "react-dom";
import { jsx, css } from "@emotion/react";
import Node from './Node';
import './PathFinder.css';
import {DFS} from './DFS';
import App from './App';
import {BFS} from './BFS';
//import * as serviceWorker from './serviceWorker';

export default class pathFinder extends React.Component {
    constructor() {
        super();
        this.state = {
            grid: [],
            START_ROW: 2,
            FINISH_ROW: 10,
            START_COL: 4,
            FINISH_COL: 8,
            ROW_COUNT: 30,
            COLUMN_COUNT: 40,
            isRunning: false,
            mouseIsPressed: false,
            isStart: false,
            isFinish: false,
            curRow: 0,
            curCol: 0
        }

        this.handleMouseDown = this.handleMouseDown.bind(this);
        this.handleMouseLeave = this.handleMouseLeave.bind(this);
        this.toggleIsRunning = this.toggleIsRunning.bind(this);
    }

    componentDidMount() {
        const grid = this.getInitialGrid();
        this.setState({grid});
    }

    toggleIsRunning() {
        this.setState({isRunning: !this.state.isRunning});
    }

    toggleView() {
        if (this.state.isRunning) {
            this.clearGrid();
        }
    }
    getInitialGrid = (
        numRows = this.state.ROW_COUNT,
        numCols = this.state.COLUMN_COUNT,
    ) => {
        const init = [];
        for(let r = 0; r < numRows; r++) {
            const curRow = [];
            for(let c = 0; c < numCols; c++) {
                curRow.push(this.createNode(r, c));
            }
            init.push(curRow);
        }
        return init;
    };


    createNode = (row, col) => {
        return {
            row,
            col,
            isStart:
                row === this.state.START_ROW && col === this.state.START_COL,
            isFinish:
                row === this.state.FINISH_ROW && col === this.state.FINISH_COL,
            distance: Infinity,
            distanceToFinish:
                Math.abs(this.state.FINISH_ROW - row) + Math.abs(this.state.FINISH_COL - col),
            isVisited: false,
            prevNode: null,
            isNode: true
        };
    };

    handleMouseDown(row, col) {
        if(!this.state.isRunning) {
            if(this.isGridClear()) {
                if(document.getElementById(`node-${row}-${col}`).className === 'node node-start') {
                    this.setState({
                        mouseIsPressed: true,
                        startNode: true,
                        curRow: row,
                        curCol: col
                    });
                } else if(document.getElementById(`node-${row}-${col}`).className === 'node node-finish') {
                    this.setState({
                        mouseIsPressed: true,
                        finishNode: true,
                        curRow: row,
                        curCol: col
                    })
                }
                else {
                    const newGrid = getNewGrid(this.state.grid, row, col);
                    this.setState({
                        grid: newGrid,
                        mouseIsPressed: true,
                        curRow: row,
                        curCol: col
                    });
                }
            }
        }
        else {
            this.clearGrid();
        }
    }

    isGridClear() {
        for(const row of this.state.grid) {
            for(const node of row) {
                const nodeClassName = document.getElementById(`node-${node.row}-${node.col}`).className;
                if(nodeClassName === 'node node-visited' || nodeClassName === 'node node-shortest-path') {
                    return false;
                }
            }
        }
        return true;
    }

    handleMouseEnter(row, col) {
        if (!this.state.isRunning) {
            if (this.state.mouseIsPressed) {
                const nodeClassName = document.getElementById(`node-${row}-${col}`)
                    .className;
                if (this.state.isStart) {
                    const prevStartNode = this.state.grid[this.state.curRow][
                        this.state.curCol
                        ];
                    prevStartNode.isStart = false;
                    document.getElementById(
                        `node-${this.state.curRow}-${this.state.curCol}`,
                    ).className = 'node';

                    this.setState({curRow: row, curCol: col});
                    const curStartNode = this.state.grid[row][col];
                    curStartNode.isStart = true;
                    document.getElementById(`node-${row}-${col}`).className =
                        'node node-start';
                    this.setState({START_ROW: row, START_COL: col});
                } else if (this.state.isFinish) {
                    const prevFinishNode = this.state.grid[this.state.curRow][this.state.curCol];
                    prevFinishNode.isFinish = false;
                    document.getElementById(
                        `node-${this.state.curRow}-${this.state.curCol}`,
                    ).className = 'node';

                    this.setState({currRow: row, currCol: col});
                    const curFinishNode = this.state.grid[row][col];
                    curFinishNode.isFinish = true;
                    document.getElementById(`node-${row}-${col}`).className =
                        'node node-finish';
                    this.setState({FINISH_ROW: row, FINISH_COL: col});
                }
                const newGrid = getNewGrid(this.state.grid, row, col);
                this.setState({grid: newGrid});

            }
        }
    }

    handleMouseUp(row, col) {
        if(!this.state.isRunning) {
            this.setState({mouseIsPressed: false});
            if(this.state.isStart) {
                const isStart = !this.state.isStart;
                this.setState({isStart, START_ROW: row, START_COL: col});
            } else if(this.state.isFinish) {
                const isFinish = !this.state.isFinish;
                this.setState({
                    isFinish,
                    FINISH_ROW: row,
                    FINISH_COL: col
                });
            }
            this.getInitialGrid();
        }
    }

    handleMouseLeave() {
        if(this.state.isStart) {
            const isStart = !this.state.isStart;
            this.setState({isStart, mouseIsPressed: false});
        }
        else if(this.state.isFinish) {
            const isFinish = !this.state.isFinish;
            this.setState({isFinish, mouseIsPressed: false});
        }
    }

    clearGrid() {
        if(!this.state.isRunning) {
            const newGrid = this.state.grid.slice();
            for(const row of newGrid) {
                for(const node of row) {
                    let nodeClassName = document.getElementById(`node-${node.row}-${node.col}`).className;
                    if(nodeClassName !== 'node node-start' && nodeClassName !== 'node node-finish') {
                        document.getElementById(`node-${node.row}-${node.col}`).className = 'node';
                        node.isVisited = false;
                        node.distance = Infinity;
                        node.distanceToFinishNode = Math.abs(this.state.FINISH_ROW - node.row) + Math.abs(this.state.FINISH_COL - node.col);
                    }
                    if(nodeClassName === 'node node-finish') {
                        node.isVisited = false;
                        node.distance = Infinity;
                        node.distanceToFinishNode = 0;
                    }
                    if(nodeClassName === 'node node-start') {
                        node.isVisited = false;
                        node.distance = Infinity;
                        node.distanceToFinishNode = Math.abs(this.state.FINISH_ROW - node.row) + Math.abs(this.state.FINISH_COL - node.col);
                        node.isStart = true;
                        node.prevNode = null;
                        node.isNode = true;
                    }
                }
            }
        }
    }

    animate(visitedNodes, nodesInShortestPath) {

        for(let i = 0; i <= visitedNodes.length; i++) {
            if(i === visitedNodes.length) {
                setTimeout(() => {
                    this.animateShortestPath(nodesInShortestPath);
                }, 10*i);
                return;
            }
            setTimeout(() => {
                const node = visitedNodes[i];
                const nodeClassName = document.getElementById(`node-${node.row}-${node.col}`,).className;

                if(nodeClassName !== 'node node-start' && nodeClassName !== 'node node-finish') {
                    document.getElementById(`node-${node.row}-${node.col}`).className = 'node node-visited';
                }
            }, 10*i);
        }
    }

    animateShortestPath(shortestPath) {
        for(let i = 0; i < shortestPath.length; i++) {
            if(shortestPath[i] === 'end') {
                setTimeout(() => {
                    this.toggleIsRunning();
                }, i*50);
            }
            else {
                setTimeout(() => {
                    const node = shortestPath[i];
                    const nodeClassName = document.getElementById(`node-${node.row}-${node.col}`,).className;
                    if(nodeClassName !== 'node node-start' && nodeClassName !== 'node node-finish') {
                        document.getElementById(`node-${node.row}-${node.col}`).className = 'node node-shortest-path';
                    }
                }, i*40);
            }
        }
    }

    visualize(algorithm) {
        if(!this.state.isRunning) {
            this.clearGrid();
            this.toggleIsRunning();
            const {grid} = this.state;
            const startNode = grid[this.state.START_ROW][this.state.START_COL];
            const finishNode = grid[this.state.FINISH_ROW][this.state.FINISH_COL];
            let visitedNodes;
            switch(algorithm) {
                case 'DFS':
                    visitedNodes = DFS(grid, startNode, finishNode);
                    console.log("visited nodes = " + visitedNodes);
                    break;
                case 'BFS':
                    visitedNodes = BFS(grid, startNode, finishNode);
                    console.log("visited nodes = " + visitedNodes);
                    console.log("BFS");
                    break;
                default:
                    break;
            }
            const shortestPath = getShortestPath(finishNode);
            shortestPath.push('end');
            this.animate(visitedNodes, shortestPath);
        }
    }


    render() {
        const {grid, mouseIsPressed} = this.state;
        return (
            <div>
                <nav className="navbar navbar-expand-lg navbar-dark bg-dark ">
                    <a className="navbar-brand" href="/">
                        <b>PathFinding Visualizer</b>
                    </a>
                    <button
                        className="navbar-toggler"
                        type="button"
                        data-toggle="collapse"
                        data-target="#navbarNav"
                        aria-controls="navbarNav"
                        aria-expanded="false"
                        aria-label="Toggle navigation">
                        <span className="navbar-toggler-icon"></span>
                    </button>
                    <div className="collapse navbar-collapse" id="navbarNav">
                        <ul className="navbar-nav">
                            <li className="nav-item">
                                <a
                                    className="nav-link"
                                    href="">
                                </a>
                            </li>
                            <li className="nav-item">
                                <a className="nav-link">
                                </a>
                            </li>
                        </ul>
                    </div>
                </nav>

                <table
                    className="grid-container"
                    onMouseLeave={() => this.handleMouseLeave()}>
                    <tbody className="grid">
                    {grid.map((row, rowIdx) => {
                        return (
                            <tr key={rowIdx}>
                                {row.map((node, nodeIdx) => {
                                    const {row, col, isFinish, isStart, isWall} = node;
                                    return (
                                        <Node
                                            key={nodeIdx}
                                            col={col}
                                            isFinish={isFinish}
                                            isStart={isStart}
                                            isWall={isWall}
                                            mouseIsPressed={mouseIsPressed}
                                            onMouseDown={(row, col) =>
                                                this.handleMouseDown(row, col)
                                            }
                                            onMouseEnter={(row, col) =>
                                                this.handleMouseEnter(row, col)
                                            }
                                            onMouseUp={() => this.handleMouseUp(row, col)}
                                            row={row}></Node>
                                    );
                                })}
                            </tr>
                        );
                    })}
                    </tbody>
                </table>
                <button
                    type="button"
                    className="btn btn-danger"
                    onClick={() => this.clearGrid()}>
                    Clear Grid
                </button>
                <button
                    type="button"
                    className="btn btn-primary"
                    onClick={() => this.visualize('BFS')}>
                    Bread First Search
                </button>
                <button
                    type="button"
                    className="btn btn-primary"
                    onClick={() => this.visualize('DFS')}>
                    Depth First Search
                </button>
            </div>
        );
    }

}

function getShortestPath(finishNode) {
    const shortestPath = [];
    let curNode = finishNode;
    while(curNode !== null) {
        shortestPath.unshift(curNode);
        curNode = curNode.prevNode;
    }
    return shortestPath;
}

const getNewGrid = (grid, row, col)  => {
    const newGrid = grid.slice();
    const node = newGrid[row][col];
    if(!node.isStart && !node.isFinish && node.isNode) {
        const newNode = {
            ...node
        };
        newGrid[row][col] = newNode;
    }
    return newGrid;

};
