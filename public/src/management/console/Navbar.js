import React from 'react';
import {Link} from 'react-router-dom';

export class Navbar extends React.Component {
    render () {
        return (
            <div className='navbar navbar-expand-lg navbar-dark bg-dark'>
                <Link className='navbar-brand' to='/'>Magik CMS</Link>
                <button className='navbar-toggler' type='button' data-toggle='collapse' data-target='#navbarSupportedContent' aria-controls='navbarSupportedContent' aria-expanded='false' aria-label='Toggle navigation'>
                    <span className='navbar-toggler-icon'></span>
                </button>

                <div className='collapse navbar-collapse' id='navbarSupportedContent'>
                    <ul className='navbar-nav mr-auto'>
                        <li>
                            <Link className='nav-link' to='/navigation'>Site Map</Link>
                        </li>
                        <li className='nav-item'>
                            <Link className='nav-link' to='/blogs'>Blogs</Link>
                        </li>
                        <li className='nav-item'>
                            <Link className='nav-link' to='/galleries'>Galleries</Link>
                        </li>
                        <li className='navItem'>
                            <Link className='nav-link' to='/pages'>Static pages</Link>
                        </li>
                        <li className='navItem'>
                            <Link className='nav-link' to='/containers'>Containers</Link>
                        </li>
                        <li>
                            <Link className='nav-link' to='/users'>Users</Link>
                        </li>
                        <li>
                            <Link className='nav-link' to='/roles'>Roles</Link>
                        </li>
                    </ul>
                </div>
            </div>
        );
    }
}
