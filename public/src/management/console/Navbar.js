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
            <nav className="col-md-2 d-none d-md-block bg-light magik-sidebar">
                <div className="magik-sidebar-sticky">
                    <ul className="nav flex-column">
                        {navItems}
                    </ul>
                </div>
            </nav>
        );
    }
}
