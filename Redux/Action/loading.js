import { ACTION_NAME } from "../Constants/loading";

export function ToggleLoading(isLoading) {
    return {
        type: ACTION_NAME.ToggleLoading,
        payload: isLoading,
    };
};
