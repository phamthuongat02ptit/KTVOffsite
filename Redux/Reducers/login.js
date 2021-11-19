import { ACTION_NAME } from "../Constants/login";

const initialState = null;
const Login = (state = initialState, action) => {
    switch (action.type) {
        case ACTION_NAME.SetInfoLogin:
        return {
            ...state,
            ...action.payload,
        };
        case ACTION_NAME.GetInfoLogin:
        return {
            ...state,
            ...action.payload,
        };
        default:
        return state;
    }
};
export default Login;
