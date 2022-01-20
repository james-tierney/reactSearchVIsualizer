import React from 'react';
import ReactDOM from 'react-dom';
import {css} from '@emotion/react';

const CELL_SIZE = 20;
const  HEIGHT = 800;
const  WIDTH  = 600;
const emptyGraph =  () => [...Array(WIDTH)].map((_) => [...Array(HEIGHT)].map((_)=> 'graph-item'));
const emptyRows = () => [...Array(WIDTH)].map((_) => [...Array(HEIGHT)].map((_)=> 'grid-item'));


const initialState = {
    cells: []
}
console.log("empty graph= " + emptyGraph());

const clone = (x) => JSON.parse(JSON.stringify(x));

function generateGrid(rows, columns, mapper) {
    return Array(rows)
        .fill()
        .map(() => Array(columns).fill().map(mapper));
}

const getInitialState = () => ({
    grid: newGrid(),
    status: "inProgress",
    turn: "X"
});

const reducer = (state, action) => {
    if (state.status === "success" && action.type !== "RESET") {
        return state;
    }

    switch (action.type) {
        case "RESET":
            return getInitialState();

        case "CLICK": {
            const { x, y } = action.payload;
            const { grid, turn } = state;

            if (grid[y][x]) {
                return state;
            }

            const nextState = clone(state);
            return nextState;
        }

        default:
            return state;
    }
};


const newGrid = () => generateGrid(4, 3, () => null);

function Cell({onClick, x, y}) {
    return (
      <div
        css={{
            backgroundColor : '#fA0',
            width: 100,
            height: 100
        }}

      >
          <button
              css={{
                  fontSize: "2.5rem",
                  width: "100%",
                  height: "100%"
              }}
              onClick={onClick}
              type="button"
          >
              {x}
              {y}
          </button>

      </div>
    );
}


function Grid({ grid, handleClick }) {
    return (
        <div css={{ display: "inline-block" }}>
            <div
                css={{
                    backgroundColor: "#3F0",
                    display: "grid",
                    gridTemplateRows: `repeat(${grid.length}, 1fr)`,
                    gridTemplateColumns: `repeat(${grid[0].length}, 1fr)`,
                    gridGap: 2
                }}
            >
                {grid.map((row, rowIdx) =>
                    row.map((value, colIdx) => (
                        <Cell
                            key={`${colIdx}-${rowIdx}`}
                            onClick={() => {
                                handleClick(colIdx, rowIdx);
                            }}
                            value={value}
                        />
                    ))
                )}
            </div>
        </div>
    );
}

function Game() {
    const [state, dispatch] = React.useReducer(reducer, getInitialState());
    const { grid, status, turn } = state;

    const handleClick = (x, y) => {
        dispatch({ type: "CLICK", payload: { x, y } });
    };

    const reset = () => {
        dispatch({ type: "RESET" });
    };

    return (
        <div css={{ display: "inline-block" }}>
            <div
                css={{
                    display: "flex",
                    justifyContent: "space-between"
                }}
            >

            </div>
            <Grid grid={grid} handleClick={handleClick} />
        </div>
    );
}

export class Graph extends React.Component {
    constructor(props) {
        super(props);
        this.state = initialState;//{color: "cadetblue"}
        this.adjacencyList = new Map();
        this.rows = HEIGHT / CELL_SIZE;
        this.cols = WIDTH / CELL_SIZE;
        this.board = this.makeEmptyBoard();
        this.createGraph = this.createGraph.bind(this);
        this.depthFirstSearch = this.depthFirstSearch.bind(this);
        this.breadthFirstSearch = this.breadthFirstSearch.bind(this);
        this.getNeighbours = this.getNeighbours.bind(this);
    }



    // function to add node our graph
    addNode(node) {
        this.adjacencyList.set(node, []);
    }

    // function to add edge between nodes to our graph
    addEdge(node, edge) {
        this.adjacencyList.get(node).push(edge);
        // need to add the edge other direction too
        this.adjacencyList.get(edge).push(node);
    }


    printOurGraph() {
        let keys = this.adjacencyList.keys();

        for(let i of keys) {
            let values = this.adjacencyList.get(i);
            let valuesToPrint = "";
            for(let j of values) {
                valuesToPrint += j + " ";
            }
            console.log(i + " -> " + valuesToPrint + "\n");
        }
    }
    /*getNeighbours(node) {
        return this.adjacencyList.get(node);
    } */

    reversePath(path) {
        let newPath = "";
        for(let i = path.length-1; i >= 0; i--) {
            if((path[i] !== "-") || (path[i] !== ">")) {
                newPath += path[i];
            }
        }
        return newPath;
    }

