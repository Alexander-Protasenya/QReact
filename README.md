![QReact – lightweight reactive JavaScript library](https://github.com/Alexander-Protasenya/QReact/blob/main/logo.png)

It is NOT an alternative of [React](https://react.dev/) library (not for production use). This project is a challenge. First of all, it is attempt to deeply understand concepts of [React](https://react.dev/) & JSX. Also, I wanted to check, if I can implement this or not)

You can use it as educational project. Code is as simple as possible, has comments, less than 400 lines of code. It is one of the smallest reactive JS libraries.

## Technical goals
* No references to other packages.
* No global variables (no usage of "window" object).
* No setTimout/setInterval functions.
* No new syntax (this library re-implements standard signatures of [React](https://react.dev/)).
* Full implementation of shadow DOM (DOM element updates only when DOM has changes).
* Support only [Class component approach](https://react.dev/reference/react/component).
* ECMAScript 2019. Final bundle without "downgraded" syntax too (no "var" & etc.).
* Only "strict mode".

## API
Inside QReact.Component, you can use:

* this.props
* this.state
* this.render()
* this.componentDidMount()
* this.componentWillUnmount()
* this.setState(nextState, callback)
* this.shouldComponentUpdate(nextProps, nextState)

All of them have behavior the same as provided in React 18.2.0.

You can use "Function components" too, but without hooks & state.

## How does it work?
First of all, [babel](https://babeljs.io/docs/babel-plugin-transform-react-jsx) transforms JSX code to JavaScript. All JSX nodes converts into JavaScript calls of "createElement" function (name of this function is configurable, but main point is that function has predefined signature).
This transformation is NOT part of application. It is part of bundle generation. It means that the published web application should not have reference to [babel](https://babeljs.io/docs/babel-plugin-transform-react-jsx).
So, to implement any reactive library based on JSX, you need to configure [babel](https://babeljs.io/docs/babel-plugin-transform-react-jsx), and implement "createElement" function. This function creates virtual shadow DOM hierarchy.
The final step: library should provide ways to update shadow/real DOM.
Current implementation does it in the following way:
1)	"createElement" creates shadow DOM.
2)	Some trigger informs system that DOM element should be updated, for example by calling setState(...) or when props of parent element were changed.
3)	System generates new version of target shadow DOM element & compares it with the old version. If changes are found, system updates real DOM element.
No magic)
Note: this library does not use functions for "reading" state of real HTML elements. It only uses functions for "updating" HTML. All information about current state of real DOM is taken from shadow DOM. I think, it is a good approach, otherwise the concept of shadow DOM does not make sense.

Source code of library is located in single file "src\QReact".

Example of usage is located in "demo" folder. It is a Kanban board.

## Quick start
1. Install packages (all these packages only for development mode - "devDependencies")

```sh
npm install
```

2. Start server

```sh
npm run demostart
```

3. Open http://localhost:3000/ in your browser

if you need build library only

```sh
npm run build
```

## Roadmap
* Add more examples of using (ideally, example per feature).
* Add support of "<>" (short form of "React.Fragment").
* Add support of propTypes validation by using [prop-types](https://www.npmjs.com/package/prop-types) package.
* Add support of [Higher-Order Components (HOC)](https://legacy.reactjs.org/docs/higher-order-components.html). Looks like, it should not be part of this library, possible it can work "out of the box", but it has not been tested.

P.S. Currently, "Class component" approach, propTypes validation & using JavaScript (instead of TypeScript) are kind of deprecated technologies. However, many systems still use them. There is a small chance that this library will replaces [React](https://react.dev/) for some these systems. Of course, if I have time and motivation to maintain it)
