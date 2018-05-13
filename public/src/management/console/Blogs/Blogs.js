import React from 'react';
import {Link} from 'react-router-dom';
import _ from 'lodash';
// import TagsInput from 'react-tags-input';
import Tags from 'react-tagging-input';
import '../../../../node_modules/react-tagging-input/src/component/scss/styles.scss';

export class Blogs extends React.Component {
    constructor (props) {
        super(props);
        this.state = { blogs: [], tags: [], loading: true, creatingNew: false, editingBlog: null, creatingNewMessage: null, shouldUpdateBlogs: true };
        this.getBlogs = this.getBlogs.bind(this);
        this.createBlog = this.createBlog.bind(this);
        this.updateBlog = this.updateBlog.bind(this);
        this.deleteApproved = this.deleteApproved.bind(this);
        this.handleInputChange = this.handleInputChange.bind(this);
    }
    componentDidMount () {
        if (this.state.shouldUpdateBlogs) {
            this.setState({ loading: true, shouldUpdateBlogs: false });
            this.getBlogs();
        }
    }
    componentDidUpdate () {
        if (this.state.shouldUpdateBlogs) {
            this.setState({ loading: true, shouldUpdateBlogs: false });
            this.getBlogs();
        }
    }

    getBlogs () {
        $.ajax({
            method: 'GET',
            url: '/admin/api/blog',
            dataType: 'json',
            mimeType: 'application/json',
            success: (response) => {
                console.log(response);
                this.setState({loading: false, blogs: response.blogs, shouldUpdateBlogs: false});
            }
        });
    }

    createBlog (e) {
        e.preventDefault();
        if (!e.currentTarget['title'].value || e.currentTarget['title'].value === '') {
            this.setState({ creatingNewMessage: 'Title cannot be empty' });
        } else {
            this.setState({loading: true, shouldUpdateBlogs: false});
            $.ajax({
                method: 'PUT',
                url: '/admin/api/blog',
                dataType: 'json',
                mimeType: 'application/json',
                data: this.state.creatingNew,
                success: (response) => {
                    console.log(response);
                    this.setState({loading: false, blogs: this.state.blogs.concat([response.blog]), shouldUpdateBlogs: false, creatingNew: false});
                }
            });
        }
    }

    updateBlog (e) {
        e.preventDefault();
        if (!this.state.editingBlog.title || this.state.editingBlog.title === '') {
            this.setState({ creatingNewMessage: 'Title cannot be empty' });
        } else {
            this.setState({loading: true, shouldUpdateBlogs: false});
            $.ajax({
                method: 'POST',
                url: '/admin/api/blog',
                dataType: 'json',
                mimeType: 'application/json',
                data: this.state.editingBlog,
                success: (response) => {
                    console.log('editing', response);
                    const blogs = this.state.blogs.map(d => {
                        return d._id === response.blog._id ? response.blog : d;
                    });
                    this.setState({loading: false, blogs: blogs, shouldUpdateBlogs: false, creatingNew: false, editingBlog: false});
                },
                error: function (err) {
                    console.log(err);
                }
            });
        }
    }

    deleteApproved (blog) {
        this.setState({loading: true, shouldUpdateBlogs: false});
        $.ajax({
            method: 'DELETE',
            url: '/admin/api/blog',
            dataType: 'json',
            mimeType: 'application/json',
            data: {
                id: blog._id
            },
            success: (response) => {
                console.log(response);
                this.setState({loading: false, shouldUpdateBlogs: true, creatingNew: false});
            }
        });
    }

