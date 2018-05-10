import React from 'react';
import {Link} from 'react-router-dom';

export class Navigation extends React.Component {
    componentDidMount () {
        $.get('/admin/api/navigation', (response) => {
            console.log('get', response);
            this.setState({loading: false, blogs: response.data});
        });
    }

    render () {
        console.log(this.props);
        var list = <div className='row'>
            <div className='col-sm-12 section-header'>
                <div className='row'>
                    <div className='col-sm-10'>
                        <h1>Navigation Items</h1>
                    </div>
                    <div className='col-sm-2'>
                        <button type='button' className='float-right btn btn-sm btn-primary' data-toggle='modal' data-target='#create-blog' onClick={() => this.setState({edittingBlog: undefined})}>
                        Create Navigation
                        </button>
                    </div>
                </div>
            </div>
            <div className='col-sm-12'>
            </div>
        </div>;

        return list;
    }
}
