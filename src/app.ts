import express from "express";
import couchbase from "couchbase";

const cluster = new couchbase.Cluster("couchbase://127.0.0.1", {
  username: "Administrator",
  password: "123456",
});

const bucket = cluster.bucket("todo");
const coll = bucket.defaultCollection();

const app = express();

var bodyParser = require("body-parser");
app.use(bodyParser.json());

type todoInterface = {
  id: number;
  text: string;
  complete: boolean;
};

let number = 0;

let todoRepositry: todoInterface[] = [];

// upsert data to db
const upsertDocument = async (doc: todoInterface) => {
  try {
    const key = `${doc.id}`;
    const result = await coll.upsert(key, doc);
    console.log('aaaa'+result);
    return result;
  } catch (error) {
    console.error(error);
  }
};

// get data from db
const getData = async (key: String) => {
  try {
    const result = await coll.get(key);
    console.log("aaaa" + result);
    return result;
  } catch (error) {
    console.error(error);
  }
};

// remove data from db
const removeData = async (key: String) => {
  try {
    const result = await coll.remove(key);
    console.log('aaaa'+result)
    return result;
  } catch (error) {
    console.error(error);
  }
};

// update data
const updateData = async (key: String, doc: todoInterface) => {
  try {
    const text = `${doc.text}`;
    const complete = `${doc.complete}`;
    const result = await coll.mutateIn(key, [
      couchbase.MutateInSpec.replace("text", text),
      couchbase.MutateInSpec.replace("complete", complete),
    ]);
    console.log("bbbbb" + result);
    return result;
  } catch (error) {
    console.error(error);
  }
};

// get all data
const getAllData = async () => {
  const query = ` SELECT * FROM todo `;
  try {
    let data = await cluster.query(query);
    console.log(data);
    let result = data.rows.map((row: object) => {
      return row;
    });
    return result;
  } catch (error) {
    console.error(error);
  }
};

// search from text
const ftsMatchPhrase = async (phrase: any) => {
  try {
    return await cluster.searchQuery(
      "text",
      couchbase.SearchQuery.matchPhrase(phrase),
      { limit: 10 }
    );
  } catch (error) {
    console.error(error);
  }
};

app.get("/search", (req, res) => {
  (async () => {
    const query = req.query.q;
    const todo = await ftsMatchPhrase(query);
    if (!todo) return res.status(400).send({ msg: "mai mee ja" });
    const result = todo.rows.map((e: any) => {
      return e;
    });
    res.send(result);
  })();
});

app.get("/", (req, res) => {
  (async () => {
    const todo = await getAllData();
    console.log(todo);
    res.send(todo);
  })();
});

app.get("/:id", (req, res) => {
  const id = req.params.id;
  (async () => {
    const todo = await getData(id);
    if (!todo) return res.status(400).send({ msg: "error ja" });
    res.send(todo.value);
  })();
});

app.post("/", (req, res) => {
  const { id, text, complete } = req.body;
  number += 1;
  if (id || complete != undefined)
    return res.status(400).send({ msg: "error ja" });
  const todoRepositry = {
    id: number,
    text: text,
    complete: false,
  };
  upsertDocument(todoRepositry);
  res.send(todoRepositry);
});

app.delete("/:id", (req, res) => {
  const id = req.params.id;
  (async () => {
    const todo = await removeData(id);
    if (!todo) return res.status(400).send({ msg: "error ja" });
    res.send({ msg: "delete ja" });
  })();
});

app.patch("/:id", (req, res) => {
  const { id, text, complete, exist } = req.body;
  const n = req.params.id;
  (async () => {
    const todo = await getData(n);
    if (!todo) return res.status(400).send({ msg: "error ja eiei" });
    todo.content.exist = exist || todo.exist;
    todo.content.text = text || todo.text;
    todo.content.complete = complete != undefined ? complete : todo.complete;
    updateData(n, todo.value);
    res.send(todo.value);
  })();
});

app.listen(8000, () => console.log("Surver running"));
