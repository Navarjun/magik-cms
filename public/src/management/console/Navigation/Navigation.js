/* global $,confirm */
import React from 'react';
import _ from 'lodash';
import Dropdown from 'react-dropdown';
import 'react-dropdown/style.css';

export class Navigation extends React.Component {
    constructor (props) {
        super(props);
        this.state = { navigations: [], options: {}, loading: true, creatingNew: false, editingNavigation: null, creatingNewMessage: null, shouldUpdateNavigations: true };
        this.getNavigations = this.getNavigations.bind(this);
        this.createNavigation = this.createNavigation.bind(this);
        this.updateNavigation = this.updateNavigation.bind(this);
        this.deleteApproved = this.deleteApproved.bind(this);
        this.handleInputChange = this.handleInputChange.bind(this);
    }
    componentDidMount () {
        if (this.state.shouldUpdateNavigations) {
            this.setState({ loading: true, shouldUpdateNavigations: false });
            this.getNavigations();
        }
    }
    componentDidUpdate () {
        if (this.state.shouldUpdateNavigations) {
            this.setState({ loading: true, shouldUpdateNavigations: false });
            this.getNavigations();
        }
    }

    getNavigations () {
        $.ajax({
            method: 'GET',
            url: '/admin/api/navigation',
            dataType: 'json',
            mimeType: 'application/json',
            success: (response) => {
                console.log(response);
                this.setState({loading: false, navigations: response.navigations, shouldUpdateNavigations: false});
            }
        });
        $.ajax({
            method: 'GET',
            url: '/admin/api/navOptions',
            dataType: 'json',
            mimeType: 'application/json',
            success: (response) => {
                console.log(response);
                this.setState({options: response});
            }
        });
    }

    createNavigation (e) {
        e.preventDefault();
        if (
            (this.state.creatingNew && (this.state.creatingNew.title === '')) ||
            (this.state.editingNavigation && (this.state.editingNavigation.title === ''))
        ) {
            this.setState({ creatingNewMessage: 'Title cannot be empty' });
        } else {
            this.setState({loading: true, shouldUpdateNavigations: false});
            $.ajax({
                method: 'PUT',
                url: '/admin/api/navigation',
                dataType: 'json',
                mimeType: 'application/json',
                data: this.state.creatingNew,
                success: (response) => {
                    console.log(response);
                    this.setState({loading: false, navigations: this.state.navigations.concat([response.navigation]), shouldUpdateNavigations: false, creatingNew: false});
                }
            });
        }
    }

    updateNavigation (e) {
        e.preventDefault();
        if (
            (this.state.creatingNew && (this.state.creatingNew.title === '' || this.state.creatingNew.navigationURI === '')) ||
            (this.state.editingNavigation && (this.state.editingNavigation.title === '' || this.state.editingNavigation.navigationURI === ''))
        ) {
            this.setState({ creatingNewMessage: 'Title and/or URL cannot be empty' });
        } else {
            this.setState({loading: true, shouldUpdateNavigations: false});
            $.ajax({
                method: 'POST',
                url: '/admin/api/navigation',
                dataType: 'json',
                mimeType: 'application/json',
                data: this.state.editingNavigation,
                success: (response) => {
                    console.log(response);
                    const navigations = this.state.navigations.map(d => {
                        return d._id === this.state.editingNavigation._id ? this.state.editingNavigation : d;
                    });

                    this.setState({loading: false, navigations: navigations, shouldUpdateNavigations: false, creatingNew: false, editingNavigation: null});
                }
            });
        }
    }

    deleteApproved (navigation) {
        this.setState({loading: true, shouldUpdateNavigations: false});
        $.ajax({
            method: 'DELETE',
            url: '/admin/api/navigation',
            dataType: 'json',
            mimeType: 'application/json',
            data: {
                id: navigation._id
            },
            success: (response) => {
                console.log(response);
                this.setState({loading: false, shouldUpdateNavigations: true, creatingNew: false});
            }
        });
    }

