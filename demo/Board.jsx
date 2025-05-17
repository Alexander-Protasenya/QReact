import { QReact } from "../src/QReact.mjs";
import { Column } from "./Column.jsx";

export class Board extends QReact.Component {
	constructor(props) {
		super(props);

		this.state = {
			limit: 3,
			days: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
		}
	}

	render() {
		console.log('Board render...');

		return (
			<div style={{ overflow: 'hidden' }}>
				<h1>
					QReact demo v{QReact.version}
				</h1>
				<div>
					<p>Limit of tasks per day: {this.state.limit}</p>
					<button
						onClick={() => this.setState({ ...this.state, limit: this.state.limit + 1 })}>
						Increase
					</button>
					&nbsp;
					<button
						disabled={this.state.limit === 0}
						onClick={() => this.setState({ ...this.state, limit: this.state.limit - 1 })}>
						Decrease
					</button>
				</div>
				<div style={{ overflow: 'hidden', padding: '10px 0' }}>
					{this.state.days.map(x => (
						<div key={x}>
							<Column
								name={x}
								limit={this.state.limit}
								onRemove={(e) => {
									this.setState({ ...this.state, days: this.state.days.filter(x => x !== e) });
								}}
							/>
						</div>
					))}
				</div>
			</div>
		)
	}
}
