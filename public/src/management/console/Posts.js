import React from 'react';
import {BlogDetails} from './Blog/BlogDetails';
import * as $ from 'jquery';

export class Posts extends React.Component {
    constructor (props) {
        super(props);
        this.state = {loading: true, blogs: [], edittingBlog: undefined};
        this.editBlog = this.editBlog.bind(this);
    }
    componentDidMount () {
        $.get('/admin/api/blogs', (response) => {
            console.log(response);
            this.setState({loading: false, blogs: response.data});
        });
    }

    editBlog (blogId, event) {
        this.setState({edittingBlog: this.state.blogs.filter(d => d._id === blogId)[0]});
    }
    deleteBlog (blogId, event) {
        $.post('/admin/api/delete', {type: 'blog', id: blogId}, (response) => {
            if (response && response.message === 'success') {
                this.setState({blogs: this.state.blogs.filter(d => d._id !== blogId)});
            }
        });
    }

    render () {
        if (this.state.loading) {
            return (<div className='row'><div className='loader'/></div>);
        }
        const blogList = this.state.blogs.length === 0
            ? <h2>There are no blogs yet</h2>
            : <ul className='list-group'>
                {this.state.blogs.map((blog, i) => {
                    return <li className='list-group-item' key={i}>
                        <span className='float-left'>
                            {blog.title}
                        </span>
                        <span className='float-right'>
                            <div className="btn-group" role="group" aria-label="...">
                                <button type="button" className="btn btn-sm btn-warning" data-toggle='modal' data-target='#create-blog' onClick={this.editBlog.bind(this, blog._id)}>Edit</button>
                                <button type="button" className="btn btn-sm btn-danger" onClick={this.deleteBlog.bind(this, blog._id)}>Delete</button>
                            </div>
                        </span>
                    </li>;
                })}
            </ul>;
        var list = <div className='row'>
            <div className='col-sm-12 section-header'>
                <div className='row'>
                    <div className='col-sm-10'>
                        <h1>Blogs</h1>
                    </div>
                    <div className='col-sm-2'>
                        <button type='button' className='float-right btn btn-sm btn-primary' data-toggle='modal' data-target='#create-blog' onClick={() => this.setState({edittingBlog: undefined})}>
                        Create Blog
                        </button>
                    </div>
                </div>
                <BlogDetails blog={this.state.edittingBlog}/>
            </div>
            <div className='col-sm-12'>
                {blogList}
            </div>
        </div>;

        return list;
    }
}
