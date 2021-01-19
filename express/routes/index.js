var express = require('express'); // Router(Controller)로써 동작하는 JavaScript 파일은 express를 로드해야 한다.
var router = express.Router(); // Router(Controller)로써 동작하는 JavaScript 파일은 express.Router를 호출해야 한다.
var template = require('../lib/template.js'); // template 모듈 로드 (express/lib 경로에 있는 template.js)

// route, routing
// app.get('/', (req, res) => res.send('Hello World!')); // ES6 표현식
router.get('/', function (request, response) { // 이 부분이 Controller의 RequestMapping과 같은 기능을 하는 부분이다. 
    // fs.readdir('./data', function (error, filelist) {
    var title = 'Welcome';
    var description = 'Hello, Node.js';
    var list = template.list(request.list);
    var html = template.HTML(title, list,
      `
      <h2>${title}</h2>${description}
      <img src="/images/piano.jpg" style="width:300px; display:block; margin-top:10px;">`,
      `<a href="/topic/create">create</a>`
    );
    response.send(html);
  });

  module.exports = router;

