import React from 'react';
import {Link} from 'react-router-dom';

export class Pages extends React.Component {
    constructor (props) {
        super(props);
        this.state = { pages: [], loading: true, creatingNew: false, creatingNewMessage: null, shouldUpdatePages: true };
        this.getPages = this.getPages.bind(this);
        this.createPage = this.createPage.bind(this);
        this.deleteApproved = this.deleteApproved.bind(this);
    }
    componentDidMount () {
        if (this.state.shouldUpdatePages) {
            this.setState({ loading: true, shouldUpdatePages: false });
            this.getPages();
        }
    }
    componentDidUpdate () {
        if (this.state.shouldUpdatePages) {
            this.setState({ loading: true, shouldUpdatePages: false });
            this.getPages();
        }
    }

    getPages () {
        $.ajax({
            method: 'GET',
            url: '/admin/api/page',
            dataType: 'json',
            mimeType: 'application/json',
            success: (response) => {
                console.log(response);
                this.setState({loading: false, pages: response.pages, shouldUpdatePages: false});
            }
        });
    }

    createPage (e) {
        e.preventDefault();
        if (!e.currentTarget['page-title'].value || e.currentTarget['page-title'].value === '') {
            this.setState({ creatingNewMessage: 'Title cannot be empty' });
        } else {
            this.setState({loading: true, shouldUpdatePages: false});
            $.ajax({
                method: 'PUT',
                url: '/admin/api/page',
                dataType: 'json',
                mimeType: 'application/json',
                data: {
                    title: e.currentTarget['page-title'].value,
                    published: e.currentTarget['page-published'].checked
                },
                success: (response) => {
                    console.log(response);
                    this.setState({loading: false, pages: this.state.pages.concat([response.page]), shouldUpdatePages: false, creatingNew: false});
                }
            });
        }
    }

    deleteApproved (page) {
        this.setState({loading: true, shouldUpdatePages: false});
        $.ajax({
            method: 'DELETE',
            url: '/admin/api/page',
            dataType: 'json',
            mimeType: 'application/json',
            data: {
                id: page._id
            },
            success: (response) => {
                console.log(response);
                this.setState({loading: false, shouldUpdatePages: true, creatingNew: false});
            }
        });
    }

    render () {
        const pagesList = this.state.pages.length
            ? <div className='list-group'>
                {
                    this.state.pages.map((d, i) => {
                        return <Link key={i} to={'/page/' + d._id} className='list-group-item list-group-item-action'>
                            <span className='lead'>{d.title}</span>
                            <div className='float-right btn-group'>
                                <button type='button' className='btn btn-sm btn-outline-info' >Edit</button>
                                <button type='button' className='btn btn-sm btn-outline-danger' onClick={(e) => {
                                    e.preventDefault();
                                    if (confirm('Do you really want to delete the page: ' + d.title + '?')) {
                                        this.deleteApproved(d);
                                    }
                                }}>Delete</button>
                            </div>
                        </Link>;
                    })
                }
            </div>
            : <h4>There are no static pages</h4>;
        return <div id='pages' className='container'>
            <div className='row'>
                <div className='col-md-12 header'>
                    <h2>Static Pages</h2>
                </div>
                <div className='col-md-12'>
                    {pagesList}
                </div>
                <div className='col-md-12'>
                    {
                        this.state.creatingNew
                            ? <form className='mt-4 card card-body' id='page-creation' onSubmit={this.createPage}>
                                {
                                    this.state.creatingNewMessage
                                        ? <div className='alert alert-danger'>{this.state.creatingNewMessage}</div>
                                        : null
                                }
                                <div className='form-group'>
                                    <label htmlFor='page-title'>Title</label>
                                    <input type='text' className='form-control' id='page-title' placeholder='Title'/>
                                    <small id='emailHelp' className='form-text text-muted'>This is appear as title of the tab.</small>
                                </div>
                                <div className='form-check'>
                                    <input type='checkbox' className='form-check-input' id='page-published'/>
                                    <label className='form-check-label' htmlFor='page-published'>Published</label>
                                    <small id='page-published-help' className='form-text text-muted'></small>
                                </div>
                                <button type='submit' className='btn btn-primary'>Submit</button>
                                <button type='button' className='mt-2 btn btn-sm btn-outline-secondary' onClick={() => { this.setState({shouldUpdatePages: false, creatingNew: false, creatingNewMessage: null}); }}>Cancel</button>
                            </form>
                            : <button className='mt-4 form-control btn btn-sm btn-primary' onClick={() => { this.setState({creatingNew: true, shouldUpdatePages: false}); }}>Create Page</button>
                    }
                </div>
            </div>
        </div>;
    }
}
