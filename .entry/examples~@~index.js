
require('../examples/index.js');

if (module.hot) {
    module.hot.accept('../examples/index.js', function () {
        require('../examples/index.js')
    })
}