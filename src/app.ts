import express, { Application, Request, Response } from 'express';

const app: Application = express();

var bodyParser = require('body-parser')
// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }))
// parse application/json
app.use(bodyParser.json())

let todoRepositry = [{
    "id": 1,
    "text": "Hello",
    "complete": true
},{
    "id": 2,
    "text": "Hi",
    "complete": false
},{
    "id": 3,
    "text": "Ei",
    "complete": true
}]

app.get('/', (req: Request, res: Response) => {
    res.send(todoRepositry);
});

app.get('/:id', (req: Request, res: Response) => {
    const todo = todoRepositry.find(m => m.id === parseInt(req.params.id));
    //let id = todoRepositry[1].id
    if (todo) {
        res.send(todo);  
    }
    else {
        res.json({
            status: 400,
            message: "HTTP status 400"
        });
    }
});

app.post('/', (req: Request, res: Response) => {
    const reqId = req.body.id;
    const reqText = req.body.text;
    const reqComplete = req.body.complete;
    if (reqId || reqComplete != null || !reqText){
        res.json({
            status: 400,
            message: "HTTP status 400"
        });
    }
    else{
        let todo = {
            "id": todoRepositry.length + 1,
            "text": reqText,
            "complete": false
        };

        todoRepositry.push(todo);
        res.send(todoRepositry);
    }

});

app.delete('/:id', (req: Request, res: Response) => {
    const todo = todoRepositry.find(m => m.id === parseInt(req.params.id));
    if (todo) {
        const index = todoRepositry.indexOf(todo);
        todoRepositry.splice(index, 1);
        res.send(todoRepositry);
    }
    else {
        res.json({
            status: 400,
            message: "HTTP status 400"
        });
    }
});

app.patch('/:id', (req: Request, res: Response) => {
    let reqText = req.body.text;
    let reqComplete = req.body.complete;
    const todo = todoRepositry.find(m => m.id === parseInt(req.params.id));
    if (todo) {
        if (reqText != null) todo.text = reqText;
        if (reqComplete != null) todo.complete = reqComplete; 
        res.send(todoRepositry);
    }
    else {
        res.json({
            status: 400,
            message: "HTTP status 400"
        });
    }
});

app.listen(3000, () => console.log('Surver running'));