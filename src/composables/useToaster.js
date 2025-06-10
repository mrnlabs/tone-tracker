import { toast } from "vue3-toastify";
import "vue3-toastify/dist/index.css";

/**
 * Author: Mazisi Msebele
 * Date: 26 Jun 2024
 * 
 * 
 */
/**
 * Returns an object with two functions: `success` and `error`.
 * 
 * `success` displays a success notification with the provided message for 2000 milliseconds.
 * 
 * `error` displays an error notification with the provided message for 2000 milliseconds.
 * 
 * `warning` displays an warning notification with the provided message for 2000 milliseconds.
 * 
 * @param {string} message - The message to be displayed in the notification.
 * @return {Object} An object with two functions: `success` and `error`.
 */
export default function useToaster() {
    // Function to display success notification
    const success = (message) => {
        toast.success(message, { autoClose: 2000 });
    };

    // Function to display error notification
    const error = (message) => {
        toast.error(message, { autoClose: 2000 });
    };

    const warning = (message) => {
        toast.warning(message, { autoClose: 2000 });
    };

    return {
        success,
        error,
        warning
    };
}