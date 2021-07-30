import React from 'react';
import ReactDOM from 'react-dom';
import './index.scss';
import { App } from './components/App';
import reportWebVitals from './reportWebVitals';
import { ThemeProvider } from '@fluentui/react';
import { theme } from './theme';
import { Provider } from 'react-redux';
import { store } from './store/store';

ReactDOM.render(
    <React.StrictMode>
        <Provider store={store}>
            <ThemeProvider theme={theme} applyTo="body">
                <App />
            </ThemeProvider>;
        </Provider>
    </React.StrictMode>,
    document.getElementById('root')
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
