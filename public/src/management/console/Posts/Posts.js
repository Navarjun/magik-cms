/* global $,confirm */
import React from 'react';
import {Link} from 'react-router-dom';
import _ from 'lodash';

import Tags from 'react-tagging-input';
import '../../../../node_modules/react-tagging-input/src/component/scss/styles.scss';

export class Posts extends React.Component {
    constructor (props) {
        super(props);
        this.state = { posts: [], loading: true, creatingNew: false, editingPost: null, creatingNewMessage: null, shouldUpdatePosts: true };
        this.getPosts = this.getPosts.bind(this);
        this.createPost = this.createPost.bind(this);
        this.updatePost = this.updatePost.bind(this);
        this.deleteApproved = this.deleteApproved.bind(this);
        this.handleInputChange = this.handleInputChange.bind(this);
    }
    componentDidMount () {
        if (this.state.shouldUpdatePosts) {
            this.setState({ loading: true, shouldUpdatePosts: false });
            this.getPosts();
        }
    }
    componentDidUpdate () {
        if (this.state.shouldUpdatePosts) {
            this.setState({ loading: true, shouldUpdatePosts: false });
            this.getPosts();
        }
    }

    getPosts () {
        $.ajax({
            method: 'GET',
            url: '/admin/api/post',
            dataType: 'json',
            mimeType: 'application/json',
            data: { blogId: this.props.blogId },
            success: (response) => {
                console.log(response);
                this.setState({loading: false, posts: response, shouldUpdatePosts: false});
            }
        });
    }

    createPost (e) {
        e.preventDefault();
        if (
            (this.state.creatingNew && (this.state.creatingNew.title === '')) ||
            (this.state.editingPost && (this.state.editingPost.title === ''))
        ) {
            this.setState({ creatingNewMessage: 'Title cannot be empty' });
        } else {
            this.setState({loading: true, shouldUpdatePosts: false});
            $.ajax({
                method: 'PUT',
                url: '/admin/api/post',
                dataType: 'json',
                mimeType: 'application/json',
                data: this.state.creatingNew,
                success: (response) => {
                    console.log(response);
                    this.setState({loading: false, posts: this.state.posts.concat([response.post]), shouldUpdatePosts: false, creatingNew: false});
                }
            });
        }
    }

    updatePost (e) {
        e.preventDefault();
        if (
            (this.state.creatingNew && (this.state.creatingNew.title === '')) ||
            (this.state.editingPost && (this.state.editingPost.title === ''))
        ) {
            this.setState({ creatingNewMessage: 'Title cannot be empty' });
        } else {
            console.log(this.state.editingPost);
            this.setState({loading: true, shouldUpdatePosts: false});
            $.ajax({
                method: 'POST',
                url: '/admin/api/post',
                dataType: 'json',
                mimeType: 'application/json',
                data: this.state.editingPost,
                success: (response) => {
                    console.log(response);
                    const posts = this.state.posts.map(d => {
                        return d._id === this.state.editingPost._id ? this.state.editingPost : d;
                    });

                    this.setState({loading: false, posts: posts, shouldUpdatePosts: false, creatingNew: false, editingPost: null});
                }
            });
        }
    }

    deleteApproved (post) {
        this.setState({loading: true, shouldUpdatePosts: false});
        $.ajax({
            method: 'DELETE',
            url: '/admin/api/post',
            dataType: 'json',
            mimeType: 'application/json',
            data: {
                id: post._id
            },
            success: (response) => {
                console.log(response);
                this.setState({loading: false, shouldUpdatePosts: true, creatingNew: false});
            }
        });
    }

