// 서버 시작하면 제일 먼저 실행되는 시작점
const express = require('express')
const app = express()
const port = 4000
const bodyParser = require("body-parser");
const cookieParser = require('cookie-parser');
const config = require('./config/key');
var jwt = require('jsonwebtoken');
var token = jwt.sign({ foo: 'bar' }, 'shhhhh');
const { User } = require("./models/User");
const { auth } = require("./middleware/auth");

// bodyparser가 클라이언트에서 오는 정보를 서버에서 분석하여 가져올 수 있게

// application/x-www-form-urlencoded로 된 타입을 분석해서 가져올 수 있게 함
app.use(bodyParser.urlencoded({extended: true}));

// application/json 타입으로 된 데이터를 가져올 수 있게
app.use(bodyParser.json());
app.use(cookieParser());

const mongoose = require('mongoose')

mongoose.connect(config.mongoURI, {
    useNewUrlParser: true, useUnifiedTopology: true, useCreateIndex: true, useFindAndModify: false
}).then(() => console.log('MongoDB connected..'))
  .catch(err => console.log(err))

app.get('/', (req, res) => {
  res.send('노드몬이 변경을 감지할까')
})

app.post('/api/users/register', (req, res) => {

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

app.post('/api/users/login', (req, res) => {
  // 요청된 이메일이 데이터베이스에서 있는지 찾는다.
  User.findOne({ email : req.body.email }, (err, user) => {
    if(!user) {
      return res.json({
        loginSuccess : false,
        message : "이메일에 해당하는 유저가 없습니다."
      })
    }

    user.comparePassword(req.body.password, (err, isMatch) => {
      // 요청된 이메일이 데이터베이스에 있다면 비밀반호 맞는지 확인
      if(!isMatch)
        return res.json({
          loginSuccess : false,
          message : "비밀번호가 틀렸습니다."
        })
       
        // 비밀번호 맞다면 token 생성
       user.generateToken((err, user) => {
          if(err) return res.status(400).send(err);
          
          // 토큰을 저장한다. 어디에? 쿠키, 로컬 스토리지, 세션 등 => 쿠키에!
          res.cookie("x_auth", user.token)
          .status(200)
          .json({loginSuccess : true, userId : user._id})
       })
      
    });
  })
  

 
})

// role 1 어드민    role 2 특정 부서 어드민 
// role 0 -> 일반유저   role 0이 아니면  관리자 
app.get('/api/users/auth', auth, (req, res) => {
  //여기 까지 미들웨어를 통과해 왔다는 얘기는  Authentication 이 True 라는 말.
  res.status(200).json({
    _id: req.user._id,
    isAdmin: req.user.role === 0 ? false : true,
    isAuth: true,
    email: req.user.email,
    name: req.user.name,
    lastname: req.user.lastname,
    role: req.user.role,
    image: req.user.image
  })
})

app.get('/api/users/logout', auth, (req, res) => {
  // console.log('req.user', req.user)
  User.findOneAndUpdate({ _id: req.user._id },
    { token: "" }
    , (err, user) => {
      if (err) return res.json({ success: false, err });
      return res.status(200).send({
        success: true
      })
    })
})


app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`)
})


