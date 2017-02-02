import React from 'react';
import ReactDOM from 'react-dom';
import request from 'request-promise';
import moment from 'moment';

// CSS Styles

const styles = {
  center: {
    marginLeft: 'auto',
    marginRight: 'auto',
    width: '50%'
  },
  placeholder: {
    borderTop: '1.5px solid black',
    padding: '5px',
    width: '100%',
    marginBottom: '0.5%'
  },
  textRight: {
    textAlign: 'right'
  },
  inputBox: {
    width: '100%',
    fontSize: '1.8em',
    padding: '0.5%'
  },
  smallMargin: {
    marginBottom: '0',
    marginTop: '0'
  },
  removeButton: {
  	color: "red",
  	backgroundColor: "rgba(0, 0, 0, 0)",
  	outline: "none"
  }
};

// To do box for incomplete tasks
class TodoBox extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			completed: props.completed
		};
		this.handleChange = this.handleChange.bind(this);
	}

	handleChange(event) {
	    let completed = !this.state.completed;
	    let {date, todo} = this.props;
	    this.setState({completed});
	    //This requests the API and updates the the completed status
	    request('http://localhost:3000/update/' + date + '/' + completed  + '/' + todo).then(resp => {
	        console.log(resp);
	        this.props.loadList();
	    });

  	}

	render() {
	    let {todo, date} = this.props;
	    let now = moment(date).format('MMMM Do YYYY, h:mm:ss a');
	    return (<div style={styles.placeholder}>
              <h4><input value={date} type="checkbox" checked={this.state.completed} onChange={this.handleChange}></input> {todo} </h4>
              <hr style={styles.smallMargin} />
              <h5>Created On: {now}</h5>
           </div>);
    }

}

// Component for the Completed Tasks
class CompletedBox extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			completed: props.completed
		};
		this.handleChange = this.handleChange.bind(this);
		this.handleButton = this.handleButton.bind(this);
	}

	handleButton(event) {
		let deletedTodo = event.target.value;
		request('http://localhost:3000/remove/' + deletedTodo).then(resp => {
			console.log('removed');
		});
		this.props.loadList();
		event.preventDefault();
	}

	handleChange(event) {
		let completed = !this.state.completed;
	    let {date, todo} = this.props;
	    this.setState({completed});
	    //This requests the API and updates the the completed status
	    request('http://localhost:3000/update/' + date + '/' + completed  + '/' + todo).then(resp => {
	        console.log(resp);
	        this.props.loadList();
	    });
	}

	render() {

		let {todo, date} = this.props;
	    let now = moment(date).format('MMMM Do YYYY, h:mm:ss a');

		return (
			<div style={styles.placeholder} className="input-group">
				<h4><input value={date} type="checkbox" checked={this.state.completed} onChange={this.handleChange}></input> {todo} </h4>
				<hr style={styles.smallMargin} />
				<h5>Created On: {now} <button style={styles.removeButton} type="button" value={date} className="btn btn-secondary" onClick={this.handleButton}>✖</button></h5>			
			</div>
		);
	}
}

// Main component, holds the lists and the form
class ListHolder extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			todos: []
		};

		this.loadList = this.loadList.bind(this);
		this.handleSubmit = this.handleSubmit.bind(this);

	}

	loadList() {
		request('http://localhost:3000/get/all').then(todos => this.setState({todos: JSON.parse(todos)}));
	}

	componentDidMount() {
		this.loadList();
	}

	handleSubmit(event) {
		let todo = this.inputElement.value;

		if (todo)
			request('http://localhost:3000/save/' + todo).then(response => {
				console.log('saved');
			});
		this.loadList();
		this.inputElement.value = "";
		event.preventDefault();
	}

	render() {
		let {todos} = this.state;
		let completedtodos = todos.filter(todo => todo.completed);
    	todos = todos.filter(todo => !todo.completed);
    	console.log(completedtodos);
		return (
			<div>
				<h3 className="text-center">ToDo's</h3>
				<form style={styles.center} className="input-group" onSubmit={this.handleSubmit}>
					<span className="input-group-btn">
						<button className="btn btn-secondary" type="button" onClick={this.handleSubmit}>Save</button>
					</span>
                    <input className="form-control" type="text" ref={inputElement => this.inputElement = inputElement}  placeholder="Enter Reminder" />
                </form>
				{todos.length >= 1 && <h3 className="text-center">Remainders</h3>}
				{todos.map(({todo, completed, date}) => <div key={date} style={styles.center}>
					<TodoBox date={date} completed={completed} todo={todo} loadList={this.loadList} />
				</div>)}

				{completedtodos.length >= 1 && <h3 className="text-center">Completed</h3>}

				{completedtodos.map(({todo, completed, date}, index) => 

				<div style={styles.center} key={date}>
					<CompletedBox date={date} completed={completed} todo={todo} loadList={this.loadList} />
				</div>)}
		
			</div>
		);
	}

}

ReactDOM.render(
  <ListHolder />,
  document.getElementById('root')
);
