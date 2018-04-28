import * as $ from 'jquery';

document.login.onsubmit = function (e) {
    e.preventDefault();
    $.post('/admin/login', { username: 'admin', password: 'admin' }, function (err, data) {
        console.log(err, data);
    });
};
