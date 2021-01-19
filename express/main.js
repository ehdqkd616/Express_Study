// const는 상수, 변하지 않을 데이터, 'express' 모듈을 담은 express라는 데이터는 변하지 않을 것이다.
// const express = require('express'); // express 모듈 로드
// const app = express();

var express = require('express'); // express 모듈 로드
var app = express(); // express 함수를 호출하여 리턴값을 app에 넣음
var fs = require('fs'); // File System 모듈 로드  -> topic.js 로 복사
// var path = require('path'); // path 모듈 로드 -> topic.js 로 옮김
// var qs = require('querystring'); // querystring 모듈 로드  
var bodyParser = require('body-parser'); // body-parser 모듈 로드
// var sanitizeHtml = require('sanitize-html'); // sanitize-html 모듈 로드 -> topic.js 로 옮김
var compression = require('compression'); // compression 모듈 로드
// var template = require('./lib/template.js'); // template 모듈 로드 (express/lib 경로에 있는 template.js) -> topic.js 로 복사
var helmet = require('helmet'); // helmet 모듈 로드 (보안 관련 모듈)
app.use(helmet()); // helmet 모듈 적용

var indexRouter = require('./routes/index'); // index 모듈 로드 (routes 경로에 있는 index.js), / 라우팅 처리
var topicRouter = require('./routes/topic'); // topic 모듈 로드 (routes 경로에 있는 topic.js), topic 라우팅 처리

app.use(express.static('public')); // public 디럭터리 안에서 static 파일을 찾겠다. static 파일을 public 디렉터리에 맵핑
// parse application/x-www-form-urlencoded
// 사용자가 보낸 post 데이터를 분석하여 내부적으로 parameter를 파씽하여 body라는 객체에 넣어줌
app.use(bodyParser.urlencoded({ extended: false }));
app.use(compression()); // compression 이라는 모듈을 호출하면 미들웨어를 리턴하고 app.use 함수를 통해 장착된다.
// app.use(function (request, response, next) { // 미들웨어 생성
app.get('*', function (request, response, next) { // 두번째 인자로 전달된 콜백 함수가 바로 미들웨어이다.
  fs.readdir('./data', function (error, filelist) {
    request.list = filelist;
    next(); // next()를 호출해야 다음 미들웨어로 넘어간다.
    // next('route') // 다음 라우터로
    // next(error) // 다음 핸들러로
  }); // 공통적으로 사용되는 부분이 겹칠 때, 그 함수를 middleware로 만들어서 사용한다.
});

app.use('/', indexRouter); // Controller Mapping 과 같은 역할 / 을 routes의 index.js 와 연결
// app.use(언자1(path), 인자2(callback함수)) 즉 topicRouter는 모듈로서 동작하고, 하나의 큰 함수로 볼 수 있다.
app.use('/topic', topicRouter); // Controller Mapping 과 같은 역할 /topic 을 routes의 topic.js 와 연결
// router로 /topic 을 설정하면 topic.js 안의 router에서 /topic 들은 전부 제거해야 함.

// // route, routing
// // app.get('/', (req, res) => res.send('Hello World!')); // ES6 표현식
// app.get('/', function (request, response) { // 이 부분이 Controller의 RequestMapping과 같은 기능을 하는 부분이다. 
//   // fs.readdir('./data', function (error, filelist) {
//   var title = 'Welcome';
//   var description = 'Hello, Node.js';
//   var list = template.list(request.list);
//   var html = template.HTML(title, list,
//     `
//     <h2>${title}</h2>${description}
//     <img src="/images/piano.jpg" style="width:300px; display:block; margin-top:10px;">`,
//     `<a href="/topic/create">create</a>`
//   );
//   response.send(html);
// });



// create_process 글쓰기
// app.post('/create_process', function(request, response){ // post 방식
//   var body = '';
//   request.on('data', function (data) {
//     body = body + data;
//   });
//   request.on('end', function () {
//     var post = qs.parse(body);
//     var title = post.title;
//     var description = post.description;
//     fs.writeFile(`data/${title}`, description, 'utf8', function (err) {
//       response.redirect('/page/' + title);
//     })
//   });
// });

// // update_process 업데이트
// app.post('/update_process', function (request, response) { // post 방식
//   var body = '';
//   request.on('data', function (data) {
//     body = body + data;
//   });
//   request.on('end', function () {
//     var post = qs.parse(body);
//     var id = post.id;
//     var title = post.title;
//     var description = post.description;
//     fs.rename(`data/${id}`, `data/${title}`, function (error) {
//       fs.writeFile(`data/${title}`, description, 'utf8', function (err) {
//         response.redirect('/page/' + title);  // redirect 하는 법
//       })
//     });
//   });
// });

// // delete_process 글 삭제
// app.post('/delete_process', function (request, response) { // post 방식
//   var body = '';
//   request.on('data', function (data) {
//     body = body + data; // callback 함수가 실행될 때마다 body에 데이터를 추가한다.
//   });
//   request.on('end', function () { // 데이터 수신이 끝났을 때 실행되는 함수.
//     var post = qs.parse(body);  // post로 전송된 데이터들
//     var id = post.id;
//     var filteredId = path.parse(id).base; // 경로를 통해 서버의 디렉토리에 접근하지 못하도록 방지한다.
//     fs.unlink(`data/${filteredId}`, function (error) {
//       response.redirect('/');  // redirect 하는 법
//     });
//   });
// });

// 미들웨어는 순차적으로 실행되기 때문에 에러처리는 맨 마지막에 처리해준다
// 앞의 수 많은 라우팅에서 처리하지 못했을 경우 처리되는 404에러 핸들러
app.use(function(request, response, next){ // error 처리 로직
  response.status(404).send('Sorry can\'t find that!');
});

// error 핸들러
// 이외의 에러가 발생했을 때, 라우팅 단계에서 next(err)를 호출하여 오류처리 미들웨어로 처리해준다.
app.use(function (err, req, res, next){ // err 발생 시 next(err) 는 무조건 이 메서드를 호출한다. 
  console.error(err.stack);
  res.status(500).send('Something broke!');
});


// listen 메소드 실행시 서버가 실행된다.
// app.listen(3000, () => console.log('Example app listening on port 3000!')); // ES6 표현식
app.listen(3000, function () {
  console.log('Example app listening on port 3000!'); // ES5 이하 표현식
}); 



// main.js 는 Controller의 Controller 역할을 한다
// main.js 자체가 서버가 된다.