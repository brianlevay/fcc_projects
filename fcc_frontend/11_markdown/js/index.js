'use strict';

// This section uses React to continually updated the DOM as a user is typing into a text box.  This code below creates the virtual DOM section that holds both the input textarea and the displayed markup //

var MarkedSection = React.createClass({
  displayName: 'MarkedSection',

  getInitialState: function getInitialState() {
    return { value: '' };
  },
  updateText: function updateText(e) {
    this.setState({ value: e.target.value });
  },
  createMarkdown: function createMarkdown() {
    var contents = this.state.value;
    var cleaned = contents.replace(/[<>]/g, '');
    var markedContents = marked(cleaned);
    return { __html: markedContents };
  },
  render: function render() {
    return React.createElement(
      'div',
      { className: 'shell' },
      React.createElement(
        'div',
        { className: 'inputSect' },
        React.createElement(
          'span',
          { className: 'titleText' },
          'Enter Your Text Here'
        ),
        React.createElement('textarea', { className: 'textInput',
          value: this.state.value,
          onChange: this.updateText
        })
      ),
      React.createElement(
        'div',
        { className: 'outputSect' },
        React.createElement(
          'span',
          { className: 'titleText' },
          'See It Styled Here'
        ),
        React.createElement('div', { dangerouslySetInnerHTML: this.createMarkdown() })
      )
    );
  }
});

// This renders the virtual DOM contents within the container section //

ReactDOM.render(React.createElement(MarkedSection, null), document.getElementById('containerSect'));