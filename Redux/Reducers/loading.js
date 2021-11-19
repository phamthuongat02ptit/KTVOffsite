import { ACTION_NAME } from "../Constants/loading";

const initialState = false;
const Loading = (state = initialState, action) => {
    switch (action.type) {
        case ACTION_NAME.ToggleLoading:
        state = action.payload;
        return state;
        default:
        return state;
    }
};
export default Loading;
