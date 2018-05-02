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

function renderPage (isSuperAdmin, roles) {
    ReactDOM.render(<BrowserRouter basename='/admin'>
        <App isSuperAdmin={isSuperAdmin} roles={roles}/>
    </BrowserRouter>, document.querySelector('div#root'));
}

const App = (props) => (
    <div>
        <Navbar isSuperAdmin={props.isSuperAdmin} roles={props.roles}/>
        <div className='container super-container'>
            <Route exact path="/" component={Home}/>
            <Route exact path="/navigation" render={() => <Navigation isSuperAdmin={props.isSuperAdmin} roles={props.roles.map(d => d.permissions)}/>}/>
            <Route exact path="/blogs" render={() => <Blogs/>}/>
        </div>
    </div>
);

$.get('/admin/api/user/profile', function (res) {
    const user = res.data;
    console.log(user);
    renderPage(user.isSuperAdmin, user.roles);
});
