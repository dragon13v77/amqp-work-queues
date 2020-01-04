module.exports = {
    wait: function (timeInMs) {
        return new Promise(function (resolve) {
            return setTimeout(resolve, timeInMs);
        });

    }
}