define(function() {
    function AddBtn(element) {
        var text = element.append('h1').classed('text centered', true).text('Add more!');
        element.on('click', function() {
            element.classed('inactive', true);
            text.text('Come back later!');
        });
    }
    AddBtn.className = 'add_more';
    return AddBtn;
});