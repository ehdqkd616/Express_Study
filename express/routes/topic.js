var express = require('express'); // Router(Controller)로써 동작하는 JavaScript 파일은 express를 로드해야 한다.
var router = express.Router(); // Router(Controller)로써 동작하는 JavaScript 파일은 express.Router를 호출해야 한다.
var path = require('path'); // path 모듈 로드
var fs = require('fs'); // File System 모듈 로드
var sanitizeHtml = require('sanitize-html'); // sanitize-html 모듈 로드
var template = require('../lib/template.js'); // template 모듈 로드 (express/lib 경로에 있는 template.js)

// create 글쓰기 폼
router.get('/create', function (request, response) {
    // fs.readdir('./data', function (error, filelist) {
    var title = 'WEB - create';
    var list = template.list(request.list);
    var html = template.HTML(title, list, `
            <form action="/topic/create_process" method="post">
              <p><input type="text" name="title" placeholder="title"></p>
              <p>
                <textarea name="description" placeholder="description"></textarea>
              </p>
              <p>
                <input type="submit">
              </p>
            </form>
          `, '');
    response.send(html);
});

// create_process 글쓰기
router.post('/create_process', function (request, response) { // post 방식
    var post = request.body; // body-parser 이용, post로 전송된 데이터들
    var title = post.title;
    var description = post.description;
    fs.writeFile(`data/${title}`, description, 'utf8', function (err) {
        response.redirect('/topic/' + title);
    })
});

// update 글수정 폼
router.get('/update/:pageId', function (request, response) {
    // app.get('/update/:pageId', function (request, response) {
    // fs.readdir('./data', function (error, filelist) {
    var filteredId = path.parse(request.params.pageId).base;
    fs.readFile(`data/${filteredId}`, 'utf8', function (err, description) {
        var title = request.params.pageId;
        var list = template.list(request.list);
        var html = template.HTML(title, list,
            `
          <form action="/topic/update_process" method="post">
            <input type="hidden" name="id" value="${title}">
            <p><input type="text" name="title" placeholder="title" value="${title}"></p>
            <p>
              <textarea name="description" placeholder="description">${description}</textarea>
            </p>
            <p>
              <input type="submit">
            </p>
          </form>
          `,
            `<a href="/topic/create">create</a> <a href="/topic/update/${title}">update</a>`
        );
        response.send(html);
    });
});

// update_process 업데이트
router.post('/update_process', function (request, response) { // post 방식
    var post = request.body;  // body-parser 이용, post로 전송된 데이터들
    var id = post.id;
    var title = post.title;
    var description = post.description;
    fs.rename(`data/${id}`, `data/${title}`, function (error) {
        fs.writeFile(`data/${title}`, description, 'utf8', function (err) {
            response.redirect('/topic/' + title);  // redirect 하는 법
        })
    });
});

// delete_process 글 삭제
router.post('/delete_process', function (request, response) { // post 방식
    var post = request.body; // body-parser 이용, post로 전송된 데이터들
    var id = post.id;
    var filteredId = path.parse(id).base; // 경로를 통해 서버의 디렉토리에 접근하지 못하도록 방지한다.
    fs.unlink(`data/${filteredId}`, function (error) {
        response.redirect('/');  // redirect 하는 법
    });
});

router.get('/:pageId', function (request, response, next) { // url path를 통해서 파라미터를 전달하는 로직.
    // app.get('/page/:pageId', function (request, response, next) { // url path를 통해서 파라미터를 전달하는 로직.
    // fs.readdir('./data', function (error, filelist) { // 미들웨어로 공통 코드 묶음.
    var filteredId = path.parse(request.params.pageId).base;
    fs.readFile(`data/${filteredId}`, 'utf8', function (err, description) {
        if (err) {
            next(err);  // 에러를 던진다. 
        } else { // 정상적으로 작동하였을 때 
            var title = request.params.pageId;
            var sanitizedTitle = sanitizeHtml(title);
            var sanitizedDescription = sanitizeHtml(description, {
                allowedTags: ['h1']
            });
            var list = template.list(request.list);
            var html = template.HTML(sanitizedTitle, list,
                `<h2>${sanitizedTitle}</h2>${sanitizedDescription}`,
                `<a href="/topic/create">create</a>
          <a href="/topic/update/${sanitizedTitle}">update</a>
          <form action="/topic/delete_process" method="post">
            <input type="hidden" name="id" value="${sanitizedTitle}">
            <input type="submit" value="delete">
          </form>`
            );
            response.send(html);
        }
    });
});

module.exports = router;  // topic.js 를 모듈로 만들어서 외부에서 사용할 수 있도록 export 

//   결국 router(Controller)는 하나의 모듈로서 동작한다.
//   모듈은 하나의 거대한 함수, 즉 topic.js 라는 파일은 하나의 큰 함수가 된다.