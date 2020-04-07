const utils = {
    truncate(string, length = 5) {
        const trimmedString = string.trim();

        if(trimmedString.length <= length)
            return trimmedString;

        return `${ trimmedString.substring(0, length - 1) }...`;
    }
};

export default utils;