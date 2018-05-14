import * as $ from 'jquery';

document.login.onsubmit = function (e) {
    e.preventDefault();
    $.post('/admin/login', { username: document.login.username.value, password: document.login.password.value }, function (data) {
        if (data.user) {
            document.location.reload();
        }
    });
};
