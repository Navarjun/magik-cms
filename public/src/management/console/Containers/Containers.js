/* global $,confirm */
import React from 'react';
import _ from 'lodash';

import Tags from 'react-tagging-input';
import '../../../../node_modules/react-tagging-input/src/component/scss/styles.scss';

export class Containers extends React.Component {
    constructor (props) {
        super(props);
        this.state = { containers: [], loading: true, creatingNew: false, editingContainer: null, creatingNewMessage: null, shouldUpdateContainers: true };
        this.getContainers = this.getContainers.bind(this);
        this.createContainer = this.createContainer.bind(this);
        this.updateContainer = this.updateContainer.bind(this);
        this.deleteApproved = this.deleteApproved.bind(this);
        this.handleInputChange = this.handleInputChange.bind(this);
    }
    componentDidMount () {
        if (this.state.shouldUpdateContainers) {
            this.setState({ loading: true, shouldUpdateContainers: false });
            this.getContainers();
        }
    }
    componentDidUpdate () {
        if (this.state.shouldUpdateContainers) {
            this.setState({ loading: true, shouldUpdateContainers: false });
            this.getContainers();
        }
    }

    getContainers () {
        $.ajax({
            method: 'GET',
            url: '/admin/api/container',
            dataType: 'json',
            mimeType: 'application/json',
            success: (response) => {
                console.log(response);
                this.setState({loading: false, containers: response.containers, shouldUpdateContainers: false});
            }
        });
    }

    createContainer (e) {
        e.preventDefault();
        if (
            (this.state.creatingNew && (this.state.creatingNew.title === '' || this.state.creatingNew.containerURI === '')) ||
            (this.state.editingContainer && (this.state.editingContainer.title === '' || this.state.editingContainer.containerURI === ''))
        ) {
            this.setState({ creatingNewMessage: 'Title and/or URL cannot be empty' });
        } else {
            this.setState({loading: true, shouldUpdateContainers: false});
            $.ajax({
                method: 'PUT',
                url: '/admin/api/container',
                dataType: 'json',
                mimeType: 'application/json',
                data: this.state.creatingNew,
                success: (response) => {
                    console.log(response);
                    this.setState({loading: false, containers: this.state.containers.concat([response.container]), shouldUpdateContainers: false, creatingNew: false});
                }
            });
        }
    }

    updateContainer (e) {
        e.preventDefault();
        if (
            (this.state.creatingNew && (this.state.creatingNew.title === '' || this.state.creatingNew.containerURI === '')) ||
            (this.state.editingContainer && (this.state.editingContainer.title === '' || this.state.editingContainer.containerURI === ''))
        ) {
            this.setState({ creatingNewMessage: 'Title and/or URL cannot be empty' });
        } else {
            this.setState({loading: true, shouldUpdateContainers: false});
            $.ajax({
                method: 'POST',
                url: '/admin/api/container',
                dataType: 'json',
                mimeType: 'application/json',
                data: this.state.editingContainer,
                success: (response) => {
                    console.log(response);
                    const containers = this.state.containers.map(d => {
                        return d._id === this.state.editingContainer._id ? this.state.editingContainer : d;
                    });

                    this.setState({loading: false, containers: containers, shouldUpdateContainers: false, creatingNew: false, editingContainer: null});
                }
            });
        }
    }

    deleteApproved (container) {
        this.setState({loading: true, shouldUpdateContainers: false});
        $.ajax({
            method: 'DELETE',
            url: '/admin/api/container',
            dataType: 'json',
            mimeType: 'application/json',
            data: {
                id: container._id
            },
            success: (response) => {
                console.log(response);
                this.setState({loading: false, shouldUpdateContainers: true, creatingNew: false});
            }
        });
    }