    render () {
        const postsList = this.state.posts.length
            ? <div className='list-group'>
                {
                    this.state.posts.map((d, i) => {
                        return <Link key={i} to={'/post/' + d._id} className='list-group-item list-group-item-action'>
                            <span className='lead'>{d.title}</span>
                            <div className='float-right'>
                                { d.published ? <small className='text-success mr-1'>Published</small> : <small className='text-danger mr-1'>Not Published</small> }
                                <div className='btn-group'>
                                    <button type='button' className='btn btn-sm btn-outline-info' onClick={(e) => {
                                        e.preventDefault();
                                        this.setState({editingPost: d});
                                    }}>Edit</button>
                                    <button type='button' className='btn btn-sm btn-outline-danger' onClick={(e) => {
                                        e.preventDefault();
                                        if (confirm('Do you really want to delete the post: ' + d.title + '?')) {
                                            this.deleteApproved(d);
                                        }
                                    }}>Delete</button>
                                </div>
                            </div>
                        </Link>;
                    })
                }
            </div>
            : <h4>There are no posts</h4>;

        var form;
        // CREATING EDITTING FORM
        {
            if (this.state.creatingNew) {
                form = <form className='mt-4 card card-body' id='post-creation' onSubmit={this.createPost}>
                    {
                        this.state.creatingNewMessage
                            ? <div className='alert alert-danger'>{this.state.creatingNewMessage}</div>
                            : null
                    }
                    <div className='form-group'>
                        <label htmlFor='post-title'>Title</label>
                        <input type='text' name='title' className='form-control' id='post-title' placeholder='Title' value={this.state.creatingNew.title} onChange={this.handleInputChange}/>
                        <small className='form-text text-muted'>This is appear as title of the tab.</small>
                    </div>
                    <div className='form-group'>
                        <label htmlFor='post-uri'>Description</label>
                        <input type='text' name='description' className='form-control' id='post-uri' placeholder='description' value={this.state.creatingNew.description} onChange={this.handleInputChange}/>
                        <small className='form-text text-muted'></small>
                    </div>
                    <div className='form-group'>
                        <label htmlFor='blog-tags'>Tags</label>
                        <Tags tags={this.state.creatingNew.tags}
                            placeholder="Add a tag"
                            onAdded={this.onTagAdded.bind(this)}
                            onRemoved={this.onTagRemoved.bind(this)}/>
                    </div>
                    <div className='form-check'>
                        <input type='checkbox' name='published' className='form-check-input' id='post-published' checked={this.state.creatingNew.published} onChange={this.handleInputChange}/>
                        <label className='form-check-label' htmlFor='post-published'>Published</label>
                        <small id='post-published-help' className='form-text text-muted'></small>
                    </div>
                    <button type='submit' className='btn btn-primary'>Submit</button>
                    <button type='button' className='mt-2 btn btn-sm btn-outline-secondary' onClick={() => { this.setState({shouldUpdatePosts: false, creatingNew: false, creatingNewMessage: null}); }}>Cancel</button>
                </form>;
            } else if (this.state.editingPost) {
                form = <form className='mt-4 card card-body' id='post-creation' onSubmit={this.updatePost}>
                    {
                        this.state.creatingNewMessage
                            ? <div className='alert alert-danger'>{this.state.creatingNewMessage}</div>
                            : null
                    }
                    <div className='form-group'>
                        <label htmlFor='post-title'>Title</label>
                        <input type='text' name='title' className='form-control' id='post-title' placeholder='Title' value={this.state.editingPost.title} onChange={this.handleInputChange}/>
                        <small className='form-text text-muted'>This is appear as title of the tab.</small>
                    </div>
                    <div className='form-group'>
                        <label htmlFor='post-uri'>Description</label>
                        <input type='text' name='description' className='form-control' id='post-uri' placeholder='description' value={this.state.editingPost.description} onChange={this.handleInputChange}/>
                        <small className='form-text text-muted'></small>
                    </div>
                    <div className='form-group'>
                        <label htmlFor='blog-tags'>Tags</label>
                        <Tags tags={this.state.editingPost.tags}
                            placeholder="Add a tag"
                            onAdded={this.onTagAdded.bind(this)}
                            onRemoved={this.onTagRemoved.bind(this)}/>
                    </div>
                    <div className='form-check'>
                        <input type='checkbox' name='published' className='form-check-input' id='post-published' checked={this.state.editingPost.published} onChange={this.handleInputChange}/>
                        <label className='form-check-label' htmlFor='post-published'>Published</label>
                        <small id='post-published-help' className='form-text text-muted'></small>
                    </div>
                    <button type='submit' className='btn btn-primary'>Submit</button>
                    <button type='button' className='mt-2 btn btn-sm btn-outline-secondary' onClick={() => { this.setState({shouldUpdatePosts: false, creatingNew: false, creatingNewMessage: null, editingPost: null}); }}>Cancel</button>
                </form>;
            } else {
                form = <button className='mt-4 form-control btn btn-sm btn-primary' onClick={() => { this.setState({creatingNew: {title: '', tags: [], description: '', published: false, blogId: this.props.blogId}, shouldUpdatePosts: false}); }}>Create Post</button>;
            }
        }

        return <div id='posts' className='post'>
            <div className='row'>
                <div className='col-md-12 header'>
                    <h2>Posts</h2>
                </div>
                <div className='col-md-12'>
                    {postsList}
                </div>
                <div className='col-md-12'>
                    {form}
                </div>
            </div>
        </div>;
    }

    onTagAdded (tag) {
        const obj = this.state.creatingNew ? _.cloneDeep(this.state.creatingNew) : _.cloneDeep(this.state.editingPost);
        obj.tags.push(tag);

        this.setState(this.state.creatingNew ? {creatingNew: obj} : {editingPost: obj});
    }

    onTagRemoved (tag, index) {
        const obj = this.state.creatingNew ? _.cloneDeep(this.state.creatingNew) : _.cloneDeep(this.state.editingPost);
        obj.tags = obj.tags.filter((tag, i) => i !== index);
        this.setState(this.state.creatingNew ? {creatingNew: obj} : {editingPost: obj});
    }

    handleInputChange (event) {
        const target = event.target;
        const value = target.type === 'checkbox' ? target.checked : target.value;
        const name = target.name;
        const obj = this.state.creatingNew ? _.cloneDeep(this.state.creatingNew) : _.cloneDeep(this.state.editingPost);
        obj[name] = value;

        this.setState(this.state.creatingNew ? {creatingNew: obj} : {editingPost: obj});
    }
}
