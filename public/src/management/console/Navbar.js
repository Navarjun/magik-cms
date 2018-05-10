import React from 'react';
import {Link, NavLink} from 'react-router-dom';

export class Navbar extends React.Component {
    constructor (props) {
        super(props);
        const navOptions = new Set();
        if (props.isSuperAdmin) {
            navOptions.add({ link: '/navigation', name: 'Navigation' });
            navOptions.add({ link: '/blogs', name: 'Blogs' });
            navOptions.add({ link: '/pages', name: 'Static pages' });
            navOptions.add({ link: '/containers', name: 'Containers' });
            navOptions.add({ link: '/users', name: 'Users' });
        } else {
            navOptions.add({ link: '/navigation', name: 'Navigation' });
            navOptions.add({ link: '/blogs', name: 'Blogs' });
            navOptions.add({ link: '/pages', name: 'Static pages' });
            navOptions.add({ link: '/containers', name: 'Containers' });
            if (props.canAccessUsers) {
                navOptions.add({ link: '/users', name: 'Users' });
            }
        }
        this.state = {
            navOptions: [...navOptions]
        };
    }

    render () {
        const navItems = this.state.navOptions.map(d => {
            return <li key={d.link}>
                <NavLink to={d.link} className='nav-link'>{d.name}</NavLink>
            </li>;
        });
        return (
            <div className='navbar navbar-expand-lg navbar-dark bg-dark'>
                <Link className='navbar-brand' to='/'>Magik CMS</Link>
                <button className='navbar-toggler' type='button' data-toggle='collapse' data-target='#navbarSupportedContent' aria-controls='navbarSupportedContent' aria-expanded='false' aria-label='Toggle navigation'>
                    <span className='navbar-toggler-icon'></span>
                </button>

                <div className='collapse navbar-collapse' id='navbarSupportedContent'>
                    <ul className='navbar-nav mr-auto'>
                        {navItems}
                    </ul>
                </div>
            </div>
        );
    }
}
