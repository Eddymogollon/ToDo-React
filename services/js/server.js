import express from 'express';
import mongoose from 'mongoose';

var app = express();
// Connect with moongose
mongoose.connect('mongodb://localhost/todos');

// Create a model
let todoModel = mongoose.model('todo', {
	todo: String,
	date: {
		type: Date,
		default: Date.now
	},
	completed: {
		type: Boolean,
		default: false
	}
});

// Function to log errors
var logError = (error) => {
	if (error)
		throw error;
};

// Create server
var server = () => {
    app.use(express.static('client/public'));

    // Save todos
    app.get('/save/:todo',function(request, response) {
    	let {todo} = request.params;

    	console.log(todo);

    	new todoModel({todo}).save((error, savedTodo) => {
    		logError(error);
    		response.send(savedTodo);
    	});    
    });

    // Get all todos
    app.get('/get/all', (request, response) => {
        todoModel.find((error, todos) => {
        	logError(error);
        	response.send(todos);
        });
    });

    // Remove todos
    app.get('/remove/:date', (request, response) => {
    	let {date} = request.params;
    	todoModel.remove({date}, (error, deletedTodo) => {
    		logError(error);
    		response.send(deletedTodo);
    	});
    });

    // Update to dos
    app.get('/update/:date/:completed/:todo', (request,response) => {
        let {date, completed, todo} = request.params;
        todoModel.findOneAndUpdate({date}, { completed, todo }, { new: true}, (error, updatedTodo) => {
        	logError(error);
        	response.send(updatedTodo);
        });
    });

    // Listen to server
    app.listen(3000, () => {
        console.log('App listening on port 3000!');
    });
};

export default server;
