const Helpers = {
    isEmail: (str) => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(str)
    },
    __: (str) => {
        return yay_reviews_data.i18n[str] || str;
    }
}
export const __ = Helpers.__;
export default Helpers;