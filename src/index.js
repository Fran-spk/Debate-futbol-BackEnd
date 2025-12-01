import express from 'express';

const port = 300;
const app = express();


app.get(('/'),(req,res)=>{
    res.send('hello word');
})

app.listen(port,()=>{
    console.log('server running');
})