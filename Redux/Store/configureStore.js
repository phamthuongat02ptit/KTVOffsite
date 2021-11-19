import { createStore, combineReducers, applyMiddleware, compose } from 'redux';
import thunk from "redux-thunk";
import Login from '../Reducers/login';
import Loading from '../Reducers/loading'; '../Reducers/loading';

const rootReducer = combineReducers(
    {
        userLogin: Login,
        loading:Loading
    }
);
const configureStore = () => {
    return createStore(rootReducer, applyMiddleware(thunk));
}

export default configureStore;