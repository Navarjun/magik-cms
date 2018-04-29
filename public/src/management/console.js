import React from 'react';
import ReactDOM from 'react-dom';
import { BrowserRouter, Route } from 'react-router-dom';

import {Navbar} from './console/Navbar';
import {Home} from './console/Home';

function renderPage () {
    ReactDOM.render(<BrowserRouter basename='/admin'>
        <App/>
    </BrowserRouter>, document.querySelector('div#root'));
}

const App = () => (
    <div>
        <Navbar/>
        <div className='container'>
            <Route exact path="/" component={Home}/>
        </div>
    </div>
);

renderPage();
