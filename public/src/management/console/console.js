import React from 'react';
import ReactDOM from 'react-dom';
import { BrowserRouter, Route } from 'react-router-dom';
import * as $ from 'jquery';
import '../styles/loader.scss';
import '../styles/style.scss';
import '../styles/dashboard.scss';

import {Topbar} from './Topbar';
import {Navbar} from './Navbar';
import {Navigation} from './Navigation';
import {Blogs} from './Blogs';
import {Pages} from './Pages/Pages';
import {PageEditor} from './Pages/PageEditor';

function renderPage (isSuperAdmin = false, canAccessUsers = false, canAccessBlogs = []) {
    ReactDOM.render(<BrowserRouter basename='/admin'>
        <App isSuperAdmin={isSuperAdmin} canAccessUsers={canAccessUsers} canAccessBlogs={canAccessBlogs}/>
    </BrowserRouter>, document.querySelector('div#root'));
}

const App = (props) => (
    <div>
        <Topbar/>
        <div className='container-fluid'>
            <div className='row'>
                <Navbar/>
                <main role="main" className="col-md-9 ml-sm-auto col-lg-10 px-4">
                    <Route exact path="/navigation" render={() => <Navigation/>}/>
                    <Route exact path="/blogs" render={() => <Blogs isSuperAdmin={props.isSuperAdmin} canAccessBlogs={props.canAccessBlogs}/>}/>
                    <Route exact path="/pages" render={() => <Pages/>}/>
                    <Route exact path="/page/:id" render={(data) => {
                        console.log(data.match);
                        return <PageEditor id={data.match.params.id}/>;
                    }}/>
                </main>
            </div>
        </div>
    </div>
);

$.get('/admin/api/user/profile', function (res) {
    const user = res.data;
    console.log(user);
    renderPage(user.isSuperAdmin, user.canAccessUsers, user.canAccessBlogs);
});
