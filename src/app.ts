import express from 'express';

const app = express();

var bodyParser = require('body-parser')
app.use(bodyParser.json())

type todoInterface = {
    "id": number,
    "text": string,
    "complete": boolean
}

let number = 0;

let todoRepositry: todoInterface[] = []

app.get('/', (req, res) => {
    res.send(todoRepositry);
});

app.get('/:id', (req, res) => {
    const todo = todoRepositry.find(m => m.id === parseInt(req.params.id));
    if (!todo) return res.status(400).send({msg: 'error ja'});
    res.send(todo);
});

app.post('/', (req, res) => {
    const {id, text, complete} = req.body
    number += 1;
    if(id || complete != undefined) return res.status(400).send({msg: 'error ja'});
    const todo = {
        "id": number,
        "text": text,
        "complete": false
    };
    todoRepositry.push(todo);
    res.send(todoRepositry);
});

app.delete('/:id', (req, res) => {
    const todo = todoRepositry.find(m => m.id === parseInt(req.params.id));
    if(!todo) return res.status(400).send({msg: 'error ja'});
    const index = todoRepositry.indexOf(todo);
    todoRepositry.splice(index, 1);
    res.send(todoRepositry);
});

app.patch('/:id', (req, res) => {
    const {text, complete} = req.body
    const todo = todoRepositry.find(m => m.id === parseInt(req.params.id));
    if(!todo) return res.status(400).send({msg: 'error ja eiei'});
    todo.text = text || todo.text
    todo.complete = complete != undefined ? complete: todo.complete
    res.send(todoRepositry);
});

app.listen(3000, () => console.log('Surver running'));
