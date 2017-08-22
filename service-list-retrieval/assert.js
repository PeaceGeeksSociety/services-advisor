module.exports = assert;
function assert(label, condition) {
    if (condition) return;
    else throw new Error(label);
}
