import React from 'react';
import Tags from 'react-tagging-input';
import 'bootstrap';
import '../../../../node_modules/react-tagging-input/src/component/scss/styles.scss';

export class BlogDetails extends React.Component {
    constructor (props) {
        super(props);
        const s = { loading: false, show: !!props.show, createNew: true, buttonsEnabled: true };
        if (props.blog) {
            s.createNew = false;
            s.blog = props.blog;
        } else {
            s.blog = {
                title: '',
                uri: '',
                published: false,
                tags: [],
                description: ''
            };
        }
        this.state = s;
        this.onPublishAction = this.onPublishAction.bind(this);
        this.onTagAdded = this.onTagAdded.bind(this);
        this.onTagRemoved = this.onTagRemoved.bind(this);
        this.onTitleChange = this.onTitleChange.bind(this);
        this.onUriChange = this.onUriChange.bind(this);
        this.onDescriptionChange = this.onDescriptionChange.bind(this);
        this.submit = this.submit.bind(this);
    }

    componentWillReceiveProps (props) {
        const s = {};
        if (props.blog) {
            s.createNew = false;
            s.blog = props.blog;
        } else {
            s.createNew = true;
            s.blog = {
                title: '',
                uri: '',
                published: false,
                tags: [],
                description: ''
            };
        }
        this.setState(s);
    }

    onTagAdded (tag) {
        const blog = this.state.blog;
        blog.tags = [...blog.tags, tag];
        this.setState({
            blog: blog
        });
    }
    onTagRemoved (tag, index) {
        const blog = this.state.blog;
        blog.tags = blog.tags.filter((tag, i) => i !== index);
        this.setState({
            blog: blog
        });
    }
    onPublishAction () {
        var blog = this.state.blog;
        blog.published = !blog.published;
        this.setState({blog: blog});
    }
    onTitleChange (event) {
        var blog = this.state.blog;
        blog.title = event.target.value;
        this.setState({blog: blog});
    }
    onUriChange (event) {
        var blog = this.state.blog;
        blog.uri = event.target.value;
        this.setState({blog: blog});
    }
    onDescriptionChange (event) {
        var blog = this.state.blog;
        blog.description = event.target.value;
        this.setState({blog: blog});
    }

    submit () {
        this.setState({loading: true, buttonsEnabled: false});
        if (this.state.createNew) {
            $.post('/admin/api/blog/create', this.state.blog)
                .done((response) => {
                    if (response.message === 'success') {
                        this.setState({loading: false, buttonsEnabled: true});
                        window.location.reload();
                    } else {
                        this.setState({loading: false, buttonsEnabled: true});
                    }
                }).fail((err) => {
                    const state = {loading: false, buttonsEnabled: true};
                    if (err.responseJSON && err.responseJSON.message) {
                        state.errMessage = err.responseJSON.message;
                    }
                    this.setState(state);
                });
        } else {
            $.post('/admin/api/blog/edit', this.state.blog, function (response) {
                if (response.message === 'success') {
                    console.log(response.data);
                } else {
                    this.setState({loading: false, buttonsEnabled: true});
                }
            });
        }
    }

    render () {
        var body = <div className='loader'/>;
        const tags = this.state.blog.tags || [];
        if (this.state.loading) {
            body = <div className='loader'/>;
        } else {
            body = <div className='col-sm-12'>
                <form>
                    <div className='form-group'>
                        <label htmlFor='title'>Title</label>
                        <input type='text' className='form-control' id='title' placeholder='Title of the blog' value={this.state.blog.title} onChange={this.onTitleChange}/>
                    </div>
                    <div className='form-group'>
                        <label htmlFor='uri'>URI</label>
                        <input type='text' className='form-control' id='uri' placeholder='URI of the blog' value={this.state.blog.uri} onChange={this.onUriChange}/>
                    </div>
                    <div className="form-group form-check">
                        <input type="checkbox" className="form-check-input" id="published" checked={this.state.blog.published} onChange={this.onPublishAction}/>
                        <label className="form-check-label" htmlFor="published">Published </label>
                    </div>
                    <div className="form-group">
                        <label htmlFor='tags'>Tags</label>
                        <Tags tags={tags}
                            placeholder="Add a tag"
                            onAdded={this.onTagAdded}
                            onRemoved={this.onTagRemoved} />
                    </div>
                    <div className='form-group'>
                        <label htmlFor='description'>Description</label>
                        <textarea type='text' className='form-control' id='description' placeholder='description' rows='5' onChange={this.onDescriptionChange} value={this.state.blog.description}>
                        </textarea>
                    </div>
                </form>
            </div>;
        }
        const btnsDisabled = !this.state.buttonsEnabled;
        const errMessage = this.state.errMessage
            ? <div className='col-sm-12'><div className='alert alert-danger'>{this.state.errMessage}</div></div>
            : null;

        return <div className='modal fade' id="create-blog" tabIndex="-1">
            <div className="modal-dialog modal-lg">
                <div className="modal-content">
                    <div className="modal-header">
                        <h5 className="modal-title" id="exampleModalLabel">Blog Details</h5>
                        <button type="button" className="close" data-dismiss="modal" aria-label="Close" disabled={btnsDisabled}>
                            <span aria-hidden="true">&times;</span>
                        </button>
                    </div>
                    <div className="modal-body">
                        {errMessage}
                        {body}
                    </div>
                    <div className="modal-footer">
                        <button type="button" className="btn btn-secondary" data-dismiss="modal" disabled={btnsDisabled}>Close</button>
                        <button type="button" className="btn btn-primary" disabled={btnsDisabled} onClick={this.submit}>{ this.state.createNew ? 'Create blog' : 'Save blog' }</button>
                    </div>
                </div>
            </div>
        </div>;
    }
}
