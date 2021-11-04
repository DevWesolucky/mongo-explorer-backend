Steps to run example.

Run mongo container
```
docker run --name mongo-container -p 27017:27017 -d mongo
```

Ensure mongo container is running
```
docker ps -a
```

Install dependencies
```
npm i
```

Transpile
```
npm run transpile
```

Run app
```
npm start
```

Success output
```
MongoClient connecting....
Express listen at port 5000
MongoClient state: CONNECTED
```

Clone and run [Frontend app](https://github.com/DevWesolucky/mongo-explorer-front)