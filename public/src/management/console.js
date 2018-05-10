import React from 'react';
import ReactDOM from 'react-dom';
import { BrowserRouter, Route } from 'react-router-dom';
import * as $ from 'jquery';
import './styles/loader.scss';
import './styles/style.scss';

import {Navbar} from './console/Navbar';
import {Home} from './console/Home';
import {Navigation} from './console/Navigation';
import {Blogs} from './console/Blogs';

function renderPage (isSuperAdmin = false, canAccessUsers = false, canAccessBlogs = []) {
    ReactDOM.render(<BrowserRouter basename='/admin'>
        <App isSuperAdmin={isSuperAdmin} canAccessUsers={canAccessUsers} canAccessBlogs={canAccessBlogs}/>
    </BrowserRouter>, document.querySelector('div#root'));
}

const App = (props) => (
    <div>
        <Navbar isSuperAdmin={props.isSuperAdmin} canAccessUsers={props.canAccessUsers} canAccessBlogs={props.canAccessBlogs}/>
        <div className='container super-container'>
            <Route exact path="/" component={Home}/>
            <Route exact path="/navigation" render={() => <Navigation/>}/>
            <Route exact path="/blogs" render={() => <Blogs isSuperAdmin={props.isSuperAdmin} canAccessBlogs={props.canAccessBlogs}/>}/>
        </div>
    </div>
);

$.get('/admin/api/user/profile', function (res) {
    const user = res.data;
    console.log(user);
    renderPage(user.isSuperAdmin, user.canAccessUsers, user.canAccessBlogs);
});
