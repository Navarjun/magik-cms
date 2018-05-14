/* global $ */
import React from 'react';
import {Link} from 'react-router-dom';
import Editor from 'react-medium-editor';

import 'medium-editor/dist/css/medium-editor.css';
import 'medium-editor/dist/css/themes/default.css';

export class PostEditor extends React.Component {
    constructor (props) {
        super(props);
        this.state = { postId: this.props.id, editorText: '', loading: true };

        this.onChange = this.onChange.bind(this);
        this.save = this.save.bind(this);
    }

    componentDidMount () {
        $.ajax({
            method: 'GET',
            url: '/admin/api/post/' + this.props.id,
            dataType: 'json',
            mimeType: 'application/json',
            success: (response) => {
                console.log(response.post);
                this.setState({ loading: false, editorText: response.post.content });
            }
        });
    }

    save () {
        this.setState({ loading: true });
        $.ajax({
            method: 'POST',
            url: '/admin/api/post',
            dataType: 'json',
            mimeType: 'application/json',
            data: { _id: this.state.postId, content: this.state.editorText },
            success: (response) => {
                console.log(response);
                this.setState({ loading: false });
            }
        });
    }

    render () {
        return <div className='container'>
            <div className='row'>
                <div className='col-sm-12'>
                    <h4>Edit the post</h4>
                </div>
                <div className='col-sm-12'>
                    <small>highlight the text to change size, add links etc.</small>
                </div>
            </div>
            <div className='row editor-container'>
                <div className='col-sm-12'>
                    { this.state.loading ? <div className='loader'></div>
                        : <Editor
                            text={this.state.editorText}
                            onChange={this.onChange}
                            options={{
                                toolbar: {
                                    buttons: ['bold', 'italic', 'underline', 'quote', 'h1', 'h2', 'h3', 'h4', { name: 'anchor', contentDefault: 'Link' }]
                                },
                                anchor: {linkValidation: true}
                            }}
                            placeholder='Write here'
                        />
                    }
                </div>
            </div>
            <div className='row'>
                <div className='col-sm-12'>
                    <button className='mt-5 btn btn-primary' onClick={this.save}>Save</button>
                </div>
            </div>
        </div>;
    }

    onChange (text, editor) {
        this.setState({editorText: editor.getContent()});
    }
}
