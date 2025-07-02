import { toast } from "react-hot-toast";

const Toast = {
    success: (msg) => toast.success(msg),
    error: (msg) => toast.error(msg),
    loading: (msg) => toast.loading(msg),
    dismiss: (id) => toast.dismiss(id),
    promise: (promise, messages) =>
        toast.promise(promise, {
            loading: messages.loading,
            success: messages.success,
            error: messages.error,
        }),
};

export default Toast;
