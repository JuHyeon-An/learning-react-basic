// 서버 시작하면 제일 먼저 실행되는 시작점
const express = require('express')
const app = express()
const port = 4000

const mongoose = require('mongoose')
mongoose.connect('mongodb+srv://ellen:1@cluster0.umdgb.mongodb.net/myFirstDatabase?retryWrites=true&w=majority', {
    useNewUrlParser: true, useUnifiedTopology: true, useCreateIndex: true, useFindAndModify: false
}).then(() => console.log('MongoDB connected..'))
  .catch(err => console.log(err))

app.get('/', (req, res) => {
  res.send('안녕하세요!')
})

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`)
})


