// 서버 시작하면 제일 먼저 실행되는 시작점
const express = require('express')
const app = express()
const port = 4000
const bodyParser = require("body-parser");

const config = require('./config/key');

const { User } = require("./models/User");

// bodyparser가 클라이언트에서 오는 정보를 서버에서 분석하여 가져올 수 있게

// application/x-www-form-urlencoded로 된 타입을 분석해서 가져올 수 있게 함
app.use(bodyParser.urlencoded({extended: true}));

// application/json 타입으로 된 데이터를 가져올 수 있게
app.use(bodyParser.json());

const mongoose = require('mongoose')

mongoose.connect(config.mongoURI, {
    useNewUrlParser: true, useUnifiedTopology: true, useCreateIndex: true, useFindAndModify: false
}).then(() => console.log('MongoDB connected..'))
  .catch(err => console.log(err))

app.get('/', (req, res) => {
  res.send('노드몬이 변경을 감지할까')
})

app.post('/register', (req, res) => {

  //회원가입할때 필요한 정보들을 client에서 가져오면 그것들을 데이터 베이스에 넣어준다.

  // json 형식으로 들어있을 것 (bodyParser로 받음)
  const user = new User(req.body);

  // 몽고DB 메소드
  user.save((err, userInfo) => {
      if(err) return res.json({ success : false, err})
      return res.status(200).json({
        success:true
      })
    })

})

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`)
})


