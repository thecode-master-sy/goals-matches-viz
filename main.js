import "./style.css";
import { select } from "d3";
import { render } from "./render";

const container = select("#app").node();

const height = innerHeight * 1.2;

let state = { width: innerWidth, height };

const setState = (next) => {
	state = next(state);
	render(container, { state, setState });
};

addEventListener("resize", () => {
	setState((state) => ({ ...state, width: innerWidth, height }));
});

render(container, { state, setState });
