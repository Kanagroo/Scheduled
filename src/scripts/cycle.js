var addButton = document.getElementById('cycle-content-add');
var phase_template = document.getElementById('cycle-content-template');
var bin_template = document.getElementById('cycle-content-bin-template')
var phase_container = document.getElementById('cycle-body-content');
var bin_container = document.getElementById('cycle-body-content-bins');

var saved_data = {
    'days': [
        [{'time':'','name':''}]
    ]
}

var getPhasesAmount = () => {
    let phases = document.getElementsByClassName('cycle-content-object');
    return phases.length;
}

function removePhase(e) {
    if (getPhasesAmount() <= 1)
        return;

    var bins = document.getElementsByClassName('cycle-content-bin');
    var phases = document.getElementsByClassName('cycle-content-object');
    let phase = 0;
    for (let i=0;i<bins.length;i++) {
        if (bins[i] == e)
            break;
        phase++;
    }
    phases[phase].remove();
    bins[phase].remove();
    if (getPhasesAmount() <= 1)
        bins[0].remove();
}

function addPhase() {
    var phase_node = phase_template.content.cloneNode(true);
    var bin_node = bin_template.content.cloneNode(true);
    phase_container.insertBefore(phase_node, addButton);
    bin_container.innerHTML = '';
    if (getPhasesAmount() > 1) {
        for (let i=0;i<getPhasesAmount();i++) {
            bin_container.appendChild(bin_node.cloneNode(true));
        }
    }
}



addPhase();
addButton.addEventListener('click', addPhase);