    render () {
        const navigationsList = this.state.navigations.length
            ? <div className='list-group'>
                {
                    this.state.navigations.map((d, i) => {
                        return <div key={i} className='list-group-item'>
                            <span className='lead'>{d.title}</span>
                            <div className='float-right'>
                                <div className='btn-group'>
                                    <button type='button' className='btn btn-sm btn-outline-info' onClick={(e) => {
                                        e.preventDefault();
                                        this.setState({editingNavigation: d});
                                    }}>Edit</button>
                                    <button type='button' className='btn btn-sm btn-outline-danger' onClick={(e) => {
                                        e.preventDefault();
                                        if (confirm('Do you really want to delete the navigation: ' + d.title + '?')) {
                                            this.deleteApproved(d);
                                        }
                                    }}>Delete</button>
                                </div>
                            </div>
                        </div>;
                    })
                }
            </div>
            : <h4>There are no navigations tabs</h4>;

        var form;
        // CREATING EDITTING FORM
        {
            if (this.state.creatingNew) {
                var idFormOptions, idForm;
                idFormOptions = this.state.options[this.state.creatingNew.type + 's'].map(d => {
                    return {value: d._id, label: d.title};
                });

                switch (this.state.creatingNew.type) {
                case 'blog':
                    idForm = <Dropdown options={idFormOptions} onChange={this._onSelectId.bind(this)} value={this.state.creatingNew.blogId} placeholder="Select a blog" />;
                    break;
                case 'page':
                    idForm = <Dropdown options={idFormOptions} onChange={this._onSelectId.bind(this)} value={this.state.creatingNew.pageId} placeholder="Select a page" />;
                    break;
                case 'container':
                    idForm = <Dropdown options={idFormOptions} onChange={this._onSelectId.bind(this)} value={this.state.creatingNew.containerId} placeholder="Select a container" />;
                    break;
                }

                form = <form className='mt-4 card card-body' id='navigation-creation' onSubmit={this.createNavigation}>
                    {
                        this.state.creatingNewMessage
                            ? <div className='alert alert-danger'>{this.state.creatingNewMessage}</div>
                            : null
                    }
                    <div className='form-group'>
                        <label htmlFor='navigation-title'>Title</label>
                        <input type='text' name='title' className='form-control' id='navigation-title' placeholder='Title' value={this.state.creatingNew.title} onChange={this.handleInputChange}/>
                        <small className='form-text text-muted'>This is appear as title of the tab, and in the navigation bar of the website.</small>
                    </div>
                    <div className='form-group'>
                        <label htmlFor='navigation-title'>Type</label>
                        <Dropdown options={['blog', 'page', 'container']} onChange={this._onSelect.bind(this)} value={this.state.creatingNew.type} placeholder="Select an option" />
                    </div>
                    <div className='form-group'>
                        <label htmlFor='navigation-title'>Pick one:</label>
                        {idForm}

                    </div>
                    <button type='submit' className='btn btn-primary'>Submit</button>
                    <button type='button' className='mt-2 btn btn-sm btn-outline-secondary' onClick={() => { this.setState({shouldUpdateNavigations: false, creatingNew: false, creatingNewMessage: null}); }}>Cancel</button>
                </form>;
            } else if (this.state.editingNavigation) {
                // var idFormOptions, idForm; // DECLARED EARLIER AS WELL
                idFormOptions = this.state.options[this.state.editingNavigation.type + 's'].map(d => {
                    return {value: d._id, label: d.title};
                });

                switch (this.state.editingNavigation.type) {
                case 'blog':
                    idForm = <Dropdown options={idFormOptions} onChange={this._onSelectId.bind(this)} value={this.state.editingNavigation.blogId} placeholder="Select a blog" />;
                    break;
                case 'page':
                    idForm = <Dropdown options={idFormOptions} onChange={this._onSelectId.bind(this)} value={this.state.editingNavigation.pageId} placeholder="Select a page" />;
                    break;
                case 'container':
                    idForm = <Dropdown options={idFormOptions} onChange={this._onSelectId.bind(this)} value={this.state.editingNavigation.containerId} placeholder="Select a container" />;
                    break;
                }

                form = <form className='mt-4 card card-body' id='navigation-creation' onSubmit={this.updateNavigation}>
                    {
                        this.state.creatingNewMessage
                            ? <div className='alert alert-danger'>{this.state.creatingNewMessage}</div>
                            : null
                    }
                    <div className='form-group'>
                        <label htmlFor='navigation-title'>Title</label>
                        <input type='text' name='title' className='form-control' id='navigation-title' placeholder='Title' value={this.state.editingNavigation.title} onChange={this.handleInputChange}/>
                        <small className='form-text text-muted'>This is appear as title of the tab, and in the navigation bar of the website.</small>
                    </div>
                    <div className='form-group'>
                        <label htmlFor='navigation-title'>Type</label>
                        <Dropdown options={['blog', 'page', 'container']} onChange={this._onSelect.bind(this)} value={this.state.editingNavigation.type} placeholder="Select an option" />
                    </div>
                    <div className='form-group'>
                        <label htmlFor='navigation-title'>Pick one:</label>
                        {idForm}
                    </div>
                    <button type='submit' className='btn btn-primary'>Submit</button>
                    <button type='button' className='mt-2 btn btn-sm btn-outline-secondary' onClick={() => { this.setState({shouldUpdateNavigations: false, creatingNew: null, creatingNewMessage: null, editingNavigation: null}); }}>Cancel</button>
                </form>;
            } else {
                form = <button className='mt-4 form-control btn btn-sm btn-primary' onClick={() => { this.setState({creatingNew: {title: '', type: 'blog'}, shouldUpdateNavigations: false}); }}>Create Navigation</button>;
            }
        }

        return <div id='navigations' className='navigation'>
            <div className='row'>
                <div className='col-md-12 header'>
                    <h2>Navigations</h2>
                </div>
                <div className='col-md-12'>
                    {navigationsList}
                </div>
                <div className='col-md-12'>
                    {form}
                </div>
            </div>
        </div>;
    }

    handleInputChange (event) {
        const target = event.target;
        const value = target.type === 'checkbox' ? target.checked : target.value;
        const name = target.name;
        const obj = this.state.creatingNew ? _.cloneDeep(this.state.creatingNew) : _.cloneDeep(this.state.editingNavigation);
        obj[name] = value;

        this.setState(this.state.creatingNew ? {creatingNew: obj} : {editingBlog: obj});
    }

    _onSelect (d) {
        const clone = _.cloneDeep(this.state.creatingNew ? this.state.creatingNew : this.state.editingNavigation);
        clone.type = d.value;
        this.setState(this.state.creatingNew ? {creatingNew: clone} : {editingNavigation: clone});
    }
    _onSelectId (d) {
        const clone = _.cloneDeep(this.state.creatingNew ? this.state.creatingNew : this.state.editingNavigation);
        delete clone.blogId;
        delete clone.pageId;
        delete clone.containerId;
        switch (clone.type) {
        case 'blog':
            clone.blogId = d.value;
            break;
        case 'page':
            clone.pageId = d.value;
            break;
        case 'container':
            clone.containerId = d.value;
            break;
        }
        this.setState(this.state.creatingNew ? {creatingNew: clone} : {editingNavigation: clone});
    }
}