    render () {
        const containersList = this.state.containers.length
            ? <div className='list-group'>
                {
                    this.state.containers.map((d, i) => {
                        return <div key={i} className='list-group-item'>
                            <span className='lead'>{d.title}</span>
                            <div className='float-right'>
                                { d.published ? <small className='text-success mr-1'>Published</small> : <small className='text-danger mr-1'>Not Published</small> }
                                <div className='btn-group'>
                                    <button type='button' className='btn btn-sm btn-outline-info' onClick={(e) => {
                                        e.preventDefault();
                                        this.setState({editingContainer: d});
                                    }}>Edit</button>
                                    <button type='button' className='btn btn-sm btn-outline-danger' onClick={(e) => {
                                        e.preventDefault();
                                        if (confirm('Do you really want to delete the container: ' + d.title + '?')) {
                                            this.deleteApproved(d);
                                        }
                                    }}>Delete</button>
                                </div>
                            </div>
                        </div>;
                    })
                }
            </div>
            : <h4>There are no containers</h4>;

        var form;
        // CREATING EDITTING FORM
        {
            if (this.state.creatingNew) {
                form = <form className='mt-4 card card-body' id='container-creation' onSubmit={this.createContainer}>
                    {
                        this.state.creatingNewMessage
                            ? <div className='alert alert-danger'>{this.state.creatingNewMessage}</div>
                            : null
                    }
                    <div className='form-group'>
                        <label htmlFor='container-title'>Title</label>
                        <input type='text' name='title' className='form-control' id='container-title' placeholder='Title' value={this.state.creatingNew.title} onChange={this.handleInputChange}/>
                        <small className='form-text text-muted'>This is appear as title of the tab.</small>
                    </div>
                    <div className='form-group'>
                        <label htmlFor='container-uri'>External URL</label>
                        <input type='text' name='containerURI' className='form-control' id='container-uri' placeholder='URL' value={this.state.creatingNew.containerURI} onChange={this.handleInputChange}/>
                        <small className='form-text text-muted'>The URL for the iframe container</small>
                    </div>
                    <div className='form-group'>
                        <label htmlFor='blog-tags'>Tags</label>
                        <Tags tags={this.state.creatingNew.tags}
                            placeholder="Add a tag"
                            onAdded={this.onTagAdded.bind(this)}
                            onRemoved={this.onTagRemoved.bind(this)}/>
                    </div>
                    <div className='form-check'>
                        <input type='checkbox' name='published' className='form-check-input' id='container-published' checked={this.state.creatingNew.published} onChange={this.handleInputChange}/>
                        <label className='form-check-label' htmlFor='container-published'>Published</label>
                        <small id='container-published-help' className='form-text text-muted'></small>
                    </div>
                    <button type='submit' className='btn btn-primary'>Submit</button>
                    <button type='button' className='mt-2 btn btn-sm btn-outline-secondary' onClick={() => { this.setState({shouldUpdateContainers: false, creatingNew: false, creatingNewMessage: null}); }}>Cancel</button>
                </form>;
            } else if (this.state.editingContainer) {
                form = <form className='mt-4 card card-body' id='container-creation' onSubmit={this.updateContainer}>
                    {
                        this.state.creatingNewMessage
                            ? <div className='alert alert-danger'>{this.state.creatingNewMessage}</div>
                            : null
                    }
                    <div className='form-group'>
                        <label htmlFor='container-title'>Title</label>
                        <input type='text' name='title' className='form-control' id='container-title' placeholder='Title' value={this.state.editingContainer.title} onChange={this.handleInputChange}/>
                        <small className='form-text text-muted'>This is appear as title of the tab.</small>
                    </div>
                    <div className='form-group'>
                        <label htmlFor='container-uri'>External URL</label>
                        <input type='text' name='containerURI' className='form-control' id='container-uri' placeholder='URL' value={this.state.editingContainer.containerURI} onChange={this.handleInputChange}/>
                        <small className='form-text text-muted'>The URL for the iframe container</small>
                    </div>
                    <div className='form-group'>
                        <label htmlFor='blog-tags'>Tags</label>
                        <Tags tags={this.state.editingContainer.tags}
                            placeholder="Add a tag"
                            onAdded={this.onTagAdded.bind(this)}
                            onRemoved={this.onTagRemoved.bind(this)}/>
                    </div>
                    <div className='form-check'>
                        <input type='checkbox' name='published' className='form-check-input' id='container-published' checked={this.state.editingContainer.published} onChange={this.handleInputChange}/>
                        <label className='form-check-label' htmlFor='container-published'>Published</label>
                        <small id='container-published-help' className='form-text text-muted'></small>
                    </div>
                    <button type='submit' className='btn btn-primary'>Submit</button>
                    <button type='button' className='mt-2 btn btn-sm btn-outline-secondary' onClick={() => { this.setState({shouldUpdateContainers: false, creatingNew: false, creatingNewMessage: null, editingContainer: null}); }}>Cancel</button>
                </form>;
            } else {
                form = <button className='mt-4 form-control btn btn-sm btn-primary' onClick={() => { this.setState({creatingNew: {title: '', tags: [], containerURI: '', published: false}, shouldUpdateContainers: false}); }}>Create Container</button>;
            }
        }

        return <div id='containers' className='container'>
            <div className='row'>
                <div className='col-md-12 header'>
                    <h2>Containers</h2>
                </div>
                <div className='col-md-12'>
                    {containersList}
                </div>
                <div className='col-md-12'>
                    {form}
                </div>
            </div>
        </div>;
    }

    onTagAdded (tag) {
        const obj = this.state.creatingNew ? _.cloneDeep(this.state.creatingNew) : _.cloneDeep(this.state.editingContainer);
        obj.tags.push(tag);

        this.setState(this.state.creatingNew ? {creatingNew: obj} : {editingContainer: obj});
    }

    onTagRemoved (tag, index) {
        const obj = this.state.creatingNew ? _.cloneDeep(this.state.creatingNew) : _.cloneDeep(this.state.editingContainer);
        obj.tags = obj.tags.filter((tag, i) => i !== index);
        this.setState(this.state.creatingNew ? {creatingNew: obj} : {editingContainer: obj});
    }

    handleInputChange (event) {
        const target = event.target;
        const value = target.type === 'checkbox' ? target.checked : target.value;
        const name = target.name;
        const obj = this.state.creatingNew ? _.cloneDeep(this.state.creatingNew) : _.cloneDeep(this.state.editingContainer);
        obj[name] = value;

        this.setState(this.state.creatingNew ? {creatingNew: obj} : {editingBlog: obj});
    }
}