    render () {
        const blogsList = this.state.blogs.length
            ? <div className='list-group'>
                {
                    this.state.blogs.map((d, i) => {
                        return <Link key={i} to={'/blog/' + d._id} className='list-group-item list-group-item-action'>
                            <span className='lead'>{d.title}</span>
                            <div className='float-right'>
                                { d.published ? <small className='text-success mr-1'>Published</small> : <small className='text-danger mr-1'>Not Published</small> }
                                <div className='btn-group'>
                                    <button type='button' className='btn btn-sm btn-outline-info' onClick={(e) => {
                                        e.preventDefault();
                                        this.setState({editingBlog: d});
                                    }}>Edit</button>
                                    <button type='button' className='btn btn-sm btn-outline-danger' onClick={(e) => {
                                        e.preventDefault();
                                        if (confirm('Do you really want to delete the blog: ' + d.title + '?')) {
                                            this.deleteApproved(d);
                                        }
                                    }}>Delete</button>
                                </div>
                            </div>
                        </Link>;
                    })
                }
            </div>
            : <h4>There are no blogs</h4>;

        var form;
        // CREATING EDITTING FORM
        {
            if (this.state.creatingNew) {
                form = <form className='mt-4 card card-body' id='blog-creation' onSubmit={this.createBlog}>
                    {
                        this.state.creatingNewMessage
                            ? <div className='alert alert-danger'>{this.state.creatingNewMessage}</div>
                            : null
                    }
                    <div className='form-group'>
                        <label htmlFor='blog-title'>Title</label>
                        <input type='text' name='title' className='form-control' id='blog-title' value={this.state.creatingNew.title} placeholder='Title' onChange={this.handleInputChange}/>
                        <small id='titleHelp' className='form-text text-muted'>This is appear as title of the tab.</small>
                    </div>
                    <div className='form-group'>
                        <label htmlFor='blog-tags'>Tags</label>
                        <Tags tags={this.state.creatingNew.tags}
                            placeholder="Add a tag"
                            onAdded={this.onTagAdded.bind(this)}
                            onRemoved={this.onTagRemoved.bind(this)}/>
                    </div>
                    <div className='form-group'>
                        <label htmlFor='blog-description'>Description</label>
                        <input type='text' name='description' className='form-control' id='blog-description' placeholder='Description' value={this.state.creatingNew.description} onChange={this.handleInputChange}/>
                    </div>
                    <div className='form-check'>
                        <input type='checkbox' name='published' className='form-check-input' id='blog-published' checked={this.state.creatingNew.published} onChange={this.handleInputChange}/>
                        <label className='form-check-label' htmlFor='blog-published'>Published</label>
                        <small id='blog-published-help' className='form-text text-muted'></small>
                    </div>

                    <button type='submit' className='btn btn-primary'>Submit</button>
                    <button type='button' className='mt-2 btn btn-sm btn-outline-secondary' onClick={() => { this.setState({shouldUpdateBlogs: false, creatingNew: false, creatingNewMessage: null, editingBlog: null}); }}>Cancel</button>
                </form>;
            } else if (this.state.editingBlog) {
                form = <form className='mt-4 card card-body' id='blog-creation' onSubmit={this.updateBlog}>
                    {
                        this.state.creatingNewMessage
                            ? <div className='alert alert-danger'>{this.state.creatingNewMessage}</div>
                            : null
                    }
                    <div className='form-group'>
                        <label htmlFor='blog-title'>Title</label>
                        <input type='text' name='title' className='form-control' id='blog-title' value={this.state.editingBlog.title} placeholder='Title' onChange={this.handleInputChange}/>
                        <small id='titleHelp' className='form-text text-muted'>This is appear as title of the tab.</small>
                    </div>
                    <div className='form-group'>
                        <label htmlFor='blog-tags'>Tags</label>
                        <Tags tags={this.state.editingBlog.tags}
                            placeholder="Add a tag"
                            onAdded={this.onTagAdded.bind(this)}
                            onRemoved={this.onTagRemoved.bind(this)}/>
                        <small id='blog-published-help' className='form-text text-muted'>Use space to seperate between tags</small>
                    </div>
                    <div className='form-group'>
                        <label htmlFor='blog-description'>Description</label>
                        <input type='text' name='description' className='form-control' id='blog-description' placeholder='Description' value={this.state.editingBlog.description} onChange={this.handleInputChange}/>
                    </div>
                    <div className='form-check'>
                        <input type='checkbox' name='published' className='form-check-input' id='blog-published' checked={this.state.editingBlog.published} onChange={this.handleInputChange}/>
                        <label className='form-check-label' htmlFor='blog-published'>Published</label>
                        <small id='blog-published-help' className='form-text text-muted'></small>
                    </div>

                    <button type='submit' className='btn btn-primary'>Submit</button>
                    <button type='button' className='mt-2 btn btn-sm btn-outline-secondary' onClick={() => { this.setState({shouldUpdateBlogs: false, creatingNew: false, creatingNewMessage: null, editingBlog: null}); }}>Cancel</button>
                </form>;
            } else {
                form = <button className='mt-4 form-control btn btn-sm btn-primary' onClick={() => { this.setState({creatingNew: {title: '', tags: [], description: '', published: false}, shouldUpdateBlogs: false}); }}>Create Blog</button>;
            }
        }

        return <div id='blogs' className='container'>
            <div className='row'>
                <div className='col-md-12 header'>
                    <h2>Blogs</h2>
                </div>
                <div className='col-md-12'>
                    {blogsList}
                </div>
                <div className='col-md-12'>
                    {form}
                </div>
            </div>
        </div>;
    }

    onTagAdded (tag) {
        const blog = this.state.creatingNew ? _.cloneDeep(this.state.creatingNew) : _.cloneDeep(this.state.editingBlog);
        blog.tags.push(tag);

        this.setState(this.state.creatingNew ? {creatingNew: blog} : {editingBlog: blog});
    }

    onTagRemoved (tag, index) {
        const blog = this.state.creatingNew ? _.cloneDeep(this.state.creatingNew) : _.cloneDeep(this.state.editingBlog);
        console.log(blog.tags);
        blog.tags = blog.tags.filter((tag, i) => i !== index);
        console.log(blog.tags);
        this.setState(this.state.creatingNew ? {creatingNew: blog} : {editingBlog: blog});
    }

    handleInputChange (event) {
        const target = event.target;
        const value = target.type === 'checkbox' ? target.checked : target.value;
        const name = target.name;
        const blog = this.state.creatingNew ? _.cloneDeep(this.state.creatingNew) : _.cloneDeep(this.state.editingBlog);
        blog[name] = value;

        this.setState(this.state.creatingNew ? {creatingNew: blog} : {editingBlog: blog});
    }
}
