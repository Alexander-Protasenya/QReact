import { QReact } from "../src/QReact.mjs";

export class Column extends QReact.Component {

	state = {
		list: [],
	};

	componentDidMount() {
		console.log('Column "' + this.props.name + '" mounted');
	}

	componentWillUnmount() {
		console.log('Column "' + this.props.name + '" unmounted');
	}

	// shouldComponentUpdate(nextProps, nextState) {
	// 	console.log('shouldComponentUpdate');
	// }

	render() {
		return (
			// Example of processing inline CSS styles
			<div style={{ float: 'left', padding: '0 20px', border: 'solid 1px lightgray', margin: '10px 10px 0px 0px' }}>
				<div>
					<p>
						{this.props.name} ({this.state.list.length}/{this.props.limit})
					</p>
				</div>
				<div>
					<input type="text" value={this.state.name} onInput={(e) => {
						this.setState({ ...this.state, name: e.target.value });
					}} />
					&nbsp;
					<button
						disabled={this.props.limit <= this.state.list.length || !this.state.name || this.state.list.includes(this.state.name)}
						onClick={() => {
							if (this.state.name) {
								const newList = [...this.state.list, this.state.name];
								this.setState({ name: '', list: newList, time: new Date() });
							}
						}}
					>
						Add task
					</button>
				</div>
				<div>
					{this.state.list.map(x =>
					(
						<p key={x}>
							<b>{x}</b>&nbsp;
							<button onClick={() => {
								const newList = this.state.list.filter(y => y !== x);
								this.setState({ ...this.state, list: newList, time: new Date() });
							}}>Remove</button>
						</p>
					))}
					<p key="updated" style={{ paddingBottom: '10px' }}>
						Updated: {this.state.time && (this.state.time).toLocaleTimeString()}
					</p>
				</div>
				<div>
					<p>
						<button onClick={() => this.props.onRemove(this.props.name)}>
							Remove daily plan
						</button>
					</p>
				</div>
			</div>
		)
	}
}