    // onclick function for buttons doesn't like the return values could set value = to this functions return
    // but currently no need
    breadthFirstSearch(graph, origin, dest) {
        let frontTier = []; // this will be our FIFO Queue
        let visited = [];
        let route = "";
        let keys = [];
        let failure = "node " + dest + " could not be found! ";
        if(origin === dest) {
            console.log("origin was dest");
            //return origin;
        }
        frontTier.push(origin);
        visited.push(origin);
        while(frontTier.length !== 0) {
            let curNode = frontTier.shift(); // removes element at the front of the queue
            for(let neighbour of graph.getNeighbours(curNode)) {
                let s = neighbour;
                if(s === dest) {
                    keys = graph.adjacencyList.get(dest);
                    let prev = dest;
                    while(prev !== origin) {
                        route += prev;
                        for (let key of keys) {
                            route = "";
                            route += " - " + prev + " - " + key;
                            if (key === origin) {
                                const originPath = dest + route;
                                const destPath = route + dest;
                                console.log("path took from destination back to origin is ( " + originPath + " )");
                                console.log("path took from origin to dest is ( " + this.reversePath(originPath) + " )");
                            }
                        }
                        prev = keys.shift();
                        keys = graph.adjacencyList.get(prev);
                    }
                    console.log("destination " + s + " was reached");
                    console.log("visited nodes were -> " + visited);
                    //return s;
                }
                else {
                    visited.push(s);
                    frontTier.push(neighbour);
                }
            }
        }
        console.log(failure);
        //return failure;
    }


    depthFirstSearch(graph, origin, dest) {

        let failure = "node " + dest + " could not be found";
        let visited = [];
        let route = "";
        let keys = [];
        let stack = [];

        if(origin === dest) {
            console.log("origin was destination");
            //return origin;
        }
        stack.push(origin);
        visited.push(origin);
        while(stack.length !== 0) {
            let curNode = stack.pop();  // removes last element added to the stack
            console.log("popped from stack = " + curNode);
            console.log("neighbours = " + graph.getNeighbours(curNode));
            let neighbours = graph.getNeighbours(curNode);
            for(let neighbour of neighbours) {
                console.log(graph);
                let s = neighbour;
                if(s === dest) {
                   keys = graph.getNeighbours(dest);    // TODO change this to graph
                    console.log("keys now = " + keys);
                    console.log("dest = " + keys);
                    let prev = dest;
                    while(prev !== origin) {
                        console.log("keys in here =" + keys);
                        route += prev;
                        for (let key of keys) {
                            route = "";
                            console.log("KEY ---" + key);
                            route += " - " + prev + " - " + key;
                            if (key === origin) {
                                const originPath = dest + route;
                                const destPath = route + dest;
                                console.log("path took from destination back to origin is ( " + originPath + " )");
                                console.log("path took from origin to dest is ( " + this.reversePath(originPath) + " )");
                            }
                        }
                        prev = keys.shift();//neighbours.shift();//    keys.shift();
                        keys = graph.getNeighbours(prev);//graph.adjacencyList.get(prev);
                    }
                    console.log("destination " + s + " was reached");
                    console.log("visited nodes were -> " + visited);
                    //return s; //onclick for button doesn't like return values
                }
                else {
                    visited.push(s);
                    stack.push(neighbour);
                }
            }
        }
        console.log(failure);
        //return failure;
    }

    createGraph(rows, cols) {


    // Using the above implemented graph class

        let graph = new Graph(null, 4,3);
        let nodes = [rows][cols]; //[ 'A', 'B', 'C', 'D', 'E', 'F' ];
        console.log("Nodes= " + nodes);

    // adding vertices
        for (let i = 0; i < nodes.length; i++) {
            graph.addNode(nodes[i]);
        }

        return graph;
    }

    getNeighbours(node) {

    }

    onChange = () => {
        console.log("clicked")
        //this.setState(style=)
        //this.setState({style background-color:'black'});
    }

    makeEmptyBoard() {
        let board = [];
        for(let x = 0; x < this.rows; x++) {
            board[x] = [];
            for(let y = 0; y < this.cols; y++) {
                board[x][y] = [x, y];
            }
        }
        return board;
    }



    // TODO allow user to choose the boundaries of nodes to be in the graph so A-Z and randomly assign no more than 4 neighbours for each node
    // TODO also allow user to choose the origin of the search and the destination
    render() {
        return (
            <div>
                <header>
                    <h1>Tic Tac Toe in React</h1>
                </header>
                <Game />
            </div>
        );
    }

}

// TODO what ever dest node is ends up having no neigbours in the hashmap

/*let graph = new Graph(0, 6);
graph = graph.createGraph();
graph.depthFirstSearch(graph, 'A', 'F');
*/
